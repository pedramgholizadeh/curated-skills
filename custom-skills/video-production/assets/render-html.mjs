#!/usr/bin/env node
/* render-html.mjs — render a deterministic seek(t) HTML page to MP4 with Playwright + ffmpeg.
 *
 *   node render-html.mjs page.html out.mp4 [fps=30] [subframes=1] [workers=4]
 *   node render-html.mjs page.html qa/stills.png --stills=0.5,2.4,6.1
 *   node render-html.mjs page.html out.mp4 60 4 8 --lufs=-14 --crf=16 --poster=2.5
 *
 * The page must expose window.VIDEO = {w,h,duration} and window.seek(t)
 * (see references/render.md). Optional window.buildAudio(ctx) schedules the
 * soundtrack on an OfflineAudioContext and is muxed here.
 *
 * Requirements: ffmpeg on PATH, `npm i playwright`, then either
 * `npx playwright install chromium` or PW_CHANNEL=chrome to reuse installed Chrome.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2);
const flags = {};
const pos = [];
for (const a of argv) {
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    flags[k] = v === undefined ? true : v;
  } else pos.push(a);
}

const [html, out] = pos;
if (!html || !out) {
  console.error('usage: node render-html.mjs page.html out.mp4 [fps=30] [subframes=1] [workers=4]');
  console.error('       node render-html.mjs page.html sheet.png --stills=0.5,2,3.5');
  process.exit(1);
}

if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status !== 0) {
  console.error('ffmpeg not found on PATH.');
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('playwright is not installed. Run:\n  npm i playwright && npx playwright install chromium');
  process.exit(1);
}

const fps = Math.max(1, Number(pos[2] || 30));
const subframes = Math.max(1, Number(pos[3] || 1));
const workers = Math.max(1, Number(pos[4] || 4));
const crf = String(Number(flags.crf || 16));
const lufs = String(Number(flags.lufs || -16));
const stillsArg = typeof flags.stills === 'string' ? flags.stills : null;

mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

const run = (args) =>
  new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'inherit'] });
    p.on('close', (code) => (code ? reject(new Error('ffmpeg exited ' + code)) : resolve()));
  });

const url = pathToFileURL(path.resolve(html)).href + '?render';
const launchOpts = {
  args: ['--allow-file-access-from-files', '--disable-web-security', '--autoplay-policy=no-user-gesture-required'],
};
// PW_CHANNEL=chrome reuses the installed Chrome instead of downloading Chromium.
if (process.env.PW_CHANNEL) launchOpts.channel = process.env.PW_CHANNEL;
const browser = await chromium.launch(launchOpts);

let pageCount = 0;
async function openPage() {
  const page = await browser.newPage({ viewport: { width: V.w, height: V.h }, deviceScaleFactor: 1 });
  pageCount++;
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.VIDEO && typeof window.seek === 'function', null, { timeout: 60000 });
  const missing = await page.evaluate(async () => {
    await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status !== 'loaded').map((f) => f.family);
  });
  if (missing.length) {
    console.warn('WARNING: fonts did not load (fallback in use):', [...new Set(missing)].join(', '));
  }
  return page;
}

const shot = async (page, t, quality = 95) => {
  if (typeof t === 'number') await page.evaluate((x) => window.seek(x), t);
  return page.screenshot({ type: 'jpeg', quality, animations: 'disabled', caret: 'hide' });
};

// Probe dimensions/duration from one page before spawning workers.
const probe = await browser.newPage();
await probe.goto(url, { waitUntil: 'load', timeout: 60000 });
await probe.waitForFunction(() => window.VIDEO && typeof window.seek === 'function', null, { timeout: 60000 });
const V = await probe.evaluate(() => window.VIDEO);
await probe.close();
if (!V || !V.w || !V.h || !V.duration) {
  console.error('window.VIDEO is missing w/h/duration.');
  process.exit(1);
}
console.log(`stage ${V.w}x${V.h}  duration ${V.duration}s  fps ${fps}  subframes ${subframes}  workers ${workers}`);

try {
  /* ---- stills / contact sheet ---- */
  if (stillsArg) {
    const times = stillsArg.split(',').map(Number).filter((n) => Number.isFinite(n));
    if (!times.length) throw new Error('--stills needs comma-separated seconds');
    const page = await openPage();
    const dir = path.resolve(out) + '.frames';
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < times.length; i++) {
      writeFileSync(`${dir}/${String(i).padStart(3, '0')}.jpg`, await shot(page, times[i]));
    }
    await page.close();
    const cols = Math.min(3, times.length);
    const rows = Math.ceil(times.length / cols);
    await run([
      '-v', 'error', '-y',
      '-framerate', '1', '-i', `${dir}/%03d.jpg`,
      '-vf', `scale=${Math.min(1200, V.w)}:-1,tile=${cols}x${rows}:padding=8:color=0x333333`,
      '-frames:v', '1', out,
    ]);
    rmSync(dir, { recursive: true, force: true });
    console.log('stills ->', out, times.join(', '));
    await browser.close();
    process.exit(0);
  }

  /* ---- video ---- */
  const N = Math.round(V.duration * fps);
  const base = out.replace(/\.mp4$/i, '');
  const silent = base + '_silent.mp4';
  const listFile = base + '_segs.txt';

  const tileVf = subframes > 1
    ? ['-vf', `tmix=frames=${subframes},select='eq(mod(n\\,${subframes})\\,${subframes - 1})',setpts=N/(${fps}*TB)`]
    : [];

  const per = Math.ceil(N / workers);
  const segs = [];
  const t0 = Date.now();
  let done = 0;

  await Promise.all(
    Array.from({ length: workers }, async (_, w) => {
      const a = w * per;
      const b = Math.min(N, a + per);
      if (a >= b) return;
      const seg = `${base}_seg${w}.mp4`;
      segs[w] = seg;
      const page = await openPage();
      const ff = spawn('ffmpeg', [
        '-v', 'error', '-y',
        '-f', 'image2pipe', '-framerate', String(fps * subframes), '-i', '-',
        ...tileVf,
        '-r', String(fps),
        '-c:v', 'libx264', '-preset', 'medium', '-crf', crf,
        '-pix_fmt', 'yuv420p', '-color_range', 'tv',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
        seg,
      ], { stdio: ['pipe', 'inherit', 'inherit'] });
      const closed = new Promise((resolve, reject) =>
        ff.on('close', (code) => (code ? reject(new Error('ffmpeg segment ' + code)) : resolve())),
      );
      for (let f = a; f < b; f++) {
        for (let s = 0; s < subframes; s++) {
          // 180-degree shutter: sub-frames spread over half a frame.
          const tt = (f + (subframes > 1 ? (s / subframes) * 0.5 : 0)) / fps;
          const buf = await shot(page, tt);
          if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
        }
        if (++done % 30 === 0) {
          process.stdout.write(`\r${done}/${N} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
        }
      }
      ff.stdin.end();
      await closed;
      await page.close();
    }),
  );
  process.stdout.write('\n');

  writeFileSync(listFile, segs.filter(Boolean).map((s) => `file '${path.resolve(s)}'`).join('\n'));
  await run(['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', silent]);
  segs.filter(Boolean).forEach((s) => rmSync(s, { force: true }));
  rmSync(listFile, { force: true });
  console.log(`video -> ${silent}  (${((Date.now() - t0) / 1000).toFixed(0)}s, ${N} frames)`);

  /* ---- audio (optional) ---- */
  const audioPage = await openPage();
  const hasAudio = await audioPage.evaluate(() => typeof window.buildAudio === 'function');
  if (hasAudio) {
    const b64 = await audioPage.evaluate(async (dur) => {
      const sr = 48000;
      const ctx = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
      await window.buildAudio(ctx);
      const buf = await ctx.startRendering();
      const L = buf.getChannelData(0);
      const R = buf.getChannelData(buf.numberOfChannels > 1 ? 1 : 0);
      const i16 = new Int16Array(L.length * 2);
      for (let i = 0; i < L.length; i++) {
        i16[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767;
        i16[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767;
      }
      const bytes = new Uint8Array(i16.buffer);
      let s = '';
      for (let i = 0; i < bytes.length; i += 0x8000) {
        s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      }
      return btoa(s);
    }, V.duration);

    const pcm = base + '.pcm';
    writeFileSync(pcm, Buffer.from(b64, 'base64'));
    await run([
      '-v', 'error', '-y',
      '-i', silent,
      '-f', 's16le', '-ar', '48000', '-ac', '2', '-i', pcm,
      '-af', `loudnorm=I=${lufs}:TP=-1.5:LRA=11`,
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
      '-movflags', '+faststart',
      out,
    ]);
    rmSync(pcm, { force: true });
    console.log(`with audio -> ${out}`);
  } else {
    await run(['-v', 'error', '-y', '-i', silent, '-c', 'copy', '-movflags', '+faststart', out]);
    rmSync(silent, { force: true });
    console.log('no window.buildAudio found: video only ->', out);
  }
  await audioPage.close();

  if (flags.poster !== undefined) {
    const pt = Number(flags.poster) || 0;
    const posterPage = await openPage();
    writeFileSync(base + '_poster.jpg', await shot(posterPage, pt));
    await posterPage.close();
    console.log('poster ->', base + '_poster.jpg');
  }

  console.log(`done: ${pageCount} page(s), ${((Date.now() - t0) / 1000).toFixed(0)}s total`);
} catch (err) {
  console.error('render failed:', err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
