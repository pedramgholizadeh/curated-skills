# 🎥 Video Shotcraft (vendored)

A cinematic product-video skill driven by shot recipe cards, vendored as contributed by Ahmad Mousavi.

Upstream: [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) · [ahmadmousavi.ir](https://ahmadmousavi.ir)

The premise: a product video is a sequence of *shots*, and each shot has a recipe. The skill
picks recipes from a card deck, drives a validated Remotion template with real page
screenshots and 2.5D camera moves, cuts on the beat, and mixes sound design — so the output
looks directed rather than generated.

## What is in this folder

| Path | Role |
|---|---|
| [SKILL.md](SKILL.md) | The skill itself (upstream text is Chinese; the reference docs below are the same material in usable form). |
| `references/shots/` | Shot recipe cards — the move, the easing, when to use it. |
| `references/sequences/` | Beat sheets that stitch cards into a film. |
| `references/*.md` | Aesthetic rules, pipeline, beat-sync, sound design, final review, workbench, Jianying export, upload. |
| `template/` | Validated Remotion project (`src/`, `themes/`, `TEMPLATE.md`, `THEMES.md`) — the render target. |
| `shot-polish/` | Per-shot comparison and decision log tooling (`build-compare.py`, `serve.py`, sheet templates). |
| `workbench/` | Interactive preview harness for trying shots before committing. |
| `jianying-export/`, `publish/` | Export to Jianying/CapCut drafts and upload helpers. |
| `agents/openai.yaml` | Upstream agent config for Codex-style runners. |

## Trimming notes

Demo films, gallery renders and stock footage (~100 MB of `.mp4/.png` previews) are not
mirrored; every instruction file, recipe card, script and the render template are intact.

## License

Apache-2.0 — see [LICENSE](LICENSE).

Links from upstream docs into `demos/`, `gallery/` and `template/public/` screenshots are
dead here for the same reason.
