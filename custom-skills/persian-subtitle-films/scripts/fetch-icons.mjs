#!/usr/bin/env node
/*
 * fetch-icons.mjs — download Material Symbols Outlined SVGs into a project and
 * regenerate modules/icons.js so the render needs no network.
 *
 *   node fetch-icons.mjs --project videos/<slug> movie_edit terminal subtitles
 *
 * Icons land in <project>/icons/<name>.svg; the module exposes
 * window.icon("<name>") and builds an inline <svg> with every path.
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const p = args.indexOf("--project");
if (p < 0) {
  console.error("usage: node fetch-icons.mjs --project <dir> <icon> [icon …]");
  process.exit(1);
}
const project = path.resolve(args[p + 1]);
const names = args.slice(p + 2).filter((a) => !a.startsWith("--"));

if (!names.length) {
  console.error("give at least one icon name, e.g. movie_edit terminal");
  process.exit(1);
}
if (!/^[a-z0-9_]+$/.test(names.join(""))) {
  console.error("icon names are lowercase snake_case Material Symbol names");
  process.exit(1);
}

const base =
  "https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web";
const iconDir = path.join(project, "icons");
const moduleDir = path.join(project, "modules");
fs.mkdirSync(iconDir, { recursive: true });
fs.mkdirSync(moduleDir, { recursive: true });

for (const name of names) {
  const url = `${base}/${name}/materialsymbolsoutlined/${name}_24px.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`✗ ${name}: HTTP ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  fs.writeFileSync(path.join(iconDir, `${name}.svg`), await res.text());
  console.log(`✓ ${name}`);
}

const files = fs.readdirSync(iconDir).filter((f) => f.endsWith(".svg")).sort();
let out =
  "/* Material Symbols Outlined (Apache-2.0) — inlined paths, no network at render time. */\n";
out += "(function (g) {\n  var ICON = {};\n";
for (const f of files) {
  const name = f.replace(/\.svg$/, "");
  const raw = fs.readFileSync(path.join(iconDir, f), "utf8");
  const paths = [...raw.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  out += `  ICON[${JSON.stringify(name)}] = [${paths.map((d) => JSON.stringify(d)).join(",")}];\n`;
}
out += `  g.ICON = ICON;
  g.icon = function(name, cls){ var p = ICON[name] || []; return '<svg class="mi ' + (cls||"") + '" viewBox="0 -960 960 960" aria-hidden="true">' + p.map(function(d){ return '<path d="' + d + '"/>'; }).join("") + '</svg>'; };
})(window);
`;
fs.writeFileSync(path.join(moduleDir, "icons.js"), out);
console.log(`modules/icons.js — ${files.length} icons`);
