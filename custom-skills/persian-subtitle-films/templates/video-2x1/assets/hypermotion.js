/*
 * HyperMotion — the deterministic motion layer for Persian HyperFrames films.
 * Deterministic helpers over a paused GSAP timeline. No timers, no clock,
 * no unseeded randomness. Every function takes an absolute time in seconds.
 */
(function (global) {
  "use strict";

  var EASE = {
    enter: "expo.out",
    land: "power4.out",
    move: "power2.inOut",
    exit: "power3.in",
    soft: "power2.out",
    spring: "back.out(1.4)",
  };

  var DUR = {
    enter: 0.45,
    exit: 0.2,
    move: 0.9,
    hold: 1.2,
    caption: 0.18,
  };

  /* Mulberry32, seeded per element. Never share one stream across elements. */
  function seeded(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function el(target) {
    return typeof target === "string" ? document.querySelector(target) : target;
  }

  /*
   * Split on spaces only. A Persian word (including ZWNJ, e.g. می‌سازم) stays
   * one token; letters are never separated because the script is cursive.
   */
  function splitWords(root) {
    if (!root || root.dataset.hmSplit === "1") return Array.prototype.slice.call(root.querySelectorAll(".hm-word"));
    var words = [];
    var nodes = Array.prototype.slice.call(root.childNodes);

    function pushWord(text) {
      var span = document.createElement("span");
      span.className = "hm-word";
      span.style.display = "inline-block";
      span.textContent = text;
      words.push(span);
      return span;
    }

    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            frag.appendChild(pushWord(part));
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        if (!node.classList.contains("hm-word")) {
          splitWords(node).forEach(function (w) {
            words.push(w);
          });
        } else {
          words.push(node);
        }
      }
    });

    root.dataset.hmSplit = "1";
    return words;
  }

  /* Headline words: opacity + blur, entering from the right in RTL. */
  function revealWords(tl, target, opts) {
    opts = opts || {};
    var root = el(target);
    if (!root) return tl;
    var words = splitWords(root);
    var at = opts.at == null ? 0 : opts.at;
    var stagger = opts.stagger == null ? 0.07 : opts.stagger;
    var dur = opts.duration == null ? DUR.enter : opts.duration;
    var fromX = opts.fromX == null ? 18 : opts.fromX;
    var fromY = opts.fromY == null ? 0 : opts.fromY;

    words.forEach(function (w, i) {
      tl.fromTo(
        w,
        { opacity: 0, x: fromX, y: fromY, filter: "blur(6px)" },
        {
          opacity: 1,
          x: 0,
          y: 0,
          filter: "blur(0px)",
          duration: dur,
          ease: opts.ease || EASE.enter,
        },
        at + i * stagger,
      );
    });
    return tl;
  }

  /* Whole line: blur in, no travel. */
  function revealLine(tl, target, opts) {
    opts = opts || {};
    var node = el(target);
    if (!node) return tl;
    return tl.fromTo(
      node,
      { opacity: 0, filter: "blur(8px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: opts.duration == null ? DUR.caption : opts.duration,
        ease: opts.ease || EASE.soft,
      },
      opts.at == null ? 0 : opts.at,
    );
  }

  /* A hairline that draws from the right (RTL reading start). */
  function drawRule(tl, target, opts) {
    opts = opts || {};
    var node = el(target);
    if (!node) return tl;
    node.style.transformOrigin = "right center";
    return tl.fromTo(
      node,
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1,
        opacity: 1,
        duration: opts.duration == null ? 0.35 : opts.duration,
        ease: opts.ease || EASE.enter,
      },
      opts.at == null ? 0 : opts.at,
    );
  }

  /* Slow push. Apply to a wrapper, never to a .clip element. */
  function cameraDrift(tl, target, opts) {
    opts = opts || {};
    var node = el(target);
    if (!node) return tl;
    node.style.transformOrigin = "50% 50%";
    return tl.fromTo(
      node,
      { scale: opts.from == null ? 1 : opts.from },
      {
        scale: opts.to == null ? 1.03 : opts.to,
        duration: opts.duration == null ? DUR.move : opts.duration,
        ease: opts.ease || EASE.move,
      },
      opts.at == null ? 0 : opts.at,
    );
  }

  /* Mint underline under one word; draws right to left. */
  function accentUnderline(tl, target, opts) {
    opts = opts || {};
    var node = el(target);
    if (!node) return tl;
    node.style.transformOrigin = "right center";
    return tl.fromTo(
      node,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: opts.duration == null ? 0.3 : opts.duration,
        ease: opts.ease || EASE.enter,
      },
      opts.at == null ? 0 : opts.at,
    );
  }

  function toPersianDigits(value) {
    var fa = "۰۱۲۳۴۵۶۷۸۹";
    return String(value).replace(/[0-9]/g, function (d) {
      return fa[+d];
    });
  }

  /* Count-up computed from tween progress, so any seek renders the right value. */
  function countUp(tl, target, opts) {
    opts = opts || {};
    var node = el(target);
    if (!node) return tl;
    var to = opts.to == null ? 0 : opts.to;
    var prefix = opts.prefix || "";
    var suffix = opts.suffix || "";
    var persian = opts.persian !== false;
    var state = { v: opts.from == null ? 0 : opts.from };

    function paint() {
      var rounded = Math.round(state.v);
      node.textContent = prefix + (persian ? toPersianDigits(rounded) : String(rounded)) + suffix;
    }
    paint();

    return tl.fromTo(
      state,
      { v: opts.from == null ? 0 : opts.from },
      {
        v: to,
        duration: opts.duration == null ? 0.9 : opts.duration,
        ease: opts.ease || EASE.soft,
        onUpdate: paint,
      },
      opts.at == null ? 0 : opts.at,
    );
  }

  /* Surface card: no glass, no glow. */
  function cardIn(tl, target, opts) {
    opts = opts || {};
    var node = el(target);
    if (!node) return tl;
    return tl.fromTo(
      node,
      { opacity: 0, y: 24, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: opts.duration == null ? 0.4 : opts.duration,
        ease: opts.ease || "power3.out",
      },
      opts.at == null ? 0 : opts.at,
    );
  }

  /* Reveal from the right with clip-path. Large type or colour blocks only. */
  function wipeMask(tl, target, opts) {
    opts = opts || {};
    var node = el(target);
    if (!node) return tl;
    return tl.fromTo(
      node,
      { clipPath: "inset(0 0 0 100%)" },
      {
        clipPath: "inset(0 0 0 0%)",
        duration: opts.duration == null ? 0.5 : opts.duration,
        ease: opts.ease || EASE.move,
      },
      opts.at == null ? 0 : opts.at,
    );
  }

  global.HM = {
    ease: EASE,
    dur: DUR,
    seeded: seeded,
    splitWords: splitWords,
    revealWords: revealWords,
    revealLine: revealLine,
    drawRule: drawRule,
    cameraDrift: cameraDrift,
    accentUnderline: accentUnderline,
    countUp: countUp,
    cardIn: cardIn,
    wipeMask: wipeMask,
    toPersianDigits: toPersianDigits,
  };
})(window);
