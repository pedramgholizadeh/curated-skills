#!/usr/bin/env node
// Validate reel scenarios against the brand-reels grammar. Exits non-zero on any hard error.
//   node validate.mjs                 all scenes in every data/reels/*.json
//   node validate.mjs <k1> <k2>       specific reel keys
//   node validate.mjs --brand=brand   read domain/cta from brand.json instead of defaults
//
// Rules are language-agnostic (any script). Brand-specific copy (domain, CTA line) is
// read from the brand config so the skill stays reusable.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const REELS_DIR = join(ROOT, 'data', 'reels');

const argv = process.argv.slice(2);
const flag = (name, dflt) => { const a = argv.find((x) => x.startsWith(`--${name}=`)); return a ? a.split('=').slice(1).join('=') : dflt; };
const BRAND = flag('brand', 'brand');
const brand = (() => {
  for (const p of [join(ROOT, `${BRAND}.json`), join(ROOT, 'brand.json')]) {
    if (existsSync(p)) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { /* fall through */ } }
  }
  return {};
})();

const LAYOUTS = ['hook', 'problem', 'statement', 'features', 'compare', 'offer', 'cta'];
const MAX_CHARS = { hook: 26, h1: 30, body: 42, cta: 26, slam: 14, label: 34 };
const strip = (t) => String(t).replace(/\*/g, '');
// Any question mark: Latin ?, Arabic/Persian ؟, Spanish ¿.
const IS_QUESTION = /[؟?¿]/;
// CTA must avoid counts/prices: reject any digit anywhere in the CTA copy.
const HAS_DIGIT = /[0-9٠-٩۰-۹]/;
// Emoji / pictographs have no font glyph on the canvas.
const IS_EMOJI = /[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u;

const DOMAIN = brand.domain || '';
const CTA_LINE = brand.ctaLine || '';

const keys = argv.filter((a) => !a.startsWith('--'));
const list = keys.length ? keys : (existsSync(REELS_DIR)
  ? readdirSync(REELS_DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')) : []);

function timeline(reel) {
  const bpm = reel.bpm || brand.bpm || 112, beat = 60 / bpm; let acc = 0;
  const scenes = reel.scenes.map((s) => { const start = +acc.toFixed(4); acc += s.dur; return { ...s, start, end: +acc.toFixed(4) }; });
  const cuts = scenes.map((s) => s.start);
  const cta = scenes.find((s) => s.layout === 'cta');
  return { beat, dur: +acc.toFixed(4), scenes, cuts, ctaStart: cta ? cta.start : null };
}

let bad = 0;
for (const key of list) {
  const file = join(REELS_DIR, `${key}.json`);
  if (!existsSync(file)) continue;
  const errs = [], warns = [];
  let reel, TL;
  try { reel = JSON.parse(readFileSync(file, 'utf8')); TL = timeline(reel); }
  catch (e) { console.log(`${key}: UNPARSEABLE — ${e.message}`); bad++; continue; }
  const emotional = !!reel.emotional;

  if (TL.dur > 60) errs.push(`total ${TL.dur}s exceeds 60s`);
  if (TL.dur < 20) errs.push(`total ${TL.dur}s too short`);
  if (reel.scenes.length < 4 || reel.scenes.length > 7) errs.push(`${reel.scenes.length} scenes (want 4–7)`);

  const hook = reel.scenes[0];
  if (hook.layout !== 'hook') errs.push('scene 1 must be layout=hook');
  if (!emotional) {
    const hookText = (hook.lines || []).concat(hook.items || []).map((l) => (typeof l === 'string' ? l : l.text)).join(' ');
    if (!IS_QUESTION.test(hookText)) errs.push('hook must be a QUESTION about the viewer\'s problem (end with ?)');
    const sol = reel.scenes.find((s) => s.layout === 'features' && (s.items || []).length >= 3);
    if (!sol) errs.push('no solution scene introducing the offer (features with >=3 items)');
  }

  const last = reel.scenes[reel.scenes.length - 1];
  if (last.layout !== 'cta') errs.push('last scene must be layout=cta');
  if (!last.direct && !CTA_LINE) errs.push('cta needs a `direct` line telling viewers how to reach out');
  if (HAS_DIGIT.test(String(last.direct || '')) || HAS_DIGIT.test(String(last.site || '')))
    errs.push('cta must not mention numbers/price');
  if (DOMAIN && !new RegExp(DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(last.site || ''))
    errs.push(`cta needs \`site\` = ${DOMAIN}`);

  for (const s of reel.scenes) {
    const at = s.id || s.layout;
    if (!LAYOUTS.includes(s.layout)) { errs.push(`${at}: unknown layout ${s.layout}`); continue; }
    if (s.dur < 3 || s.dur > 12) errs.push(`${at}: dur ${s.dur} outside 3–12`);
    if ((s.layout === 'compare') && (s.items || []).length < 2) errs.push(`${at}: compare needs >=2 items`);
    const texts = [];
    (s.lines || []).forEach((l) => texts.push(typeof l === 'string' ? l : l.text));
    (s.items || []).forEach((i) => { texts.push(i.text); if (i.detail) texts.push(i.detail); });
    [s.note, s.value, s.label, s.action].forEach((v) => { if (v) texts.push(Array.isArray(v) ? v.join(' ') : v); });
    for (const t of texts.filter(Boolean)) {
      const clean = strip(t);
      const role = s.layout === 'cta' ? 'cta' : s.layout === 'hook' ? 'hook' : s.layout === 'offer' && t === s.value ? 'slam' : 'body';
      if (clean.length > MAX_CHARS[role] * 3) errs.push(`${at}: text too long for ${role} — "${clean.slice(0, 40)}…"`);
      if (IS_EMOJI.test(clean)) errs.push(`${at}: emoji not allowed on canvas (use Material Symbols ligature names)`);
      if (((String(t).match(/\*/g) || []).length) % 2) errs.push(`${at}: unbalanced *emphasis* markers in "${clean}"`);
    }
    const emphCount = texts.reduce((a, t) => a + ((String(t).match(/\*[^*]+\*/g) || []).length), 0);
    if (emphCount > 4) warns.push(`${at}: ${emphCount} emphasis tokens (keep <=4 per scene)`);
    if (['features', 'compare'].includes(s.layout) && (s.items || []).length > 5) errs.push(`${at}: ${s.items.length} items (max 5)`);
    if (s.layout === 'features' && (s.items || []).some((i) => strip(i.detail || '').length > 44)) errs.push(`${at}: detail line over 44 chars`);
    if (s.layout !== 'cta' && (s.items || []).filter((i) => i.accent).length > 1) errs.push(`${at}: more than one accent item`);
  }
  const status = errs.length ? 'FAIL' : warns.length ? 'ok (warn)' : 'ok';
  console.log(`${status.padEnd(9)} ${key.padEnd(20)} ${TL.dur}s · ${TL.scenes.length} scenes`);
  for (const e of errs) console.log(`          x ${e}`);
  for (const w of warns) console.log(`          ! ${w}`);
  if (errs.length) bad++;
}
if (!list.length) console.log('no reels found in data/reels/');
process.exit(bad ? 1 : 0);
