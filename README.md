# TenPrint Software — company website

The company site and product catalogue for [tenprintsoftware.com](https://tenprintsoftware.com),
built with Astro and deployed as a static site on Cloudflare Pages.

The individual product sites (`snappyzones.com`, `sessionguard.net`) stay live and
independent. This site links to them for downloads and keeps its own marketing copy.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Getting started

```bash
npm install
npm run dev
```

The dev server serves the site at `http://localhost:4321`. The root URL runs a small
client-side script that redirects to a language folder, using a previously stored choice
(`tp-language` in `localStorage`) and otherwise `navigator.languages`. Open `/en/`
directly to bypass detection.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Astro dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built output locally |
| `npm run check` | Astro and TypeScript diagnostics |
| `npm run check:i18n` | Verify every locale has the same keys as English |
| `npm run sync:versions` | Read each product's `docs/version.txt` and update `src/data/products.ts` |
| `npm run build:og` | Regenerate Open Graph images into `public/assets/og/` |
| `npm run deploy` | Upload `dist/` to Cloudflare Pages |

## Project layout

```
src/
  components/     Reusable UI: header, footer, cards, forms, maze backdrop
  data/           Product catalogue (versions, pricing, download URLs) and site config
  i18n/
    config.ts     Supported languages
    ui/           Company-site UI strings, one file per language
    products/     Per-product marketing copy, one JSON file per language
  layouts/        BaseLayout with SEO, hreflang, theme bootstrap
  lib/            Maze generation used by the backdrop and OG images
  pages/
    [lang]/       Every localised page
    index.astro   Root language detection and redirect
  styles/         Design tokens and global CSS
functions/api/    Cloudflare Pages Function for the contact form
scripts/          Build and maintenance scripts
public/           Static assets, _headers, _redirects, robots.txt
```

## Adding a product

1. Add an entry to `PRODUCTS` in `src/data/products.ts` with slug, accent colours,
   version, download URL, and pricing tiers.
2. Create `src/i18n/products/<slug>/en.json` using an existing product as the template,
   then add one file per language.
3. Add any new pricing perk keys to `src/i18n/ui/en.ts` and every other locale.
4. Drop the icon into `public/assets/products/` and screenshots into
   `src/assets/products/<slug>/`.
5. Run `npm run check:i18n` and `npm run build`.

The products page, pricing page, downloads page, navigation dropdown, and sitemap all
read from `PRODUCTS`, so no page needs editing.

## Internationalisation

Ten languages: `en`, `de`, `fr`, `es`, `hu`, `cs`, `sk`, `pl`, `ro`, `ru`. English is the
reference and the fallback — a missing key falls back to English rather than rendering
blank.

`npm run check:i18n` compares every locale against English and fails on a missing or
extra key, and also checks that each product JSON has the same shape as its English
original. Run it before every commit that touches copy.

Legal pages are English-only by design; every locale shows a short note explaining that
and offering help in the reader's language.

## Contact form

`functions/api/contact.ts` handles `POST /api/contact`. It validates the payload, drops
submissions that fill the hidden honeypot field, rate-limits per IP when a KV namespace
is bound, and sends mail through Resend.

Copy `.env.example` to `.dev.vars` for local runs with `wrangler pages dev`, and set the
same variables in the Cloudflare Pages project for production. Without `RESEND_API_KEY`
the endpoint returns 502 and the form shows its error state.

## Deployment

```bash
npm run build
npm run deploy
```

`public/_headers` sets security headers and caching, `public/_redirects` maps
locale-less paths such as `/products/` to their English equivalents. Both are copied into
`dist/` untouched by the build.
