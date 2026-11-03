# cool-render

Hard limits for every video job on a shared or heat-sensitive machine: cap CPU
(default 50%), keep each output under a size budget (default 200 MB), force CFR
30 fps. Distilled from the maintainer's own thermal and file-size policy — a
render may take hours; the machine must not heat up and no file ships oversized.

Prerequisites: `bash` (macOS + Linux; **Windows needs porting** — core-detection
and `taskpolicy` paths assume POSIX), plus `ffmpeg`/`ffprobe` for `fit-size`.
Tune via `COOL_RENDER_CPU_PCT`, `COOL_RENDER_MAX_MB`, `COOL_RENDER_MIN_KBPS`
(defaults 50, 200, 400).

Files: `SKILL.md` (rules, per-tool flags, bitrate derivation, checklist);
`scripts/cool-run` (half-power wrapper + `--threads`/`--check`);
`scripts/fit-size` (two-pass 30 fps re-encode enforcing the budget, keeping the
oversized original as `-oversize.bak.mp4`).
