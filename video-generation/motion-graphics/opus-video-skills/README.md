# 🖌 Opus Video Skills (vendored)

Two hand-built video styles rendered locally from code, vendored as contributed by Ahmad Mousavi.

Upstream: [tuzhechen2005/opus-video-skills](https://github.com/tuzhechen2005/opus-video-skills) · [ahmadmousavi.ir](https://ahmadmousavi.ir)

Both skills render an MP4 from code on your own machine — no video model, no cloud render —
so the look is fully deterministic and re-runnable.

## Skill index

| Skill | One-line job |
|---|---|
| [kinetic-reel](kinetic-reel/SKILL.md) | Kinetic-typography reels: showreels, portfolio reels, product promos, intros. |
| [painted-animation](painted-animation/SKILL.md) | Watercolour-and-ink cartoon videos, painted frame by frame with p5.js + p5.brush. |

`painted-animation` ships a `template/` p5 sketch plus per-scene notes; both skills read a
brief and produce a storyboard before rendering, so iterate on the board, not the render.

## Trimming notes

Sample output (`.gif`, `.mp4` previews, ~8 MB) is not mirrored; the source sketch and all
instructions are intact. Links from the upstream per-skill `README.md` files into those
previews and their `examples/` renders are dead here for the same reason.

## License

MIT — see [LICENSE](LICENSE).
