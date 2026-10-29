// reel/cues.js: THE timeline. The page (reel.js) and the score (music/score.mjs) both read it, so every hit in the
// music lands on its frame. 120 BPM: a beat is 0.5 s, a bar 2 s. Put cuts on beats; put chapter changes on bars.
var KCUE = (() => {
  const B = n => +(n * 0.5).toFixed(4);                    // B(n) = time of beat n
  const S = { open: 0, title: 3, stat: 6, flow: 9, quote: 12, end: 14 };   // scene starts (s)
  return {
    bpm: 120, fps: 30, dur: 17, B, S,
    // chapters: drive the segmented progress bar in the HUD (names starting with a digit count as sections)
    CH: [['OPEN', 0, 3], ['01 TITLE', 3, 9], ['02 SYSTEM', 9, 14], ['END', 14, 17]],
    hits: {
      dot: 1, mark: 2,
      title: 3.1, chips: 4.5,
      flip: 6.4,
      nodes: [9.1, 9.35, 9.6], hops: [10, 10.5, 11, 11.5],
      words: [12.1, 12.5, 12.9],
      name: 14, glitch: 16, endDot: 16.5,
    },
  };
})();
if (typeof module !== 'undefined') module.exports = KCUE;
