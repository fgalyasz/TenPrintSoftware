export type ProductSlug = "snappyzones" | "sessionguard" | "walkaway";
export type DownloadKind = "install" | "update";

export type DownloadHit = {
  product: ProductSlug;
  kind: DownloadKind;
};

export type StatsKV = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
};

const PRODUCT_FOLDERS = new Set(["snappyzones", "sessionguard", "walkaway"]);

const POLAR_PRODUCT_IDS: Record<string, ProductSlug> = {
  "ba9392f4-ff14-4f16-bfeb-f093354a2b4d": "snappyzones",
};

export function utcDay(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function downloadKey(hit: DownloadHit, day: string): string {
  return `dl:${hit.product}:${hit.kind}:${day}`;
}

export function purchaseKey(product: ProductSlug, day: string): string {
  return `buy:${product}:${day}`;
}

export function polarKey(webhookId: string): string {
  return `polar:${webhookId}`;
}

export function parseDownloadPath(pathname: string): DownloadHit | null {
  const match = pathname.match(/^\/downloads\/([^/]+)\/[^/]+\.(dmg|zip)$/i);
  if (!match) return null;
  const product = match[1].toLowerCase();
  if (!PRODUCT_FOLDERS.has(product)) return null;
  const kind: DownloadKind = match[2].toLowerCase() === "dmg" ? "install" : "update";
  return { product: product as ProductSlug, kind };
}

export async function incrementKey(store: StatsKV, key: string): Promise<void> {
  const count = Number((await store.get(key)) ?? "0");
  await store.put(key, String(count + 1));
}

export async function incrementDownload(store: StatsKV, hit: DownloadHit, day: string): Promise<void> {
  await incrementKey(store, downloadKey(hit, day));
}

export async function incrementPurchase(store: StatsKV, product: ProductSlug, day: string): Promise<void> {
  await incrementKey(store, purchaseKey(product, day));
}

export async function rememberPolarDelivery(store: StatsKV, webhookId: string, receivedAt: string): Promise<boolean> {
  const key = polarKey(webhookId);
  if (await store.get(key)) return false;
  await store.put(key, receivedAt);
  return true;
}

export function productFromPolar(payload: Record<string, unknown>): ProductSlug | null {
  const data = asRecord(payload.data);
  const product = asRecord(data?.product);
  const productId = asString(product?.id) ?? asString(data?.product_id);
  if (productId && POLAR_PRODUCT_IDS[productId]) return POLAR_PRODUCT_IDS[productId];
  const name = `${asString(product?.name) ?? ""} ${asString(data?.description) ?? ""}`.toLowerCase();
  if (name.includes("snappyzones")) return "snappyzones";
  if (name.includes("sessionguard")) return "sessionguard";
  if (name.includes("walkaway")) return "walkaway";
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
