/* motion.js — deterministic motion helpers for seek(t) pieces.
 * Plain browser script: <script src="motion.js"></script> exposes window.M.
 * Also usable in Node: const M = require('./motion.js').
 * Everything here is a pure function of time (or of a supplied RNG).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.M = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const mix = (a, b, k) => {
    if (k <= 0) return a;
    if (k >= 1) return b;
    if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, k);
    if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => mix(v, b[i], k));
    if (a && typeof a === 'object' && b && typeof b === 'object') {
      const out = {};
      for (const key in a) out[key] = mix(a[key], b[key], k);
      return out;
    }
    return k < 1 ? a : b;
  };

  // progress of t through [a, b], clamped to 0..1
  const seg = (t, a, b) => clamp((t - a) / (b - a));

  const ease = (x) => {
    x = clamp(x);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };
  const expoOut = (x) => (clamp(x) >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(x)));
  const expoIn = (x) => Math.pow(2, 10 * (clamp(x) - 1));
  const backOut = (x, s = 1.70158) => {
    x = clamp(x) - 1;
    return 1 + (s + 1) * x * x * x + s * x * x;
  };
  const sineInOut = (x) => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
  const linear = (x) => clamp(x);

  // Damped spring step response 0 -> 1.
  // w = speed (8 slow, 14 normal, 22 snappy); z = damping (1 = no overshoot).
  function spring(t, w = 14, z = 0.82) {
    if (t <= 0) return 0;
    if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  }

  // Float value that springs to each new target: track(v0, [[t, value, w?, z?], ...]) -> f(t)
  const track = (v0, keys) => (t) => {
    let v = v0;
    let prev = v0;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      v += (k[1] - prev) * spring(t - k[0], k[2], k[3]);
      prev = k[1];
    }
    return v;
  };

  // Keyframes: kf([[t, value], [t, value, easingFn?], ...]) -> f(t). Values may be
  // numbers, arrays or objects; the easing applies to the segment that ends at that key.
  const kf = (keys) => (t) => {
    if (!keys.length) return 0;
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1];
      const b = keys[i];
      if (t <= b[0]) {
        const e = b[2] || ease;
        const k = e(clamp((t - a[0]) / (b[0] - a[0] || 1)));
        return mix(a[1], b[1], k);
      }
    }
    return keys[keys.length - 1][1];
  };

  // Instant steps at times: step([[t, value], ...]) -> f(t)
  const step = (keys) => (t) => {
    let v = keys[0][1];
    for (let i = 0; i < keys.length; i++) if (t >= keys[i][0]) v = keys[i][1];
    return v;
  };

  // mulberry32 seeded RNG — deterministic across machines.
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let x = s;
      x = Math.imul(x ^ (x >>> 15), 1 | x);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Stable seed from a string + index, so elements keep their randomness across frames.
  function hashSeed(str, i = 0) {
    let h = 2166136261 >>> 0;
    const s = String(str) + ':' + i;
    for (let k = 0; k < s.length; k++) {
      h ^= s.charCodeAt(k);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Delayed start for staggered siblings. i = index, per = seconds between items.
  const stagger = (i, per = 2 / 60) => i * per;

  // Count from a to b over [start, start+dur], eased, fixed decimals.
  function countUp(a, b, t, start, dur, decimals = 0, easing = expoOut) {
    const v = lerp(a, b, easing(seg(t, start, start + dur)));
    const p = Math.pow(10, decimals);
    return Math.round(v * p) / p;
  }

  // Visible prefix for a typing effect, at cps characters per second.
  const typed = (text, t, start, cps = 25) =>
    text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - start) * cps))));

  // Frame-independent exponential follow (used for damped cursors/cameras).
  const damp = (current, target, dt, k) => lerp(current, target, 1 - Math.exp(-k * dt));

  // Loop-safe time in [0, duration).
  const loopTime = (t, duration) => ((t % duration) + duration) % duration;

  return {
    clamp, lerp, mix, seg,
    ease, expoOut, expoIn, backOut, sineInOut, linear,
    spring, track, kf, step,
    rng, hashSeed, stagger, countUp, typed, damp, loopTime,
  };
});
