import { readFileSync, writeFileSync, existsSync } from "node:fs";

const PRODUCTS_FILE = new URL("../src/data/products.ts", import.meta.url).pathname;
const SIBLING_ROOT = new URL("../../", import.meta.url).pathname;

const SOURCES = [
  { slug: "snappyzones", repo: "SnappyZones", dmg: "SnappyZones" },
  { slug: "sessionguard", repo: "SessionGuard", dmg: "SessionGuard" },
  {
    slug: "walkaway",
    repo: "WalkAway",
    dmg: "WalkAway",
    githubLatestDmg: "https://github.com/fgalyasz/WalkAway/releases/latest/download/WalkAway.dmg",
  },
];

function readLocalVersion(repo) {
  const path = `${SIBLING_ROOT}${repo}/docs/version.txt`;
  if (!existsSync(path)) return null;
  const version = readFileSync(path, "utf8").trim();
  return /^\d+\.\d+\.\d+$/.test(version) ? version : null;
}

function blockOf(source, slug) {
  const start = source.indexOf(`slug: "${slug}"`);
  if (start === -1) throw new Error(`product not found: ${slug}`);
  const end = source.indexOf("slug: \"", start + 1);
  return { start, end: end === -1 ? source.length : end };
}

function currentVersion(block) {
  return block.match(/version: "([^"]+)"/)?.[1] ?? null;
}

function rewriteBlock(block, version, dmg, slug, githubLatestDmg) {
  const next = block.replace(/version: "[^"]+"/, `version: "${version}"`);
  if (githubLatestDmg) return applyGithubDownload(next, githubLatestDmg);
  return applySiteDownload(next, version, dmg, slug);
}

function applyGithubDownload(block, url) {
  return block.replace(/downloadUrl: "[^"]+"/, `downloadUrl: "${url}"`);
}

function applySiteDownload(block, version, dmg, slug) {
  const nested = new RegExp(`downloads/${slug}/${dmg}-[^"]+\\.dmg`);
  if (nested.test(block)) {
    return block.replace(nested, `downloads/${slug}/${dmg}-${version}.dmg`);
  }
  const flat = new RegExp(`downloads/${dmg}-[^"]+\\.dmg`);
  return block.replace(flat, `downloads/${dmg}-${version}.dmg`);
}

function syncProduct(source, entry) {
  const version = readLocalVersion(entry.repo);
  if (!version) {
    console.log(`${entry.slug.padEnd(14)} skipped — no local version.txt`);
    return source;
  }
  const { start, end } = blockOf(source, entry.slug);
  const block = source.slice(start, end);
  const previous = currentVersion(block);
  if (previous === version) {
    console.log(`${entry.slug.padEnd(14)} ${version} already current`);
    return source;
  }
  console.log(`${entry.slug.padEnd(14)} ${previous} -> ${version}`);
  return source.slice(0, start) + rewriteBlock(block, version, entry.dmg, entry.slug, entry.githubLatestDmg) + source.slice(end);
}

const original = readFileSync(PRODUCTS_FILE, "utf8");
const updated = SOURCES.reduce(syncProduct, original);

if (updated !== original) {
  writeFileSync(PRODUCTS_FILE, updated);
  console.log("\nproducts.ts updated");
} else {
  console.log("\nno changes");
}
