#!/usr/bin/env node
// Brand Reels render pipeline (reusable).
//   node render.mjs <key> --preview            contact sheet → out/<key>/sheet.jpg
//   node render.mjs <key> --frame=2.0          full-res frame → out/<key>/frame-2.png
//   node render.mjs <key> --audio              score → data/scores/<key>.m4a
//   node render.mjs <key>                      frames + encode → media/<key>.mp4
//   node render.mjs <key> --fps=30 --workers=4 --range=0:6 --brand=brand
//
// Working dir layout (run from your project root):
//   brand.json  studio/{engine.js,page.html,score.js,audio.html}  data/reels/<key>.json
//   assets/fonts/*  assets/logo.png   →   out/<key>/*  media/<key>.mp4
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync, createReadStream, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const REELS_DIR = join(ROOT, 'data', 'reels');
const OUT_DIR = join(ROOT, 'out');
const MEDIA_DIR = join(ROOT, 'media');

const args = Object.fromEntries(process.argv.slice(2).map((a) =>
  a.startsWith('--') ? [a.slice(2).split('=')[0], a.includes('=') ? a.split('=').slice(1).join('=') : true] : ['key', a]
));
const KEY = args.key;
if (!KEY) { console.error('usage: render.mjs <key> [--preview|--frame=t|--audio|--encode] [--workers=4] [--brand=brand]'); process.exit(1); }
const BRAND = args.brand || 'brand';
const reel = JSON.parse(readFileSyncSafe(join(REELS_DIR, `${KEY}.json`)));
const TL = timeline(reel);
const fps = +(args.fps || 30);
const FRAMES_DIR = join(OUT_DIR, KEY, 'frames');
const WORKERS = +(args.workers || 4);

function readFileSyncSafe(p) { return readFileSync(p, 'utf8'); }
function timeline(reel) {
  const bpm = reel.bpm || 112, beat = 60 / bpm; let acc = 0;
  const scenes = reel.scenes.map((s) => { const start = +acc.toFixed(4); acc += s.dur; return { ...s, start, end: +acc.toFixed(4) }; });
  const itemTimes = [];
  scenes.forEach((sc) => {
    const items = sc.items || sc.lines || [];
    const first = sc.layout === 'hook' ? 0.35 : sc.layout === 'cta' ? 0.4 : 0.5;
    const step = (sc.layout === 'features' || sc.layout === 'compare') ? 0.75 : sc.layout === 'hook' ? beat * 1.5 : 0.8;
    items.forEach((_, i) => itemTimes.push(+(sc.start + first + i * step).toFixed(4)));
  });
  const cta = scenes.find((s) => s.layout === 'cta');
  return { bpm, beat, dur: +acc.toFixed(4), scenes, cuts: scenes.map((s) => s.start), itemTimes, ctaStart: cta ? cta.start : null };
}

const PW = (() => { try { return readdirSync(join(homedir(), '.cache/ms-playwright')); } catch { return []; } })();
const CHROMES = [args.chrome, process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  ...PW.filter((n) => /^chromium-\d+$/.test(n)).sort((a, b) => b.split('-')[1] - a.split('-')[1])
    .map((n) => `${homedir()}/.cache/ms-playwright/${n}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`).filter((p) => existsSync(p))];
const CHROME = CHROMES.find((p) => p && existsSync(p));
if (!CHROME) { console.error('Chrome/Chromium not found — set CHROME_PATH or pass --chrome='); process.exit(1); }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.png': 'image/png', '.css': 'text/css', '.wav': 'audio/wav', '.m4a': 'audio/mp4' };
const server = createServer((req, res) => {
  const p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(p) || !statSync(p).isFile()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
  createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ['--disable-gpu', '--window-size=1080,1920', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--force-device-scale-factor=1'],
});
async function openReel() {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('[page error]', e.message));
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/studio/page.html?reel=${KEY}&brand=${BRAND}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.ready === true', { timeout: 60000 });
  return page;
}
const frameOf = async (page, t, type, q) => {
  const url = await page.evaluate((t, type, q) => window.renderAt(t, type, q), t, type, q);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
};
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', (c) => (c ? bad(new Error(cmd + ' exit ' + c)) : ok())); });

if (args.preview) {
  const page = await openReel();
  const ts = [];
  for (const sc of TL.scenes) ts.push(+(sc.start + 0.8).toFixed(2), +(sc.start + sc.dur * 0.5).toFixed(2), +(sc.end - 0.45).toFixed(2));
  const uniq = [...new Set(ts.filter((t) => t > 0 && t < TL.dur))];
  const out = join(OUT_DIR, KEY, 'sheet.jpg'); mkdirSync(dirnameOf(out), { recursive: true });
  const { url } = await page.evaluate((ts, cols, w) => window.renderSheet(ts, cols, w), uniq, +(args.cols || 3), 420);
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log(out, `(${uniq.length} frames @ ${TL.dur}s)`);
} else if (args.frame !== undefined) {
  const page = await openReel();
  const t = Number(args.frame);
  const url = await page.evaluate((t) => window.renderAt(t, 'image/png'), t);
  const out = join(OUT_DIR, KEY, `frame-${t}.png`); mkdirSync(dirnameOf(out), { recursive: true });
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log(out, `@ ${t}s (icons_ok=${await page.evaluate('window.ICONS_OK')})`);
} else if (args.audio) {
  const page = await browser.newPage();
  await page.goto(`${BASE}/studio/audio.html?bpm=${TL.bpm}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.ready === true');
  const b64 = await page.evaluate(`(async () => { const b = await window.buildScore(${TL.dur}, ${JSON.stringify({ sceneStarts: TL.cuts, itemTimes: TL.itemTimes, ctaStart: TL.ctaStart })}); return window.encodeWav(b); })()`);
  const wav = join(OUT_DIR, KEY, 'score.wav'); mkdirSync(dirnameOf(wav), { recursive: true });
  writeFileSync(wav, Buffer.from(b64, 'base64'));
  const m4a = join(ROOT, 'data', 'scores', `${KEY}.m4a`); mkdirSync(dirnameOf(m4a), { recursive: true });
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-af', 'highpass=f=35,equalizer=f=250:t=q:w=1:g=-3,loudnorm=I=-14:TP=-1.5:LRA=9', '-c:a', 'aac', '-b:a', '192k', m4a]);
  console.log(m4a);
} else if (args.encode) {
  const audio = join(ROOT, 'data', 'scores', `${KEY}.m4a`);
  const out = join(MEDIA_DIR, `${KEY}.mp4`); mkdirSync(MEDIA_DIR, { recursive: true });
  const n = readdirSync(FRAMES_DIR).filter((f) => f.endsWith('.jpg')).length;
  console.log(`encoding ${n} frames → ${out}`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES_DIR}/f%05d.jpg`,
    ...(existsSync(audio) ? ['-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-threads', '4', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  console.log('wrote ' + out);
} else {
  const [a, b] = args.range ? String(args.range).split(':').map(Number) : [0, TL.dur];
  mkdirSync(FRAMES_DIR, { recursive: true });
  const first = Math.round(a * fps), last = Math.min(Math.ceil(TL.dur * fps) - 1, Math.round(b * fps) - 1);
  const todo = [];
  for (let i = first; i <= last; i++) { const f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`; if (!existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} frames to render (${last - first + 1 - todo.length} cached), ${WORKERS} workers, ${TL.dur}s @ ${fps}fps`);
  let next = 0, done = 0; const start = Date.now();
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    const page = await openReel();
    while (next < todo.length) {
      const i = todo[next++], f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`;
      const buf = await frameOf(page, i / fps, 'image/jpeg', 0.95);
      writeFileSync(f + '.tmp', buf); renameSync(f + '.tmp', f);
      if (++done % 48 === 0 || done === todo.length) {
        const el = (Date.now() - start) / 1000;
        console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`);
      }
    }
  }));
  await browser.close(); server.close();
  await run('node', [fileURLToPath(import.meta.url), KEY, '--encode', `--brand=${BRAND}`]);
  process.exit(0);
}
await browser.close(); server.close();
function dirnameOf(p) { return p.slice(0, p.lastIndexOf('/')); }
