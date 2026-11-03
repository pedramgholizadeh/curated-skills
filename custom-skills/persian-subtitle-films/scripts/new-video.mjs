#!/usr/bin/env node
/*
 * new-video.mjs — scaffold a Persian subtitle film project from the skill template.
 *
 *   node new-video.mjs <slug> [--title "…"] [--duration 8]
 *                            [--format 2x1|9x16] [--brand brand.json] [--force]
 *
 * Creates ./videos/<slug>/ with the HyperFrames project, fonts, HyperMotion, the
 * SRT tool and empty input/renders/notes folders. The brand file rewrites the CSS
 * token block in the scaffold, so nothing downstream has to know the colours.
 *
 * GSAP is NOT copied (its licence does not allow redistribution): put
 * node_modules/gsap/dist/gsap.min.js at videos/<slug>/assets/vendor/gsap.min.js
 * before the first check.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(here, "..");

const FORMATS = {
  "2x1": { width: 1920, height: 960, safeX: 192, safeY: 96 },
  "9x16": { width: 1080, height: 1920, safeX: 60, safeY: 130 },
};

const DEFAULT_BRAND = {
  name: "نام برند",
  domain: "example.com",
  accent: "#55e6a5",
  accentDeep: "#2fb87e",
  micro: "#e8fe51",
  ground: "#1d1d1d",
  groundDeep: "#181818",
  font: "Vazirmatn",
};

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith("--"));
const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

if (!slug) {
  console.error(
    'usage: node new-video.mjs <slug> [--title "…"] [--duration 8] [--format 2x1|9x16] [--brand brand.json] [--force]',
  );
  process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("slug must be kebab-case: lowercase letters, digits, dashes");
  process.exit(1);
}

const formatName = flag("format", "2x1");
const format = FORMATS[formatName];
if (!format) {
  console.error(`unknown --format "${formatName}" (have: ${Object.keys(FORMATS).join(", ")})`);
  process.exit(1);
}

const brandPath = flag("brand", null);
let brand = DEFAULT_BRAND;
if (brandPath) {
  if (!fs.existsSync(brandPath)) {
    console.error(`brand file not found: ${brandPath}`);
    process.exit(1);
  }
  brand = { ...DEFAULT_BRAND, ...JSON.parse(fs.readFileSync(brandPath, "utf8")) };
}

const title = flag("title", slug.replace(/-/g, " "));
const duration = Number(flag("duration", "8"));
const force = args.includes("--force");

const template = path.join(skillRoot, "templates", "video-2x1");
const dest = path.join(process.cwd(), "videos", slug);

if (fs.existsSync(dest) && !force) {
  console.error(`refusing to overwrite ${dest} (pass --force to replace)`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(template, dest, { recursive: true, force: true });

for (const dir of ["input", "renders", "notes", "tools"]) {
  fs.mkdirSync(path.join(dest, dir), { recursive: true });
}

fs.copyFileSync(path.join(skillRoot, "scripts", "srt.mjs"), path.join(dest, "tools", "srt.mjs"));

/* --- canvas + brand tokens: one pass over every HTML file ---------------- */

const htmlFiles = [path.join(dest, "index.html")];
for (const dir of ["compositions", "modules"]) {
  const d = path.join(dest, dir);
  if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith(".html")) htmlFiles.push(path.join(d, f));
}

const hex = (v) => (v.startsWith("#") || v.startsWith("rgb") ? v : null);
const pairs = [
  ['data-width="1920"', `data-width="${format.width}"`],
  ['data-height="960"', `data-height="${format.height}"`],
  ["--color-accent: #55e6a5;", `--color-accent: ${hex(brand.accent) || DEFAULT_BRAND.accent};`],
  ["--color-accent-deep: #2fb87e;", `--color-accent-deep: ${hex(brand.accentDeep) || DEFAULT_BRAND.accentDeep};`],
  ["--color-micro: #e8fe51;", `--color-micro: ${hex(brand.micro) || DEFAULT_BRAND.micro};`],
  ["--color-ground: #1d1d1d;", `--color-ground: ${hex(brand.ground) || DEFAULT_BRAND.ground};`],
  ["--safe-x: 192px;", `--safe-x: ${format.safeX}px;`],
  ["--safe-y: 96px;", `--safe-y: ${format.safeY}px;`],
  ["نام برند", brand.name],
  ["example.com", brand.domain],
];

let touched = 0;
for (const file of htmlFiles) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  for (const [from, to] of pairs) if (from !== to) text = text.split(from).join(to);
  if (text !== before) {
    fs.writeFileSync(file, text, "utf8");
    touched++;
  }
}

/* --- project docs ------------------------------------------------------- */

for (const file of ["SPEC.md", "brief.md"]) {
  const p = path.join(dest, file);
  if (!fs.existsSync(p)) continue;
  fs.writeFileSync(
    p,
    fs
      .readFileSync(p, "utf8")
      .replaceAll("__SLUG__", slug)
      .replaceAll("__TITLE__", title)
      .replaceAll("__DURATION__", String(duration))
      .replaceAll("__FORMAT__", `${format.width} × ${format.height} (${formatName})`),
    "utf8",
  );
}

const index = fs.readFileSync(path.join(dest, "index.html"), "utf8");
fs.writeFileSync(
  path.join(dest, "index.html"),
  index.replace(/(<div\s+id="root"[\s\S]*?data-duration=")[\d.]+(")/, `$1${duration}$2`),
  "utf8",
);

fs.writeFileSync(
  path.join(dest, "CREDITS.md"),
  [
    "# Credits",
    "",
    `- **${brand.font}** — SIL Open Font License 1.1 — https://github.com/rastikerdar/vazirmatn`,
    "- **GSAP 3** — standard no-charge licence — https://gsap.com/licensing/ (installed locally, not committed)",
    "- **HyperFrames** — Apache-2.0 — https://github.com/heygen-com/hyperframes",
    "- Motion, layout and look: this project (`assets/hypermotion.js`, `index.html`).",
    "",
  ].join("\n"),
  "utf8",
);

console.log(`created videos/${slug}/ — ${format.width}×${format.height} ${formatName}, ${touched} html file(s) retokened`);
console.log("");
console.log("next:");
console.log(`  1. put the subtitle file at videos/${slug}/input/script.fa.srt`);
console.log(`  2. node videos/${slug}/tools/srt.mjs all videos/${slug} --format ${formatName}`);
console.log(`  3. drop GSAP at videos/${slug}/assets/vendor/gsap.min.js`);
console.log(`  4. cd videos/${slug} && npx hyperframes check --json`);
console.log(`  5. cd videos/${slug} && npx hyperframes snapshot --at 0.2,1.5,4 --out review/stills`);
console.log(
  `  6. cd videos/${slug} && npx hyperframes render -o renders/${slug}_${formatName}.mp4 --quality delivery --workers 2 --video-bitrate 12M --max-bitrate 14M`,
);
if (formatName === "9x16") {
  console.log("");
  console.log(
    "note: 9:16 re-canvas is automatic, but the 2:1 title and end-card layouts need vertical",
  );
  console.log("       repositioning — see references/formats.md for the proven numbers.");
}
