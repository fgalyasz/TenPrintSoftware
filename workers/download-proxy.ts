import { incrementDownload, parseDownloadPath, utcDay, type StatsKV } from "../functions/_lib/stats";

type Env = {
  DOWNLOAD_STATS: StatsKV;
  ORIGIN?: string;
};

function originUrl(request: Request, originHost: string): string {
  const url = new URL(request.url);
  url.hostname = originHost;
  url.protocol = "https:";
  return url.toString();
}

async function recordIfDownload(env: Env, pathname: string): Promise<void> {
  const hit = parseDownloadPath(pathname);
  if (!hit) return;
  await incrementDownload(env.DOWNLOAD_STATS, hit, utcDay());
}

function originHeaders(request: Request): Headers {
  const headers = new Headers();
  const range = request.headers.get("Range");
  if (range !== null) headers.set("Range", range);
  return headers;
}

function originInit(request: Request): RequestInit {
  return { method: request.method, headers: originHeaders(request) };
}

export default {
  async fetch(request: Request, env: Env, _context: ExecutionContext): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (request.method === "GET") {
      await recordIfDownload(env, pathname);
    }
    const origin = originUrl(request, env.ORIGIN ?? "tenprint-software.pages.dev");
    return fetch(origin, originInit(request));
  },
};
