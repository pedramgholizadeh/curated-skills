---
name: cool-render
description: Enforce hard CPU, file-size and frame-rate limits on every video production job — render, transcode, encode, export, snapshot, whisper/transcribe, HyperFrames, Remotion, FFmpeg, WebM/MOV/MP4. Caps the machine at a configurable share of CPU (default 50%), keeps every output under a configurable budget (default 200 MB), and forces CFR 30 fps. Use whenever launching or queueing any media render or export on a shared or thermally-constrained machine.
sources:
  - video-generation/editing-workflows
  - video-generation/cinematic-promos
---

# Cool, small, 30 fps renders

Three non-negotiable limits for **every** video task on a shared or
heat-sensitive machine. Wall-clock time is never a reason to break them — slow
renders are acceptable, an overheated chassis or a 2 GB file is not.

| # | Rule | Default | Override |
|---|---|---|---|
| 1 | Use at most half the CPU (never heat the chassis) | `CPU_PCT=50` | `COOL_RENDER_CPU_PCT` |
| 2 | Never deliver a file over budget | `MAX_MB=200` | `COOL_RENDER_MAX_MB` |
| 3 | Always CFR 30 fps output | `TARGET_FPS=30` | edit `fit-size` |

The two helpers live in `scripts/`. Reference them as `<skill-dir>/scripts/...`
— vendor both files into a project, or point at wherever the skill is installed:

```bash
COOL=<skill-dir>/scripts/cool-run
FIT=<skill-dir>/scripts/fit-size
```

`cool-run` is portable: cores via `sysctl -n hw.physicalcpu` (macOS) or
`nproc` / `/sys/devices/system/cpu/possible` (Linux); background QoS via
`taskpolicy` only where it exists, else it degrades to `nice`. `fit-size` needs
`ffmpeg` + `ffprobe` and mirrors the same detection.

## 1. Half power — `cool-run`

Wrap any command; it caps BLAS/OpenMP/vecLib threads at the share and lowers
scheduling priority before exec.

```bash
$COOL --threads          # print the computed thread cap (cores * CPU_PCT%)
$COOL --check            # cap, load average, thermal state, heavy jobs now
$COOL npx hyperframes render -o renders/final.mp4 --workers 2
$COOL ffmpeg -threads 4 -i in.mp4 -c:v libx264 out.mp4
$COOL whisper -t 4 -m model.bin -f audio.wav
```

Rules that go with the wrapper:

- **One heavy job at a time.** Never run a render, a transcode and a
  transcription concurrently. Queue them sequentially (`a && b && c`) in one
  shell call, or wait for the previous job to finish. Run `$COOL --check` first;
  if another job is above ~30% CPU, wait before starting yours.
- **Never `--workers auto`.** Renderers calibrate that to all cores and ignore
  the cap. Always pass an explicit worker/thread count that matches
  `$COOL --threads` or lower.
- **Prefer a slower preset over more threads.** `-preset slow` shrinks the file
  at the same quality and costs no extra cores; more threads cost heat.
- If `--check` reports a thermal/CPU-slowdown warning or the fan is audible,
  stop the queue, wait a few minutes, then resume.

### Per-tool flags

| Tool | Flag(s) to honour the cap | Never do |
|---|---|---|
| HyperFrames | `--workers N` (N ≤ cores/2, or cores/4 since each worker is a full Chrome) | `--workers auto` |
| FFmpeg | `-threads N` (add `-filter_threads`/`-filter_complex_threads` when filters dominate) | leave default |
| whisper.cpp | `-t N` | unbounded threads |
| Remotion / headless Chrome | `--concurrency N` (each is a browser process) | `concurrency: 'auto'` |

## 2. Output under budget — `fit-size`

Budget the bitrate **before** the encode, then let `fit-size` be the safety net.

```bash
$COOL npx hyperframes render -o renders/reel.mp4 --workers 2 --quality delivery
$FIT renders/reel.mp4 200
```

`fit-size <file.mp4> [max_mb]` measures the render; only if it exceeds the
budget does it two-pass re-encode to the computed bitrate at the core cap, keep
30 fps CFR, and replace the file. The oversized original is preserved as
`-oversize.bak.mp4`. Budget resolution order: positional arg →
`COOL_RENDER_MAX_MB` → 200.

It **refuses** to run when the budget would force the video bitrate below the
`COOL_RENDER_MIN_KBPS` floor (default 400 kbit/s) — better to accept the
oversized file than ship a blocky one. Raise the budget, shorten the clip, or
keep the `.bak`.

## 3. 30 fps CFR

- Composition: render at the composition rate; declare 30 fps up front.
- FFmpeg: `-r 30` plus `-fps_mode cfr` (older builds: `-vsync 2`); when
  retiming, `setpts=PTS/<k>,fps=30`.
- Source at 25/60/VFR: normalise to 30 CFR in the master step, not at export —
  phone footage is often VFR and must be forced.

## How the numbers are derived

The video bitrate comes straight from the size budget:

```
video_kbit_s = int(MAX_MB * 8 * 1000 / duration_seconds) - 130
```

`MAX_MB * 8 * 1000` converts decimal MB to kilobits; divide by duration for
kbit/s; subtract ~130 to leave room for the 128 kbit/s AAC track. `fit-size`
applies this, floors it at `MIN_KBPS`, and writes `-b:v / -maxrate` at that
value with `-bufsize` at 2×.

**Worked example** — 200 MB budget, 122.8 s clip:

```
200 * 8 * 1000 / 122.8 = 13029 kbit/s
13029 - 130            ≈ 12899 kbit/s  → ~12.9 Mbit/s video
```

So a ~2-minute reel renders comfortably near 13 Mbit/s and still lands under
200 MB.

## Worked example — a 2-minute reel

The full copy-paste pattern: wrap the renderer, then fit the output. Replace
`<project>` with the working directory.

```bash
cd <project>
COOL=<skill-dir>/scripts/cool-run
FIT=<skill-dir>/scripts/fit-size

$COOL --check                                   # confirm the slot is free
$COOL npx hyperframes render -o renders/reel.mp4 \
      --workers 2 --video-bitrate 12M --max-bitrate 14M
$FIT renders/reel.mp4 200                       # only re-encodes if over budget
```

## Verification checklist (run before reporting a render done)

```bash
ffprobe -v error \
  -show_entries format=duration,size \
  -show_entries stream=codec_name,codec_type,r_frame_rate,width,height \
  -of default=noprint_wrappers=1 out.mp4
$COOL --check
```

Assert every item:

- [ ] `codec_name=h264` (progressive — no interlaced field flags) on the video stream
- [ ] `r_frame_rate=30/1` on the video stream
- [ ] size (bytes) ≤ `MAX_MB * 1000000`
- [ ] `--check` shows the job ran within the cap and the machine is not thermally throttled

Report MB against the budget, `r_frame_rate=30/1`, and that the machine stayed
under the cap. Do not claim a render finished while a capped job is still running.

## Resources

| Path | Use |
|---|---|
| `scripts/cool-run` | half-power wrapper + `--threads` / `--check` |
| `scripts/fit-size` | size-budget guard, 30 fps CFR, keeps `-oversize.bak.mp4` |
