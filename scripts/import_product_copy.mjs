import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outputRoot = resolve(here, "../src/i18n/products");

const sources = {
  snappyzones: "/Users/galyaszf/DevProjects/SnappyZones/docs/script.js",
  sessionguard: "/Users/galyaszf/DevProjects/SessionGuard/docs/script.js",
};

function readDictionary(path) {
  const source = readFileSync(path, "utf8");
  const start = source.indexOf("const i18n = {");
  const open = source.indexOf("{", start);
  let depth = 0;
  let end = -1;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }
  return new Function(`return ${source.slice(open, end)};`)();
}

function pick(dictionary, fallback, key) {
  const value = dictionary[key];
  return typeof value === "string" && value.length > 0 ? value : fallback[key];
}

function buildFeatures(dictionary, fallback, tiers) {
  return Object.entries(tiers).map(([index, tier]) => ({
    tier,
    title: pick(dictionary, fallback, `features.card${index}.title`),
    text: pick(dictionary, fallback, `features.card${index}.text`),
  }));
}

function buildSteps(dictionary, fallback, prefix, count) {
  return Array.from({ length: count }, (_, offset) => ({
    title: pick(dictionary, fallback, `${prefix}.step${offset + 1}.title`),
    text: pick(dictionary, fallback, `${prefix}.step${offset + 1}.text`),
  }));
}

function buildFaq(dictionary, fallback, count) {
  return Array.from({ length: count }, (_, offset) => ({
    question: pick(dictionary, fallback, `faq.q${offset + 1}`),
    answer: pick(dictionary, fallback, `faq.a${offset + 1}`),
  }));
}

function buildRoadmap(dictionary, fallback, indexes) {
  return indexes.map((index) => ({
    title: pick(dictionary, fallback, `coming.item${index}.title`),
    text: pick(dictionary, fallback, `coming.item${index}.text`),
  }));
}

const snappyZonesTiers = {
  1: "free",
  2: "free",
  3: "free",
  4: "free",
  5: "free",
  6: "free",
  7: "pro",
  8: "pro",
  9: "pro",
  10: "pro",
  11: "pro",
  12: "pro",
  13: "free",
  14: "free",
};

function mapSnappyZones(dictionary, fallback) {
  return {
    tagline: pick(dictionary, fallback, "brand.tagline"),
    headline: pick(dictionary, fallback, "hero.title"),
    summary: pick(dictionary, fallback, "hero.subtitle"),
    differentiator: pick(dictionary, fallback, "hero.differentiator"),
    badges: ["macos", "fast", "custom", "privacy"].map((badge) =>
      pick(dictionary, fallback, `hero.badge.${badge}`),
    ),
    featuresTitle: pick(dictionary, fallback, "features.title"),
    featuresSubtitle: pick(dictionary, fallback, "features.subtitle"),
    features: buildFeatures(dictionary, fallback, snappyZonesTiers),
    howTitle: pick(dictionary, fallback, "how.title"),
    howSubtitle: pick(dictionary, fallback, "how.subtitle"),
    how: buildSteps(dictionary, fallback, "how", 3),
    quickStartTitle: pick(dictionary, fallback, "quick.title"),
    quickStartSubtitle: pick(dictionary, fallback, "quick.subtitle"),
    quickStart: buildSteps(dictionary, fallback, "quick", 4),
    faq: buildFaq(dictionary, fallback, 8),
    installTitle: pick(dictionary, fallback, "install.title"),
    install: [1, 2, 3, 4].map((step) => pick(dictionary, fallback, `install.step${step}`)),
    downloadNotice: pick(dictionary, fallback, "download.notice"),
    roadmapTitle: pick(dictionary, fallback, "coming.title"),
    roadmapSubtitle: pick(dictionary, fallback, "coming.subtitle"),
    roadmapInProgress: pick(dictionary, fallback, "coming.badge"),
    roadmapPlanned: pick(dictionary, fallback, "coming.planned"),
    roadmap: buildRoadmap(dictionary, fallback, [3, 4, 5, 6, 7, 8]),
    editionFree: pick(dictionary, fallback, "tier.free"),
    editionPro: pick(dictionary, fallback, "tier.pro"),
    proTitle: pick(dictionary, fallback, "pro.title"),
    proBlurb: pick(dictionary, fallback, "pro.blurb"),
  };
}

function mapSessionGuard(dictionary, fallback) {
  return {
    tagline: pick(dictionary, fallback, "brand.tagline"),
    headline: pick(dictionary, fallback, "hero.title"),
    summary: pick(dictionary, fallback, "hero.subtitle"),
    differentiator: pick(dictionary, fallback, "hero.differentiator"),
    badges: ["macos", "menu", "timed", "privacy"].map((badge) =>
      pick(dictionary, fallback, `hero.badge.${badge}`),
    ),
    featuresTitle: pick(dictionary, fallback, "features.title"),
    featuresSubtitle: pick(dictionary, fallback, "features.subtitle"),
    features: buildFeatures(
      dictionary,
      fallback,
      { 1: "free", 2: "free", 3: "free", 4: "free", 5: "free", 6: "free" },
    ),
    howTitle: pick(dictionary, fallback, "how.title"),
    howSubtitle: pick(dictionary, fallback, "how.subtitle"),
    how: buildSteps(dictionary, fallback, "how", 3),
    quickStartTitle: pick(dictionary, fallback, "quick.title"),
    quickStartSubtitle: pick(dictionary, fallback, "quick.subtitle"),
    quickStart: buildSteps(dictionary, fallback, "quick", 4),
    faq: buildFaq(dictionary, fallback, 6),
    installTitle: pick(dictionary, fallback, "install.title"),
    install: [1, 2, 3, 4].map((step) => pick(dictionary, fallback, `install.step${step}`)),
    downloadNotice: pick(dictionary, fallback, "download.notice"),
  };
}

function writeLocales(slug, dictionaries, mapper) {
  const fallback = dictionaries.en;
  mkdirSync(resolve(outputRoot, slug), { recursive: true });
  for (const [language, dictionary] of Object.entries(dictionaries)) {
    const payload = mapper(dictionary, fallback);
    const target = resolve(outputRoot, slug, `${language}.json`);
    writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`wrote ${slug}/${language}.json`);
  }
}

writeLocales("snappyzones", readDictionary(sources.snappyzones), mapSnappyZones);
writeLocales("sessionguard", readDictionary(sources.sessionguard), mapSessionGuard);
