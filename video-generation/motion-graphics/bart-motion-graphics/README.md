# 🎞 Motion Graphics for talking-head video (vendored)

Six production skills for motion graphics on real footage, vendored as contributed by Ahmad Mousavi.

Upstream: [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) · [ahmadmousavi.ir](https://ahmadmousavi.ir)

The centre of gravity here is *footage that already exists*: take a screen recording or a
talking-head take, and the pack adds timed motion-graphic B-roll, separates the subject
from the background, and lays a measured sound pass on top — rendered to MP4 from code.

## Skill index

| Skill | One-line job |
|---|---|
| [explainer-default](explainer-default/SKILL.md) | Clean 45–90 s product demo, code → MP4 with music. |
| [explainer-engaging](explainer-engaging/SKILL.md) | 10–30 s continuous-shot explainer around one hero idea. |
| [explainer-high-energy](explainer-high-energy/SKILL.md) | 12–20 s high-energy promo with synthesised sound. |
| [motion-broll](motion-broll/SKILL.md) | Talking-head + transcript → B-roll timed to the words. |
| [object-separation](object-separation/SKILL.md) | Cut person/product/hand from the background locally (SAM 2). |
| [sound-effects](sound-effects/SKILL.md) | A measured sound pass for motion-graphics video (HyperFrames, Remotion, GSAP). |

## Trimming notes

`sfx/` audio samples (~2.6 MB of free-licensed .ogg files), upstream `docs/` previews and
demo footage are **not** mirrored. `sound-effects` ships its attribution and sourcing
notes (`LICENSES.md`, `TOP-PICKS.md`, `MUSIC.md`) so you can fetch the same packs; or copy
the samples straight from upstream:

```bash
git clone --depth 1 https://github.com/Barty-Bart/motion-graphics
cp -r motion-graphics/skills/sound-effects/sfx <this folder>/sound-effects/
```

Links from the upstream per-skill `README.md` files into `sfx/`, `docs/` and demo footage
are dead here for the same reason.

## License

MIT — see [LICENSE](LICENSE). Third-party sound assets keep their own licenses as listed
in `sound-effects/LICENSES.md`.
