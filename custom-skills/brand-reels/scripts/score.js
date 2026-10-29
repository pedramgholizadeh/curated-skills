// Brand Reels score — musical bed + designed SFX, all on one BPM grid (from ?bpm=).
// Everything is synthesized (no samples). Cues come from the reel timeline so hits land on frames.
(() => {
  const params = new URLSearchParams(location.search);
  const BPM = +(params.get('bpm') || 112);
  const BEAT = 60 / BPM;
  let noiseBuf = null;

  function noise(t) {
    if (!noiseBuf) { noiseBuf = t.createBuffer(1, Math.ceil(t.sampleRate * 2), t.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = t.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s;
  }
  const bus = (t, g) => { const n = t.createGain(); n.gain.value = g; n.connect(t.destination); return n; };

  function kick(at, t, out, g) {
    const o = t.createOscillator(), gn = t.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(165, at); o.frequency.exponentialRampToValueAtTime(45, at + 0.11);
    gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(g, at + 0.006);
    gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.26);
    o.connect(gn).connect(out); o.start(at); o.stop(at + 0.3);
  }
  function clap(at, t, out, g) {
    for (let i = 0; i < 3; i++) {
      const n = noise(t), f = t.createBiquadFilter(), gn = t.createGain();
      f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 1.4;
      const a = at + i * 0.011;
      gn.gain.setValueAtTime(g, a); gn.gain.exponentialRampToValueAtTime(0.0001, a + 0.09);
      n.connect(f).connect(gn).connect(out); n.start(a); n.stop(a + 0.12);
    }
  }
  function hat(at, t, out, g, len) {
    const n = noise(t), f = t.createBiquadFilter(), gn = t.createGain();
    f.type = 'highpass'; f.frequency.value = 8000;
    gn.gain.setValueAtTime(g, at); gn.gain.exponentialRampToValueAtTime(0.0001, at + len);
    n.connect(f).connect(gn).connect(out); n.start(at); n.stop(at + len + 0.02);
  }
  function sub(at, t, out, freq, dur, g) {
    const o = t.createOscillator(), gn = t.createGain(), f = t.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = 200; f.Q.value = 4;
    gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(g, at + 0.03);
    gn.gain.setValueAtTime(g, at + dur * 0.6); gn.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(f).connect(gn).connect(out); o.start(at); o.stop(at + dur + 0.05);
  }
  function pluck(at, t, out, freq, g) {
    const o = t.createOscillator(), gn = t.createGain(), f = t.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.setValueAtTime(3200, at); f.frequency.exponentialRampToValueAtTime(600, at + 0.3);
    gn.gain.setValueAtTime(g, at); gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
    o.connect(f).connect(gn).connect(out); o.start(at); o.stop(at + 0.4);
  }
  function pad(at, t, out, freq, dur, g) {
    const gn = t.createGain(), f = t.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.setValueAtTime(500, at); f.frequency.linearRampToValueAtTime(1900, at + dur * 0.5); f.frequency.linearRampToValueAtTime(600, at + dur);
    gn.gain.setValueAtTime(0.0001, at); gn.gain.linearRampToValueAtTime(g, at + 0.6);
    gn.gain.setValueAtTime(g, at + dur - 0.8); gn.gain.linearRampToValueAtTime(0.0001, at + dur);
    for (const h of [1, 1.5, 2.0, 3.01]) { const o = t.createOscillator(); o.type = 'sawtooth'; o.frequency.value = freq * h;
      const og = t.createGain(); og.gain.value = 0.16 / (h * 1.4); o.connect(og).connect(f); o.start(at); o.stop(at + dur + 0.1); }
    f.connect(gn).connect(out);
  }
  // ---- SFX ----
  function whoosh(at, t, out, g) {
    const n = noise(t), f = t.createBiquadFilter(), gn = t.createGain();
    f.type = 'bandpass'; f.Q.value = 0.8;
    f.frequency.setValueAtTime(400, at); f.frequency.exponentialRampToValueAtTime(5200, at + 0.28); f.frequency.exponentialRampToValueAtTime(300, at + 0.5);
    gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(g, at + 0.25); gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);
    n.connect(f).connect(gn).connect(out); n.start(at); n.stop(at + 0.6);
  }
  function impact(at, t, out, g) {
    const o = t.createOscillator(), gn = t.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(200, at); o.frequency.exponentialRampToValueAtTime(42, at + 0.4);
    gn.gain.setValueAtTime(g, at); gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.6);
    o.connect(gn).connect(out); o.start(at); o.stop(at + 0.7);
    const n = noise(t), nf = t.createBiquadFilter(), ng = t.createGain();
    nf.type = 'lowpass'; nf.frequency.value = 900;
    ng.gain.setValueAtTime(g * 0.5, at); ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
    n.connect(nf).connect(ng).connect(out); n.start(at); n.stop(at + 0.2);
  }
  function tick(at, t, out, g) {
    const o = t.createOscillator(), gn = t.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(1900, at); o.frequency.exponentialRampToValueAtTime(700, at + 0.04);
    gn.gain.setValueAtTime(g, at); gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
    o.connect(gn).connect(out); o.start(at); o.stop(at + 0.08);
  }
  function riser(at, t, out, dur, g) {
    const o = t.createOscillator(), gn = t.createGain(), f = t.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(120, at); o.frequency.exponentialRampToValueAtTime(900, at + dur);
    f.type = 'bandpass'; f.Q.value = 6; f.frequency.setValueAtTime(400, at); f.frequency.exponentialRampToValueAtTime(6000, at + dur);
    gn.gain.setValueAtTime(0.0001, at); gn.gain.exponentialRampToValueAtTime(g, at + dur * 0.95); gn.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.05);
    o.connect(f).connect(gn).connect(out); o.start(at); o.stop(at + dur + 0.1);
    const n = noise(t), nf = t.createBiquadFilter(), ng = t.createGain();
    nf.type = 'highpass'; nf.frequency.setValueAtTime(1000, at); nf.frequency.exponentialRampToValueAtTime(9000, at + dur);
    ng.gain.setValueAtTime(0.0001, at); ng.gain.linearRampToValueAtTime(g * 0.6, at + dur); ng.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.02);
    n.connect(nf).connect(ng).connect(out); n.start(at); n.stop(at + dur + 0.05);
  }
  function sparkle(at, t, out, g) {
    [0, 0.05, 0.1].forEach((d, i) => pluck(at + d, t, out, 880 * (1 + i * 0.26), g * 0.6));
  }

  const CHORDS = [110, 87.31, 130.81, 98];   // Am F C G roots
  const PADS = [220, 174.61, 261.63, 196];
  const ARP = [[440, 523, 659], [349, 440, 523], [523, 659, 784], [392, 494, 587]];

  window.buildScore = async (dur, opts = {}) => {
    const sr = 44100;
    const t = new OfflineAudioContext(2, Math.ceil(sr * (dur + 0.5)), sr);
    const music = bus(t, 0.9), sfx = bus(t, 1.0);
    const bars = Math.ceil(dur / (BEAT * 4));
    const starts = opts.sceneStarts || [];
    const ctaStart = opts.ctaStart || dur;

    // ---- music bed ----
    for (let b = 0; b < bars * 4; b++) {
      const at = b * BEAT; if (at > dur) break;
      const bar = Math.floor(b / 4) % 4, beatInBar = b % 4;
      const inIntro = at < starts[1] || 0;
      kick(at, t, music, 0.9);
      if (beatInBar === 1 || beatInBar === 3) clap(at, t, music, 0.28);
      hat(at + BEAT / 2, t, music, 0.13, 0.04);
      if (!inIntro) hat(at + BEAT * 0.25, t, music, 0.06, 0.03);
      sub(at, t, music, CHORDS[bar], BEAT * 0.92, 0.32);
      if (beatInBar === 0) pad(at, t, music, PADS[bar], BEAT * 4, 0.09);
      if (!inIntro) { const notes = ARP[bar]; for (let k = 0; k < 2; k++) pluck(at + k * BEAT / 2, t, music, notes[(b + k) % 3], 0.05); }
    }

    // ---- SFX from timeline cues ----
    starts.forEach((s, i) => {
      if (i === 0) { impact(0.02, t, sfx, 0.9); whoosh(Math.max(0, s - 0.35), t, sfx, 0.3); return; }
      whoosh(s - 0.32, t, sfx, 0.4);
      impact(s, t, sfx, i === starts.length - 1 ? 0.85 : 0.5);
    });
    (opts.itemTimes || []).forEach((it) => { if (it < dur) tick(it, t, sfx, 0.14); });
    if (ctaStart > 1.5) { riser(ctaStart - 1.6, t, sfx, 1.55, 0.32); impact(ctaStart, t, sfx, 1.0); sparkle(ctaStart + 0.05, t, sfx, 0.4); }
    // final button
    impact(dur - 0.15, t, sfx, 0.7);

    return await t.startRendering();
  };

  window.encodeWav = (audioBuffer) => {
    const n = audioBuffer.length, sr = audioBuffer.sampleRate, ch = audioBuffer.numberOfChannels;
    const size = 44 + n * ch * 2, ab = new ArrayBuffer(size), dv = new DataView(ab);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); dv.setUint32(4, size - 8, true); str(8, 'WAVE'); str(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true);
    str(36, 'data'); dv.setUint32(40, n * ch * 2, true);
    let o = 44; const chans = []; for (let c = 0; c < ch; c++) chans.push(audioBuffer.getChannelData(c));
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, chans[c][i])); dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
    const bytes = new Uint8Array(ab); let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  window.ready = true;
})();
