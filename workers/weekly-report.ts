type Env = {
  DOWNLOAD_STATS: KVNamespace;
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
};

const PRODUCTS = ["snappyzones", "sessionguard", "walkaway"] as const;

function mondayUtc(now: Date): Date {
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
}

function weekRange(now = new Date()): { from: string; to: string } {
  const thisMonday = mondayUtc(now);
  const lastMonday = new Date(thisMonday);
  lastMonday.setUTCDate(lastMonday.getUTCDate() - 7);
  return { from: lastMonday.toISOString().slice(0, 10), to: thisMonday.toISOString().slice(0, 10) };
}

function dayInRange(day: string, from: string, to: string): boolean {
  return day >= from && day < to;
}

async function listNames(store: KVNamespace, prefix: string): Promise<string[]> {
  const names: string[] = [];
  let cursor: string | undefined;
  for (;;) {
    const page = await store.list({ prefix, cursor });
    for (const key of page.keys) names.push(key.name);
    if (page.list_complete) break;
    cursor = page.cursor;
  }
  return names;
}

function parseDownloadKey(name: string): { product: string; kind: string; day: string } | null {
  const match = name.match(/^dl:([^:]+):([^:]+):(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  return { product: match[1], kind: match[2], day: match[3] };
}

function parsePurchaseKey(name: string): { product: string; day: string } | null {
  const match = name.match(/^buy:([^:]+):(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;
  return { product: match[1], day: match[2] };
}

async function sumDownloads(
  store: KVNamespace,
  from: string,
  to: string,
): Promise<Record<string, { install: number; update: number }>> {
  const totals: Record<string, { install: number; update: number }> = {};
  for (const product of PRODUCTS) totals[product] = { install: 0, update: 0 };
  const names = await listNames(store, "dl:");
  for (const name of names) {
    const parsed = parseDownloadKey(name);
    if (!parsed || !dayInRange(parsed.day, from, to) || !totals[parsed.product]) continue;
    const amount = Number((await store.get(name)) ?? "0");
    if (parsed.kind === "install" || parsed.kind === "update") {
      totals[parsed.product][parsed.kind] += amount;
    }
  }
  return totals;
}

async function sumPurchases(store: KVNamespace, from: string, to: string): Promise<Record<string, number>> {
  const totals: Record<string, number> = {};
  for (const product of PRODUCTS) totals[product] = 0;
  const names = await listNames(store, "buy:");
  for (const name of names) {
    const parsed = parsePurchaseKey(name);
    if (!parsed || !dayInRange(parsed.day, from, to) || totals[parsed.product] === undefined) continue;
    totals[parsed.product] += Number((await store.get(name)) ?? "0");
  }
  return totals;
}

function formatProductLines(
  downloads: Record<string, { install: number; update: number }>,
  purchases: Record<string, number>,
): string {
  return PRODUCTS.map((product) =>
    [
      product,
      `  installs (dmg)  ${downloads[product].install}`,
      `  updates (zip)   ${downloads[product].update}`,
      `  pro purchases   ${purchases[product]}`,
    ].join("\n"),
  ).join("\n\n");
}

function untilDate(to: string): string {
  const lastDay = new Date(`${to}T00:00:00Z`);
  lastDay.setUTCDate(lastDay.getUTCDate() - 1);
  return lastDay.toISOString().slice(0, 10);
}

function reportBody(
  from: string,
  to: string,
  downloads: Record<string, { install: number; update: number }>,
  purchases: Record<string, number>,
): string {
  return [
    `TenPrint weekly report`,
    `${from} → ${untilDate(to)} (UTC)`,
    "",
    formatProductLines(downloads, purchases),
    "",
    "installs = first-run DMG from the site. updates = Sparkle zip.",
    "pro purchases = Polar order.paid. Same DMG for free and Pro.",
  ].join("\n");
}

async function sendReport(env: Env, subject: string, text: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM ?? "TenPrint Software <noreply@tenprintsoftware.com>",
      to: [env.CONTACT_TO ?? "hello@tenprintsoftware.com"],
      subject,
      text,
    }),
  });
  return response.ok;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const range = weekRange();
    const downloads = await sumDownloads(env.DOWNLOAD_STATS, range.from, range.to);
    const purchases = await sumPurchases(env.DOWNLOAD_STATS, range.from, range.to);
    const subject = `TenPrint weekly — ${range.from} to ${untilDate(range.to)}`;
    const delivered = await sendReport(env, subject, reportBody(range.from, range.to, downloads, purchases));
    if (!delivered) throw new Error("weekly report email failed");
  },
};
