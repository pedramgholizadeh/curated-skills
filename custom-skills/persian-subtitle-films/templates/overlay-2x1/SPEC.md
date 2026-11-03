# SPEC — overlay-2x1 starter

```text
TYPE:    transparent overlay layer, composited above the user's own video
OUTPUT:  HyperFrames, 1920 x 960 (2:1), 30 fps CFR
         WebM VP9 alpha, CRF 22, <= 200 MB (no ProRes master: it is ~2 GB)
TIME:    13.8 s demo; root data-duration must equal the main video length
LOOK:    liquid glass, border-radius 5px everywhere;
         smoky base rgba(19,22,22,.62 -> 14,16,16,.48) over white sheen;
         mint #55e6a5 icons + accent, lime #e8fe51 prompt, white ink;
         caustic mint/salmon blobs blurred 16px, 5.5% fractal grain, one sheen pass
ICONS:   Material Symbols Outlined, inlined from icons/ via modules/icons.js
TYPE:    Vazirmatn 700/800 for Persian, 400/500 labels, 34-40px minimum
MOTION:  enter expo.out .5 s (y 22, blur 10); icon back.out(2);
         Persian = clip-path wipe right->left; Latin = 0.055 s per-char stagger;
         exit power3.in .4 s at beat end - 0.45 s; caustic drifts every beat
SHOTS:   0.4 - 7.0   title chip (top-right), icon pop + wipe + caret
         7.8 - 13.8  ffmpeg terminal (bottom-left), command typing
SFX:     whoosh + glass hit on entrance, typewriter under typing,
         click on the output line; CC0, peaks around -6 dBFS
BANNED:  background colour, backdrop-filter, centre-screen cards, corner logo,
         emoji, per-letter Persian reveal, repeat:-1, unknown ids on media
QA:      snapshot each beat, check RGBA + alpha share per frame in the WebM,
         volumedetect, confirm first frame is transparent, size < 200 MB
```

## Notes

- Every box — card, chip, node, pill — uses `border-radius: 5px`. No exceptions.
- Anchor beats to corners / a bottom strip; never cover the centre third.
- Add `data-hold` to every beat. Gaps between beats are intentional.
- Audio clips need a unique `id` or the renderer drops them silently.
- `npx hyperframes check` must report 0 errors before rendering.
