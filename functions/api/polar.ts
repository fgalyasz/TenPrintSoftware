import {
  incrementPurchase,
  productFromPolar,
  rememberPolarDelivery,
  utcDay,
  type StatsKV,
} from "../_lib/stats";

type Env = {
  DOWNLOAD_STATS?: StatsKV;
  POLAR_WEBHOOK_SECRET?: string;
};

const encoder = new TextEncoder();

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function decodeSecret(secret: string): ArrayBuffer {
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function hmacDigest(secret: ArrayBuffer, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function signaturesOf(header: string): string[] {
  return header
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("v1,"))
    .map((part) => part.slice(3));
}

async function polarSignatureValid(
  secret: string,
  webhookId: string,
  timestamp: string,
  body: string,
  header: string,
): Promise<boolean> {
  const expected = await hmacDigest(decodeSecret(secret), `${webhookId}.${timestamp}.${body}`);
  return signaturesOf(header).some((actual) => actual === expected);
}

function timestampFresh(value: string, now = Date.now()): boolean {
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return false;
  return Math.abs(now / 1000 - seconds) <= 300;
}

async function isValidPolarRequest(
  secret: string,
  webhookId: string,
  timestamp: string,
  body: string,
  signature: string,
): Promise<boolean> {
  if (!timestampFresh(timestamp)) return false;
  return polarSignatureValid(secret, webhookId, timestamp, body, signature);
}

async function handlePaidOrder(
  env: Env,
  payload: Record<string, unknown>,
  webhookId: string,
): Promise<Response> {
  if (!env.DOWNLOAD_STATS) return json(503, { error: "stats_unbound" });
  const firstSeen = await rememberPolarDelivery(env.DOWNLOAD_STATS, webhookId, new Date().toISOString());
  if (!firstSeen) return json(200, { ok: true, duplicate: true });
  const product = productFromPolar(payload);
  if (!product) return json(200, { ok: true, ignored: true });
  await incrementPurchase(env.DOWNLOAD_STATS, product, utcDay());
  return json(200, { ok: true });
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const secret = context.env.POLAR_WEBHOOK_SECRET;
  if (!secret) return json(503, { error: "webhook_unconfigured" });
  const webhookId = context.request.headers.get("webhook-id") ?? "";
  const timestamp = context.request.headers.get("webhook-timestamp") ?? "";
  const signature = context.request.headers.get("webhook-signature") ?? "";
  const body = await context.request.text();
  if (!webhookId || !(await isValidPolarRequest(secret, webhookId, timestamp, body, signature))) {
    return json(401, { error: "invalid_signature" });
  }
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (payload.type !== "order.paid") return json(200, { ok: true, ignored: true });
  return handlePaidOrder(context.env, payload, webhookId);
};
