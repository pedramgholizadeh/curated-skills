# SPEC.md template

Copy this into `videos/<slug>/SPEC.md` and replace every `<…>`. Numbers, not
adjectives. If a number is unknown, the scene is not ready.

```text
GOAL:    <what the viewer feels or does at the end — one sentence>
OUTPUT:  HyperFrames, 1920 x 960 (2:1), 30 fps, H.264
TIME:    <seconds> s = <frames> frames; source SRT <file>, <n> cues
LOOK:    ground #1D1D1D; ink #FFFFFF; accent #55E6A5 only on <the one word>;
         Vazirmatn 800 for display at <px>, 700 for captions at <px>, 400 for body at <px>;
         background = radial glow 82%/8% at 0.18 + 12%/96% at 0.12, dot field 34 px pitch
         at 0.35, three mint wave crests at 0.18/0.10/0.06; grain 0%;
         no shadow beyond 0 18px 60px rgba(0,0,0,.35)
OBJECTS: dot wave, mint rule, accent dot, caption band, one end-card lockup
MOTION:  enter expo.out 0.45 s; land power4.out; exit power3.in 0.20 s;
         camera power2.inOut 1.00 → 1.03; caption fade 0.18 s, hard kill at end;
         word stagger 0.07 s; RTL: enter from right, exit left
SHOTS:   one line per scene — frame range | the one hero move | what is read
         | sound | handoff
         0 – 4.5 s      title: kicker + rule + headline, camera push   | — | blur swap
         4.5 – 38.0 s   captions: SRT cards, chapter beats at <t…>     | — | —
         38.0 – 41.0 s  end card: lockup + site, hold                  | — | end
BANNED:  purple/blue gradients, glass cards, emoji, typewriter Persian,
         per-letter split, glow pulse, logo corner, KPI grid, text moving while read
QA:      0.3 (stage alive), 1.2 (title landed), 2.5 (hold), <first caption>,
         <chapter>, <last caption>, <end card>, <end-0.1>
```

## Rules for filling it

- The LOOK line is the only colour/type source for the film. Scenes copy it.
- Every adjective in the brief becomes a number here (see
  `references/brand-look.md`).
- SHOTS sums to the root `data-duration`; check the arithmetic before building.
- BANNED starts with the house defaults and grows with every flaw found in QA.
- QA times come from the SRT, not invented; add one mid-scene per chapter.
