type Env = {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  CONTACT_RATE_LIMIT?: KVNamespace;
};

type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

type Submission = {
  kind: string;
  language: string;
  name: string;
  email: string;
  product: string;
  topic: string;
  system: string;
  message: string;
  reference: string;
};

const MAX_FIELD_LENGTH = 5000;
const MIN_MESSAGE_LENGTH = 5;
const RATE_LIMIT_WINDOW_SECONDS = 3600;
const RATE_LIMIT_MAX = 5;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function readField(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value.trim().slice(0, MAX_FIELD_LENGTH) : "";
}

function toSubmission(payload: Record<string, unknown>): Submission {
  return {
    kind: readField(payload, "kind") || "support",
    language: readField(payload, "language") || "en",
    name: readField(payload, "name"),
    email: readField(payload, "email"),
    product: readField(payload, "product") || "general",
    topic: readField(payload, "topic") || "other",
    system: readField(payload, "system"),
    message: readField(payload, "message"),
    reference: readField(payload, "reference"),
  };
}

function isValid(submission: Submission): boolean {
  const emailLooksReal = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(submission.email);
  return emailLooksReal && submission.message.length >= MIN_MESSAGE_LENGTH;
}

async function isRateLimited(env: Env, address: string): Promise<boolean> {
  if (!env.CONTACT_RATE_LIMIT) return false;
  const key = `contact:${address}`;
  const count = Number((await env.CONTACT_RATE_LIMIT.get(key)) ?? "0");
  if (count >= RATE_LIMIT_MAX) return true;
  await env.CONTACT_RATE_LIMIT.put(key, String(count + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return false;
}

function buildSubject(submission: Submission): string {
  const scope = submission.product === "general" ? "General" : submission.product;
  return `[${submission.kind}] ${scope} — ${submission.topic}`;
}

function buildBody(submission: Submission, address: string): string {
  return [
    `Kind:     ${submission.kind}`,
    `Product:  ${submission.product}`,
    `Topic:    ${submission.topic}`,
    `Name:     ${submission.name || "—"}`,
    `Email:    ${submission.email}`,
    `System:   ${submission.system || "—"}`,
    `Language: ${submission.language}`,
    `IP:       ${address}`,
    "",
    submission.message,
  ].join("\n");
}

async function sendEmail(env: Env, submission: Submission, address: string): Promise<boolean> {
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
      reply_to: submission.email,
      subject: buildSubject(submission),
      text: buildBody(submission, address),
    }),
  });
  return response.ok;
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;
  const address = request.headers.get("CF-Connecting-IP") ?? "unknown";

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const submission = toSubmission(payload);

  if (submission.reference.length > 0) return json(202, { ok: true });
  if (!isValid(submission)) return json(422, { error: "validation_failed" });
  if (await isRateLimited(env, address)) return json(429, { error: "rate_limited" });

  const delivered = await sendEmail(env, submission, address);
  if (!delivered) return json(502, { error: "delivery_failed" });

  return json(200, { ok: true });
};
