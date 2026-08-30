import type { APIRoute } from "astro";
import { LANGUAGE_CODES, DEFAULT_LANGUAGE } from "~/i18n/config";
import { localePath } from "~/i18n";
import { PRODUCTS } from "~/data/products";
import { SITE } from "~/data/site";

const STATIC_PATHS = [
  "",
  "products",
  "pricing",
  "downloads",
  "support",
  "feedback",
  "about",
  "legal/privacy",
  "legal/terms",
  "legal/refund",
];

function absolute(path: string): string {
  return new URL(path, SITE.url).toString();
}

function entry(path: string): string {
  const alternates = LANGUAGE_CODES.map(
    (code) =>
      `    <xhtml:link rel="alternate" hreflang="${code}" href="${absolute(localePath(code, path))}"/>`,
  ).join("\n");

  return LANGUAGE_CODES.map(
    (code) => `  <url>
    <loc>${absolute(localePath(code, path))}</loc>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(localePath(DEFAULT_LANGUAGE, path))}"/>
    <changefreq>weekly</changefreq>
    <priority>${path === "" ? "1.0" : "0.7"}</priority>
  </url>`,
  ).join("\n");
}

export const GET: APIRoute = () => {
  const paths = [...STATIC_PATHS, ...PRODUCTS.map((product) => `products/${product.slug}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths.map(entry).join("\n")}
</urlset>
`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
