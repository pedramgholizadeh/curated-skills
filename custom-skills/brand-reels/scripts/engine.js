// Brand Reels engine — a reusable, brand-configurable canvas reel renderer.
// Every frame is a PURE FUNCTION of time t (deterministic, parallel-capturable).
// Render contract: window.ready, window.renderAt(t,type,q), window.renderSheet(ts,cols,w),
//                  window.ICONS_OK, window.DUR, window.PROJECT.
//
// All brand specifics (palette, fonts, direction, locale digits, domain, CTA line,
// safe zones, canvas size) come from brand.json — nothing below is tied to one business.
(() => {
  const params = new URLSearchParams(location.search);
  const BRAND_NAME = params.get('brand') || 'brand';
  const REEL = { key: params.get('reel') || 'demo' };

  let B = null;                 // brand config
  let W = 1080, H = 1920, CX = 540, VCENTER = 900, TEXT_W = 760;
  let C = {};                   // palette
  let SAFE = {};                // { areaTop, areaBot, timelineY, logoY }
  let RTL = false, LEADING = 1; // LEADING: +1 => start is right (rtl), -1 => start is left (ltr)
  let FONT = 'Inter', ICONFONT = 'Material Symbols Rounded';
  let DIGITS = null;            // optional 10-char locale digit map

  const cv = document.getElementById('out');
  const ctx = cv.getContext('2d');
  const num = (n) => String(n).replace(/\d/g, (d) => (DIGITS ? DIGITS[+d] : d));

  let PROJECT = null, scenes = [], cuts = [], DUR = 0, BPM = 112, BEAT = 60 / 112;

  // ---- easing ----------------------------------------------------------------
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const expoOut = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
  const backOut = (p) => { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const OUT_D = 0.32;
  const beatPulse = (t, sharp) => Math.pow(1 - ((t / BEAT) % 1), sharp || 3);

  // ---- type system: modular scale (~1.4) + weight ladder ---------------------
  const ROLES = {
    hook:  { px: 120, reg: 800, em: 900, lh: 1.16, floor: 80 },
    h1:    { px: 88,  reg: 700, em: 800, lh: 1.22, floor: 56 },
    cta:   { px: 92,  reg: 700, em: 800, lh: 1.24, floor: 60 },
    card:  { px: 48,  reg: 600, em: 800, lh: 1.2,  floor: 34 },
    body:  { px: 44,  reg: 400, em: 700, lh: 1.5,  floor: 32 },
    detail:{ px: 32,  reg: 400, em: 600, lh: 1.35, floor: 24 },
    label: { px: 30,  reg: 600, em: 700, lh: 1.3,  floor: 24 },
    slam:  { px: 150, reg: 800, em: 900, lh: 1.05, floor: 96 },
  };
  const font = (px, w) => { ctx.font = `${w} ${px}px ${FONT}`; ctx.textBaseline = 'alphabetic'; };
  const measureWord = (t, px, w) => { font(px, w); return ctx.measureText(t).width; };

  // ---- icons (icon font, ligature names) -------------------------------------
  let ICONS_OK = false;
  function drawIcon(name, cx, cy, px, color, weight) {
    if (!name) return;
    ctx.save();
    ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${weight || 600} ${px}px '${ICONFONT}'`;
    ctx.fillStyle = color;
    ctx.fillText(name, cx, cy);
    ctx.restore();
  }

  // ---- tokenizer --------------------------------------------------------------
  function tokenize(line) {
    const out = []; const re = /\*([^*]+)\*/g; let last = 0, m;
    const push = (seg, em) => seg.split(/\s+/).filter(Boolean).forEach((w) => out.push({ t: w, em }));
    while ((m = re.exec(line))) { push(line.slice(last, m.index), false); push(m[1], true); last = m.index + m[0].length; }
    push(line.slice(last), false);
    return out;
  }
  function groupW(tokens, px, r, spaceW) {
    let s = 0; for (let i = 0; i < tokens.length; i++) { s += measureWord(tokens[i].t, px, tokens[i].em ? r.em : r.reg) + (i ? spaceW : 0); }
    return s;
  }
  // Balanced wrap into exactly L contiguous groups, minimizing widest line, avoiding 1-word orphans.
  function balanced(tokens, px, r, maxW, spaceW, L) {
    const n = tokens.length; let best = null;
    const evalCuts = (cuts) => {
      const bounds = [0, ...cuts, n]; let mx = 0, minTok = 99;
      for (let g = 0; g < L; g++) { const len = bounds[g + 1] - bounds[g]; mx = Math.max(mx, groupW(tokens.slice(bounds[g], bounds[g + 1]), px, r, spaceW)); minTok = Math.min(minTok, len); }
      if (mx > maxW) return;
      const score = (minTok >= 2 ? 0 : 1000) + mx;
      if (!best || score < best.score) best = { score, cuts: cuts.slice() };
    };
    const rec = (start, left, chosen) => {
      if (left === 0) { evalCuts(chosen); return; }
      for (let c = start + 1; c <= n - left; c++) { chosen.push(c); rec(c, left - 1, chosen); chosen.pop(); }
    };
    if (L === 1) evalCuts([]); else rec(0, L - 1, []);
    if (!best) return null;
    const bounds = [0, ...best.cuts, n]; const lines = [];
    for (let g = 0; g < L; g++) lines.push(tokens.slice(bounds[g], bounds[g + 1]));
    return lines;
  }
  // AUTO-FIT: one line at base → shrink to one → balanced 2 → shrink → balanced 3.
  function layout(text, role, maxW) {
    const r = ROLES[role]; const tokens = tokenize(text);
    font(r.px, r.reg); const spaceW = ctx.measureText(' ').width;
    if (groupW(tokens, r.px, r, spaceW) <= maxW) return { px: r.px, lines: [tokens] };
    const floor = r.floor; let px = r.px;
    while (px > floor) { px *= 0.95; if (groupW(tokens, px, r, spaceW) <= maxW) return { px, lines: [tokens] }; }
    for (let s = r.px; s >= floor; s *= 0.94) { const b2 = balanced(tokens, s, r, maxW, spaceW, 2); if (b2) return { px: s, lines: b2 }; }
    for (let s = r.px; s >= floor; s *= 0.96) { const b3 = balanced(tokens, s, r, maxW, spaceW, 3); if (b3) return { px: s, lines: b3 }; }
    return { px: floor, lines: balanced(tokens, floor, r, maxW, spaceW, 3) || [tokens] };
  }
  function blockH(text, role, maxW) { const L = layout(text, role, maxW || TEXT_W); return L.lines.length * L.px * ROLES[role].lh; }

  // ---- drawing primitives -----------------------------------------------------
  function drawTokenLine(tokens, cx, baseline, px, r, color, emColor, alpha, animFrom, stagger, lt) {
    font(px, r.reg); const spaceW = ctx.measureText(' ').width;
    const total = groupW(tokens, px, r, spaceW);
    let cursor = cx + (LEADING * total / 2);
    tokens.forEach((tk, i) => {
      const delay = animFrom + i * stagger;
      const p = clamp01((lt - delay) / 0.4); const a = p <= 0 ? 0 : expoOut(p);
      if (a <= 0.01) { cursor -= LEADING * (measureWord(tk.t, px, tk.em ? r.em : r.reg) + spaceW); return; }
      const tw = measureWord(tk.t, px, tk.em ? r.em : r.reg);
      const scale = 0.8 + 0.2 * backOut(a); const dy = (1 - a) * 30;
      ctx.save(); ctx.globalAlpha = alpha * a;
      ctx.translate(cursor - (LEADING * tw) / 2, baseline + dy); ctx.scale(scale, scale);
      ctx.textAlign = 'center'; ctx.fillStyle = tk.em ? emColor : color;
      font(px, tk.em ? r.em : r.reg); ctx.fillText(tk.t, 0, 0);
      ctx.restore(); cursor -= LEADING * (tw + spaceW);
    });
    ctx.globalAlpha = 1;
  }
  // centered auto-fit block; returns height
  function drawBlock(text, cx, topBaseline, role, color, emColor, alpha, animFrom, lt, maxW) {
    const r = ROLES[role]; const L = layout(text, role, maxW || TEXT_W);
    font(L.px, r.reg); const spaceW = ctx.measureText(' ').width;
    let y = topBaseline, delay = animFrom;
    for (const ln of L.lines) {
      drawTokenLine(ln, cx, y, L.px, r, color, emColor, alpha, delay, 0.045, lt);
      delay += ln.length * 0.045 + 0.12; y += L.px * r.lh;
    }
    return L.lines.length * L.px * r.lh;
  }
  // leading-edge-anchored block for card rows. `edgeX` is the leading edge (right in RTL, left in LTR).
  function drawEdgeBlock(text, edgeX, baseline, role, color, emColor, alpha, lt, maxW, animFrom) {
    const r = ROLES[role]; const L = layout(text, role, maxW);
    font(L.px, r.reg); const spaceW = ctx.measureText(' ').width;
    let y = baseline, delay = animFrom || 0;
    for (const ln of L.lines) {
      const w = groupW(ln, L.px, r, spaceW);
      let cursor = edgeX + LEADING * (w / 2);   // center of first token, offset toward trailing
      ln.forEach((tk) => {
        const tw = measureWord(tk.t, L.px, tk.em ? r.em : r.reg);
        const p = clamp01((lt - delay) / 0.35); const a = p <= 0 ? 0 : expoOut(p);
        ctx.globalAlpha = alpha * a; ctx.fillStyle = tk.em ? emColor : color; font(L.px, tk.em ? r.em : r.reg);
        ctx.textAlign = 'center'; ctx.fillText(tk.t, cursor, y); cursor -= LEADING * (tw + spaceW); delay += 0.02;
      });
      y += L.px * r.lh;
    }
    ctx.globalAlpha = 1; return L.lines.length * L.px * r.lh;
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // ---- background --------------------------------------------------------------
  function bg(t, energy, pulse) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, C.bg); g.addColorStop(0.55, C.bg2); g.addColorStop(1, C.bg);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const bp = pulse * 0.5;
    pool(W * 0.26 + Math.sin(t * 0.22) * 60, H * 0.3 + Math.cos(t * 0.16) * 70, 640 + bp * 28, C.secondary, 0.22 + energy * 0.1 + bp * 0.03);
    pool(W * 0.76 - Math.sin(t * 0.18) * 60, H * 0.74 - Math.cos(t * 0.14) * 60, 700 + bp * 40, C.accent, 0.12 + energy * 0.08 + bp * 0.04);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.4; const horizon = H * 0.62;
    for (let i = 0; i < 14; i++) {
      const ph = ((i / 14) + (t * 0.035 % (1 / 14))) % 1; const y = horizon + Math.pow(ph, 2.4) * (H - horizon);
      ctx.globalAlpha = 0.05 + ph * 0.12; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let x = -6; x <= 6; x++) { ctx.globalAlpha = 0.05; ctx.beginPath(); ctx.moveTo(CX + x * 40, horizon); ctx.lineTo(CX + x * 260, H); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  function pool(x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = Math.min(0.6, a); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.globalAlpha = 1;
  }
  function flash(lt, color) {
    if (lt > 0.5) return; const a = (1 - lt / 0.5); const r = 300 + (1 - a) * 1400;
    const g = ctx.createRadialGradient(CX, VCENTER, 0, CX, VCENTER, r);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a * a * 0.28; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  }

  // ---- HUD (logo + segmented progress bar) ------------------------------------
  function hud(t, idx) {
    if (logoImg.complete && logoImg.naturalWidth && idx !== scenes.length - 1) {
      const lw = 150, lh = lw * (logoImg.naturalHeight / logoImg.naturalWidth);
      ctx.globalAlpha = 0.9; ctx.drawImage(logoImg, CX - lw / 2, SAFE.logoY, lw, lh); ctx.globalAlpha = 1;
    }
    const bw = 720, bx = CX - bw / 2, by = SAFE.timelineY, bh = 8, seg = bw / scenes.length - 10; let acc = 0;
    for (let i = 0; i < scenes.length; i++) {
      const start = cuts[i], end = start + scenes[i].dur;
      const p = t < start ? 0 : t > end ? 1 : (t - start) / scenes[i].dur;
      ctx.fillStyle = 'rgba(255,255,255,.12)'; roundRect(bx + acc, by, seg, bh, bh / 2); ctx.fill();
      if (p > 0.02) { ctx.fillStyle = i <= idx ? C.accent2 : C.accent; roundRect(bx + acc, by, Math.max(bh, seg * p), bh, bh / 2); ctx.fill(); }
      acc += bw / scenes.length;
    }
    font(ROLES.label.px, 700); ctx.fillStyle = C.soft; ctx.textAlign = 'right'; ctx.globalAlpha = 0.9;
    ctx.fillText(num(idx + 1) + ' / ' + num(scenes.length), bx + bw, by - 20); ctx.globalAlpha = 1;
  }

  // ---- layouts ---------------------------------------------------------------------
  function cardRow(it, ry, rh, lt, alpha, a) {
    const x0 = CX - TEXT_W / 2, PAD = 30;
    ctx.save(); ctx.globalAlpha = alpha * a; ctx.translate((1 - a) * 44 * LEADING, 0);
    ctx.fillStyle = it.accent ? 'rgba(255,154,0,.10)' : 'rgba(255,255,255,.05)';
    roundRect(x0, ry, TEXT_W, rh, 22); ctx.fill();
    ctx.fillStyle = it.accent ? C.accent2 : C.accent;
    const barX = LEADING > 0 ? x0 + TEXT_W - 6 : x0 + 2;
    roundRect(barX, ry + 10, 4, rh - 20, 2); ctx.fill();
    const iconR = Math.min(38, rh / 2 - 10);
    const iconCx = LEADING > 0 ? x0 + TEXT_W - PAD - iconR - 4 : x0 + PAD + iconR + 4;
    const iconCy = ry + rh / 2;
    ctx.fillStyle = it.accent ? 'rgba(255,154,0,.16)' : 'rgba(68,161,164,.16)';
    ctx.beginPath(); ctx.arc(iconCx, iconCy, iconR, 0, 7); ctx.fill();
    drawIcon(it.icon || 'check_circle', iconCx, iconCy, iconR * 1.1, it.accent ? C.accent2 : C.accent, 600);
    const textEdge = iconCx + LEADING * (iconR + 18);
    const textW = (TEXT_W - PAD * 2) - (iconR * 2 + 22);
    if (it.detail) {
      drawEdgeBlock(it.text, textEdge, ry + rh * 0.44, 'card', C.text, it.accent ? C.accent2 : C.accent, alpha * a, lt, textW, 0);
      drawEdgeBlock(it.detail, textEdge, ry + rh * 0.80, 'detail', C.soft, C.accent, alpha * a, lt, textW, 0);
    } else {
      drawEdgeBlock(it.text, textEdge, ry + rh / 2 + ROLES.card.px * 0.34, 'card', C.text, it.accent ? C.accent2 : C.accent, alpha * a, lt, textW, 0);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  function layoutHook(s, lt, alpha) {
    const lines = s.lines || [];
    const iconH = s.icon ? 150 : 0;
    const totalH = lines.reduce((a, l) => a + blockH(l, 'hook'), 0) + iconH;
    let y = VCENTER - totalH / 2 + ROLES.hook.px * 0.78 + iconH; let delay = 0.05;
    if (s.icon) {
      const p = clamp01((lt - 0.05) / 0.4); const a = p <= 0 ? 0 : backOut(expoOut(p));
      ctx.save(); ctx.globalAlpha = alpha * a; drawIcon(s.icon, CX, y - ROLES.hook.px * 0.92, 104, C.accent, 500); ctx.restore(); ctx.globalAlpha = 1;
    }
    lines.forEach((l, i) => {
      const last = i === lines.length - 1;
      const h = drawBlock(l, CX, y, 'hook', C.text, last ? C.accent2 : C.accent, alpha, delay, lt);
      delay += 0.1 + tokenize(l).length * 0.04; y += h;
    });
    if (s.note) drawBlock(s.note, CX, y + 20, 'label', C.soft, C.accent, alpha, delay, lt);
  }

  function layoutProblem(s, lt, alpha) {
    const parts = [];
    if (s.lines && s.lines[0]) parts.push({ t: s.lines[0], role: 'h1', color: C.text, em: C.accent });
    const items = (s.items && s.items.length ? s.items : (s.lines || []).slice(1));
    items.forEach((it, i) => { const text = typeof it === 'string' ? it : it.text; parts.push({ t: text, role: 'body', color: i === items.length - 1 ? C.text : C.soft, em: C.accent }); });
    const totalH = parts.reduce((a, p) => a + blockH(p.t, p.role) + 26, 0);
    let y = VCENTER - totalH / 2 + ROLES.h1.px * 0.78; let delay = 0.05;
    for (const p of parts) { const h = drawBlock(p.t, CX, y, p.role, p.color, p.em, alpha, delay, lt); delay += 0.18 + tokenize(p.t).length * 0.045; y += h + 26; }
  }

  function layoutStatement(s, lt, alpha) {
    let totalH = s.label ? ROLES.label.px * ROLES.label.lh : 0;
    (s.lines || []).forEach((l) => totalH += blockH(l, 'h1') + 22);
    if (s.note) totalH += blockH(s.note, 'body');
    let y = VCENTER - totalH / 2 + ROLES.h1.px * 0.78; let delay = 0.05;
    if (s.label) { drawBlock(s.label, CX, y, 'label', C.accent, C.accent, alpha, delay, lt); y += ROLES.label.px * ROLES.label.lh; delay += 0.18; }
    (s.lines || []).forEach((l, i) => { const h = drawBlock(l, CX, y, 'h1', C.text, i === 0 ? C.accent2 : C.accent, alpha, delay, lt); delay += 0.22 + tokenize(l).length * 0.045; y += h + 22; });
    if (s.note) drawBlock(s.note, CX, y, 'body', C.soft, C.accent, alpha, delay, lt);
  }

  function layoutFeatures(s, lt, alpha) {
    const head = s.title || (s.lines && s.lines[0]);
    const items = s.items || [];
    const headH = head ? blockH(head, 'h1') + 44 : 0;
    const rowH = Math.min(150, (SAFE.areaBot - SAFE.areaTop - headH) / Math.max(1, items.length));
    const gap = Math.min(16, rowH * 0.12);
    const totalH = headH + items.length * rowH;
    let y = VCENTER - totalH / 2 + ROLES.h1.px * 0.78;
    if (head) { drawBlock(head, CX, y, 'h1', C.text, C.accent, alpha, 0.05, lt); y += headH; }
    let delay = 0.25;
    items.forEach((it, i) => {
      const p = clamp01((lt - delay) / 0.32); const a = p <= 0 ? 0 : expoOut(p); delay += 0.26;
      if (a <= 0.01) return;
      cardRow(it, y + i * rowH, rowH - gap, lt, alpha, a);
    });
  }

  function layoutCompare(s, lt, alpha) {
    const head = s.title || (s.lines && s.lines[0]);
    const items = s.items || [];
    const headH = head ? blockH(head, 'h1') + 40 : 0;
    const n = items.length;
    const rowH = Math.min(200, (SAFE.areaBot - SAFE.areaTop - headH) / Math.max(1, n));
    const gap = 14;
    const totalH = headH + n * rowH;
    let y = VCENTER - totalH / 2 + ROLES.h1.px * 0.78;
    if (head) { drawBlock(head, CX, y, 'h1', C.text, C.accent, alpha, 0.05, lt); y += headH; }
    let delay = 0.2;
    items.forEach((it, i) => {
      const p = clamp01((lt - delay) / 0.3); const a = p <= 0 ? 0 : expoOut(p); delay += 0.24;
      if (a <= 0.01) return;
      const ry = y + i * rowH;
      cardRow(it, ry, rowH - gap, lt, alpha, a);
      if (i < n - 1) {
        const vp = clamp01((lt - delay) / 0.3); const va = vp <= 0 ? 0 : expoOut(vp);
        if (va > 0.01) {
          const cy = ry + rowH;
          ctx.save(); ctx.globalAlpha = alpha * va;
          ctx.fillStyle = C.bg3; ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(CX, cy, 26, 0, 7); ctx.fill(); ctx.stroke();
          ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          font(26, 800); ctx.fillStyle = C.soft; ctx.fillText('VS', CX, cy + 1);
          ctx.restore(); ctx.globalAlpha = 1; ctx.direction = RTL ? 'rtl' : 'ltr';
        }
      }
    });
  }

  function layoutCta(s, lt, alpha) {
    const site = s.site || B.domain || 'example.com';
    const consult = s.direct || B.ctaLine || 'For a free consultation, just DM us';
    const hasLogo = logoImg.complete && logoImg.naturalWidth;
    const lw = 150, lh = hasLogo ? lw * (logoImg.naturalHeight / logoImg.naturalWidth) : 0;
    const sitePx = 108, gap = 46;
    const consultH = blockH(consult, 'h1');
    const totalH = (hasLogo ? lh + gap : 0) + sitePx * 1.15 + gap + consultH;
    let y = VCENTER - totalH / 2;
    if (hasLogo) {
      const p = clamp01(lt / 0.4); const a = backOut(expoOut(p));
      ctx.save(); ctx.globalAlpha = alpha * clamp01(p * 1.4); ctx.translate(CX, y + lh / 2); ctx.scale(a, a);
      ctx.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh); ctx.restore(); ctx.globalAlpha = 1;
      y += lh + gap;
    }
    // typed domain (always LTR), elegant caret
    const typeStart = 0.45, typeDur = 1.0;
    const frac = clamp01((lt - typeStart) / typeDur);
    const shown = site.slice(0, Math.round(frac * site.length));
    const baseY = y + sitePx;
    ctx.save(); ctx.direction = 'ltr'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = alpha;
    font(sitePx, 800);
    const fullW = ctx.measureText(site).width, shownW = ctx.measureText(shown).width;
    const startX = CX - fullW / 2;
    ctx.fillStyle = C.text; ctx.fillText(shown, startX, baseY);
    if (frac < 1 && lt > typeStart && (Math.floor(lt / 0.5) % 2) === 0) {
      ctx.fillStyle = C.accent2; ctx.fillRect(startX + shownW + 10, baseY - sitePx * 0.76, 9, sitePx * 0.82);
    }
    ctx.restore(); ctx.globalAlpha = 1;
    y += sitePx * 1.15 + gap;
    const L = layout(consult, 'h1');
    drawBlock(consult, CX, y + L.px * 0.8, 'h1', C.soft, C.accent2, alpha, 1.55, lt);
  }

  // ---- dispatcher ----------------------------------------------------------------
  const LAYOUTS = { hook: layoutHook, problem: layoutProblem, statement: layoutStatement, features: layoutFeatures, compare: layoutCompare, cta: layoutCta };

  function frame(t) {
    const idx = (() => { for (let i = cuts.length - 1; i >= 0; i--) if (t >= cuts[i]) return i; return 0; })();
    const s = scenes[idx], start = cuts[idx]; const lt = t - start;
    const energy = Math.min(1, lt / 1.0); const pulse = beatPulse(t, 3);
    bg(t, energy, pulse); flash(lt, idx === scenes.length - 1 ? C.accent2 : C.accent);
    let alpha = 1; if (lt > s.dur - OUT_D) alpha = clamp01((s.dur - lt) / OUT_D);
    let shake = 0; if (s.layout === 'hook' && lt < 0.16) shake = (1 - lt / 0.16) * 10;
    ctx.save();
    if (shake) ctx.translate((Math.sin(t * 900) - 0.5) * shake, (Math.cos(t * 800) - 0.5) * shake);
    ctx.translate(0, -30 * (1 - alpha));
    (LAYOUTS[s.layout] || layoutStatement)(s, lt, alpha);
    ctx.restore(); hud(t, idx);
  }

  const logoImg = new Image();

  async function boot() {
    B = await (await fetch(`../${BRAND_NAME}.json`)).json();
    W = (B.canvas && B.canvas.w) || 1080; H = (B.canvas && B.canvas.h) || 1920;
    cv.width = W; cv.height = H;
    CX = W / 2; VCENTER = Math.round(H * 0.47);
    TEXT_W = (B.safe && B.safe.textW) || Math.round(W * 0.7);
    C = B.palette; SAFE = Object.assign({ areaTop: 250, areaBot: Math.round(H * 0.69), timelineY: Math.round(H * 0.79), logoY: 96 }, B.safe || {});
    RTL = B.direction === 'rtl'; LEADING = RTL ? 1 : -1; ctx.direction = RTL ? 'rtl' : 'ltr';
    FONT = B.fonts && B.fonts.text ? B.fonts.text : 'Inter';
    ICONFONT = B.fonts && B.fonts.icon ? B.fonts.icon : 'Material Symbols Rounded';
    DIGITS = B.digits && B.digits.length === 10 ? B.digits : null;
    logoImg.src = B.logo || '../assets/logo.png';
    for (const w of (B.fonts && B.fonts.weights) || [400, 500, 600, 700, 800, 900]) await document.fonts.load(`${w} 96px ${FONT}`);
    try { await document.fonts.load(`600 48px '${ICONFONT}'`); await document.fonts.load(`700 48px '${ICONFONT}'`); ICONS_OK = document.fonts.check(`48px '${ICONFONT}'`); } catch (e) { ICONS_OK = false; }
    await document.fonts.ready;
    PROJECT = await (await fetch(`../data/reels/${REEL.key}.json`)).json();
    scenes = PROJECT.scenes; BPM = PROJECT.bpm || B.bpm || 112; BEAT = 60 / BPM;
    cuts = []; let acc = 0; for (const s of scenes) { cuts.push(+acc.toFixed(4)); acc += s.dur; } DUR = acc;
    window.PROJECT = PROJECT; window.DUR = DUR; window.ICONS_OK = ICONS_OK;
    window.ready = true;
  }

  window.renderAt = async (t, type = 'image/png', q = 0.92) => { frame(t); return cv.toDataURL(type, q); };
  window.renderSheet = async (ts, cols, w) => {
    const cellW = w, cellH = Math.round(w * H / W), pad = 8; const rows = Math.ceil(ts.length / cols);
    const sc = document.createElement('canvas'); sc.width = cols * cellW + pad * (cols + 1); sc.height = rows * cellH + pad * (rows + 1);
    const s2 = sc.getContext('2d'); s2.fillStyle = '#111'; s2.fillRect(0, 0, sc.width, sc.height);
    for (let i = 0; i < ts.length; i++) {
      frame(ts[i]); const im = new Image(); await new Promise((r) => { im.onload = r; im.src = cv.toDataURL('image/jpeg', 0.85); });
      const x = pad + (i % cols) * (cellW + pad), y = pad + Math.floor(i / cols) * (cellH + pad);
      s2.drawImage(im, x, y, cellW, cellH);
      s2.fillStyle = '#FF9A00'; s2.font = '22px sans-serif'; s2.textAlign = 'left'; s2.fillText(ts[i].toFixed(2) + 's', x + 8, y + 26);
    }
    return { url: sc.toDataURL('image/jpeg', 0.9), ms: [] };
  };
  window.gpuInfo = () => 'canvas2d';
  boot();
})();
