import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(here, "../public/assets/og");

const WIDTH = 1200;
const HEIGHT = 630;
const CELL = 42;

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function mazePath(seed) {
  const random = createRandom(seed);
  const columns = Math.ceil(WIDTH / CELL);
  const rows = Math.ceil(HEIGHT / CELL);
  let data = "";
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const left = column * CELL + 3;
      const top = row * CELL + 3;
      const right = left + CELL - 6;
      const bottom = top + CELL - 6;
      data +=
        random() < 0.5
          ? `M${left} ${bottom}L${right} ${top}`
          : `M${left} ${top}L${right} ${bottom}`;
    }
  }
  return data;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function logoMark(x, y, size, accent, accentSoft) {
  const scale = size / 48;
  const lattice =
    "M9 9L19 19M19 19L29 9M29 9L39 19M9 29L19 19M19 19L29 29M29 29L39 19M9 29L19 39M19 39L29 29M29 29L39 39";
  return `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <defs>
        <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accentSoft}"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#mark)"/>
      <path d="${lattice}" fill="none" stroke="#070810" stroke-width="3.4"
        stroke-linecap="round" stroke-opacity="0.92"/>
    </g>`;
}

function template({ eyebrow, title, subtitle, accent, accentSoft, seed }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="78%" cy="18%" r="72%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.03"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#070810"/>
  <path d="${mazePath(seed)}" stroke="url(#fade)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="${accent}"/>

  ${logoMark(72, 68, 62, accent, accentSoft)}

  <text x="152" y="98" font-family="Inter, Helvetica, Arial, sans-serif" font-size="25"
    font-weight="600" fill="#ffffff" opacity="0.94">TenPrint Software</text>
  <text x="152" y="126" font-family="Inter, Helvetica, Arial, sans-serif" font-size="17"
    font-weight="400" fill="#ffffff" opacity="0.5">tenprintsoftware.com</text>

  <text x="72" y="300" font-family="JetBrains Mono, Menlo, monospace" font-size="17"
    font-weight="500" letter-spacing="3" fill="${accentSoft}">${escapeXml(eyebrow.toUpperCase())}</text>

  <text x="72" y="378" font-family="Inter, Helvetica, Arial, sans-serif" font-size="62"
    font-weight="680" letter-spacing="-2" fill="#ffffff">${escapeXml(title)}</text>

  <text x="72" y="440" font-family="Inter, Helvetica, Arial, sans-serif" font-size="27"
    font-weight="400" fill="#ffffff" opacity="0.66">${escapeXml(subtitle)}</text>

  <rect x="72" y="512" width="${WIDTH - 144}" height="1" fill="#ffffff" opacity="0.12"/>
  <text x="72" y="556" font-family="Inter, Helvetica, Arial, sans-serif" font-size="19"
    font-weight="450" fill="#ffffff" opacity="0.44">macOS 13+ · No accounts · No tracking · One-time licences</text>
</svg>`;
}

const images = [
  {
    file: "default.png",
    eyebrow: "Independent Mac software studio",
    title: "Small, sharp software for macOS",
    subtitle: "Utilities that do one job properly, then get out of your way.",
    accent: "#4c7dff",
    accentSoft: "#8bb4ff",
    seed: 1001,
  },
  {
    file: "snappyzones.png",
    eyebrow: "Window management",
    title: "SnappyZones",
    subtitle: "Create custom layouts. Snap windows into zones.",
    accent: "#7c5cff",
    accentSoft: "#a48bff",
    seed: 2002,
  },
  {
    file: "sessionguard.png",
    eyebrow: "Session control",
    title: "SessionGuard",
    subtitle: "Keep your Mac session awake, without the twitch.",
    accent: "#14b8a6",
    accentSoft: "#5eead4",
    seed: 3003,
  },
  {
    file: "walkaway.png",
    eyebrow: "Session control",
    title: "WalkAway",
    subtitle: "Lock when you leave. Jobs keep running.",
    accent: "#ea580c",
    accentSoft: "#fb923c",
    seed: 4004,
  },
];

mkdirSync(outputDir, { recursive: true });

for (const image of images) {
  const svg = template(image);
  const target = resolve(outputDir, image.file);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(target);
  console.log(`wrote assets/og/${image.file}`);
}

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 48 48">
  <defs>
    <linearGradient id="tp" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8bb4ff"/>
      <stop offset="100%" stop-color="#4c7dff"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="12" fill="url(#tp)"/>
  <path d="M9 9L19 19M19 19L29 9M29 9L39 19M9 29L19 19M19 19L29 29M29 29L39 19M9 29L19 39M19 39L29 29M29 29L39 39"
    fill="none" stroke="#070810" stroke-width="3.4" stroke-linecap="round" stroke-opacity="0.92"/>
</svg>`;

await sharp(Buffer.from(logoSvg)).png({ compressionLevel: 9 }).toFile(resolve(outputDir, "logo.png"));
console.log("wrote assets/og/logo.png");

writeFileSync(resolve(outputDir, ".gitkeep"), "", "utf8");
