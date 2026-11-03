# Motion design

Cinematic comes from camera, light, rhythm and sound — not from more animation. Everything below assumes the piece has one clock (`t` in seconds) and that every value is derived from it.

## 1. Principles

- **One idea moves per shot.** Pick the single thing the shot is about; everything else is still or ambient.
- **Show the change as a transformation, not a swap.** A button becomes a player, bars become a line, a card becomes a window. A cross-fade between two images reads cheap every time.
- **Always something alive, never two foci.** A slow push, a drifting particle, a blinking caret, a sweeping highlight — but only one element may compete for attention.
- **Hold is where people look.** Give the after-state ≥1.2s and keep something small alive inside the hold (progress bar, cursor, second wave of light).
- **Ghost the before.** A faint outline where the object started sells the transformation.
- **Stagger by a beat.** Rows, letters, dots each start 1–2 frames later than the previous.
- **Anticipation, then follow-through.** A small pull-back before a push; a tiny overshoot and settle after a landing. Never a straight line.

## 2. Timing and easing (calibrated values)

| Move | Duration | Curve |
|---|---|---|
| Object entrance | 0.30–0.60s | expo-out / spring w=22 z=0.8 |
| Text line landing | 0.40–0.70s | expo-out, y offset 20–40px, mask reveal |
| Camera push | 0.60–1.20s | ease-in-out cubic |
| Camera glide between chapters | 0.80–1.40s | ease-in-out, damped |
| Dissolve between scenes | 0.30–0.40s | blur-dissolve, outgoing layer only |
| Number count-up | 0.60–1.20s | ease-out, never linear |
| Hard cut + impact | 0 frames | only at chapter slams |
| Holds | ≥1.2s text, ≥1s logo, ≥3s end card | — |

Springs: `w` = 8 slow, 14 normal, 22 snappy; `z` = 0.82 slight settle, ≥0.95 no overshoot (use ≥0.95 for cameras). Damping below ~0.6 reads as a toy.

Easing library: `easeInOutCubic` (default), `expoOut` (entrances), `backOut` (pops, guard radii against negatives), `linear` (progress only). Implement in code; don't rely on CSS transitions.

## 3. Camera

The camera is the editor. Each scene is a layer with its own camera wrapper: `transform: translate(x,y) scale(s) rotate(r)` driven by keyframes or a damped follow.

- **Push in** on a title until the line spans ~75% of frame width, highlight one word as it arrives.
- **Ride along** with typing (follow the caret, measure text width), with a cursor, or with a scrolling list.
- **Pull back** after the action so the viewer sees context, then glide to the next scene.
- **Damped follow** for a cursor or a moving object: `x = lerp(x, target, 1 - exp(-k*dt))`, k ≈ 6–10. This is the "Screen Studio" feel.
- **Ken Burns** for stills: 3–8% scale over 4–8s, one direction, never a bounce.
- **Handheld** only for a deliberate organic look: low-amplitude multi-frequency noise, seeded.

Camera moves never bounce; if the frame shakes, it's a bug.

## 4. Transitions

Inside a chapter prefer **continuity**:

- zoom through the element the eye is already on;
- iris from the thing that just lit up;
- match cut on a shared shape or position;
- wipe driven by a moving object.

Hard cut + impact is for chapter slams only, ≤3 per piece. Slide transitions in a "premium" piece read as a template. Shape-continuity transitions carry energy without breaking place.

## 5. Typography motion

- Mask reveal (clip-path rising from below the baseline) beats fade + scale.
- Kinetic lines: ≤5 words on screen; one word can be swapped/morphed in place (rotating use case) while the rest holds.
- Letter-spacing animates tighter as size grows; large type needs tight tracking.
- Numbers roll with digit-column translation (odometer), not a blur.
- Never typewriter-reveal a headline. Typing belongs only inside a product input box (where a real user types).
- For CJK/bilingual: large English headline, small CJK annotations; keep a list of every glyph used so fonts subset correctly.

## 6. UI moments

Rebuild the product's interface as clean vector UI when you have its real layout; use real screenshots (2x, element crops, coordinates) when reproducing an existing page.

- One action at a time, at real speed: typing ~25 chars/s, ticks and results 0.3–0.5s apart.
- Cursor: macOS arrow, gentle curves, arrives a beat before the click, small press dip, soft ripple.
- Results stack with depth-of-field: far cards smaller and blurred.
- Loading shimmer only while genuinely waiting; no fake spinners on a finished state.
- Popovers, reasoning panels and source cards are good "quality beats" — they prove the product thinks.

## 7. The sixteen effect recipes

Each is one 8s loop (move 0→2.2, hold to 6.6, return by 8.0, frame 0 == frame 8) or a hold-once cut.

| # | Effect | From → to | Premium detail |
|---|---|---|---|
| 01 | Button → player | pill button becomes video frame | ripple expands into the frame mask |
| 02 | Search → results | query line becomes result list | result count ticks as rows land |
| 03 | Card → workspace | small card expands into full editor | neighbouring cards recede with blur |
| 04 | Tabs → panels | tab strip unfolds into panels | active tab underline travels, never jumps |
| 05 | Chart morph | bars become a line | axis labels morph with the marks |
| 06 | Dashboard zoom | full dashboard pushes into one KPI | other widgets dim by depth, not opacity fade |
| 07 | Spring stack | three cards stack and swap | each card lands with a small settle |
| 08 | Magnetic dock | icons drift toward cursor | spacing compresses as objects approach |
| 09 | Masked type | campaign name wipes in | mask edge has a soft 2px feather |
| 10 | Elastic type | title card snaps in | letters overshoot then settle in sequence |
| 11 | Text → layout | headline becomes a carousel cover | text reflows, not cross-fades |
| 12 | Image reveal | image tears open from a line | reveal edge follows a shape, not a linear wipe |
| 13 | Perspective shift | flat layers separate into 3D stack | shadows grow with separation |
| 14 | Glass focus | panel blurs, one line sharpens | blur transitions through a moving focus band |
| 15 | Flowing paths | one node feeds several channels | particles keep constant speed, no easing |
| 16 | Particle logo | dots converge into the mark | particles arrive on a stagger, not a wave |

## 8. Data and charts

- Clean room: one figure or one series per shot. If the chart needs a legend, it's a different video.
- Axes start at zero for bars; label units; label the source, on frame, if it's a claim.
- Count-ups ease-out and land exactly; never overshoot a factual number.
- Illustrative data is labelled `SCHEMATIC` / `EXAMPLE` on every frame it appears.
- No per-dimension data you don't have; visualize the process instead.

## 9. Loops, grain, texture

- Loop seam: `t % duration`; anything straddling the seam (landing squash, sound tail) is drawn or mixed at both ends so frame 0 == frame N.
- Grain/noise: seeded buffer, constant density, subtle (2–4% opacity); draw once to a canvas, don't regenerate per frame.
- Light leaks / bloom: one per piece at most, on a deliberate moment.

## 10. Determinism and performance

- Pure `seek(t)`; precompute simulations at load (1/240s) and interpolate.
- Fonts: load all declared faces explicitly before first frame; fallback fonts on frame 0 is a known bug.
- Avoid live CSS `filter: blur()` on huge elements and full-screen gradients — draw them once to a canvas or an image and move that.
- 2x device scale only if text is thin; otherwise 1x and bigger type.
- Clamp math that can go negative (`backOut` radii, `pow()` bases, filter cutoff/quality).
