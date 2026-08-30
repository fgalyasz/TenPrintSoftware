import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const UI_DIR = new URL("../src/i18n/ui/", import.meta.url).pathname;
const PRODUCTS_DIR = new URL("../src/i18n/products/", import.meta.url).pathname;
const KEY_PATTERN = /^\s{2}"([^"]+)":/gm;
const REFERENCE = "en";

function readKeys(file) {
  const source = readFileSync(join(UI_DIR, file), "utf8");
  return new Set(Array.from(source.matchAll(KEY_PATTERN), (match) => match[1]));
}

function localeFiles() {
  return readdirSync(UI_DIR).filter((file) => file.endsWith(".ts") && file !== "index.ts");
}

function difference(left, right) {
  return [...left].filter((key) => !right.has(key));
}

function reportLocale(file, reference) {
  const keys = readKeys(file);
  const missing = difference(reference, keys);
  const extra = difference(keys, reference);
  const status = missing.length === 0 && extra.length === 0 ? "ok" : "MISMATCH";
  console.log(`${file.padEnd(8)} ${String(keys.size).padStart(3)} keys  ${status}`);
  missing.forEach((key) => console.log(`  missing: ${key}`));
  extra.forEach((key) => console.log(`  extra:   ${key}`));
  return missing.length + extra.length;
}

function readProduct(slug, language) {
  const path = join(PRODUCTS_DIR, slug, `${language}.json`);
  return JSON.parse(readFileSync(path, "utf8"));
}

function shapeOf(value) {
  if (Array.isArray(value)) return `array(${value.length})`;
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value).sort().join(",")}}`;
  }
  return typeof value;
}

function reportProduct(slug, language, reference) {
  const copy = readProduct(slug, language);
  const keys = new Set(Object.keys(copy));
  const missing = difference(new Set(Object.keys(reference)), keys);
  const mismatched = Object.keys(reference).filter(
    (key) => keys.has(key) && shapeOf(copy[key]) !== shapeOf(reference[key]),
  );
  const status = missing.length === 0 && mismatched.length === 0 ? "ok" : "MISMATCH";
  console.log(`${slug}/${language}.json`.padEnd(30) + status);
  missing.forEach((key) => console.log(`  missing: ${key}`));
  mismatched.forEach((key) =>
    console.log(`  shape:   ${key} — ${shapeOf(copy[key])} vs ${shapeOf(reference[key])}`),
  );
  return missing.length + mismatched.length;
}

function reportProductSlug(slug) {
  const reference = readProduct(slug, REFERENCE);
  return readdirSync(join(PRODUCTS_DIR, slug))
    .filter((file) => file.endsWith(".json") && file !== `${REFERENCE}.json`)
    .map((file) => file.replace(".json", ""))
    .reduce((total, language) => total + reportProduct(slug, language, reference), 0);
}

const reference = readKeys(`${REFERENCE}.ts`);
console.log(`UI reference ${REFERENCE}.ts has ${reference.size} keys\n`);

let problems = localeFiles()
  .filter((file) => file !== `${REFERENCE}.ts`)
  .reduce((total, file) => total + reportLocale(file, reference), 0);

console.log("\nproduct copy");
problems += readdirSync(PRODUCTS_DIR).reduce(
  (total, slug) => total + reportProductSlug(slug),
  0,
);

process.exitCode = problems === 0 ? 0 : 1;
