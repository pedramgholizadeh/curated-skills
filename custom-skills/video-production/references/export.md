# Export, reframe and delivery

Everything leaves as H.264 High, `yuv420p`, limited range, bt709, faststart, with an AAC track. Platforms re-encode what you upload; a broken intermediate becomes a washed-out final.

## 1. Master encode

```bash
ffmpeg -y -i frames_or_source -c:v libx264 -profile:v high -preset slow -crf 16 \
  -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -c:a aac -b:a 192k -movflags +faststart renders/master.mp4

# CPU-capped equivalent (the line above lets libx264 grab every core; add an explicit
# -threads budget on a laptop — identical output, gentler on the machine):
ffmpeg -y -i frames_or_source -c:v libx264 -profile:v high -preset slow -crf 16 -threads 4 \
  -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -r 30 -c:a aac -b:a 192k -movflags +faststart renders/master.mp4
```

- Master: CRF 16–18. Web copy: CRF 20–23, downscaled.
- 1080p30 lands around 8–12 Mbps; don't "max out" bitrate — platforms cap it anyway.
- 60fps only when the motion is fast and continuous (motion graphics, gameplay); 30fps otherwise.
- If the source came from a phone (often HEVC, full range), always re-encode rather than re-mux.

## 2. Platform profiles

| Profile | Size | Frame | Notes |
|---|---|---|---|
| YouTube / web | 1920×1080 | 16:9 | CRF 16–18 master |
| YouTube 4K | 3840×2160 | 16:9 | only if source is ≥2x |
| Shorts / Reels / TikTok | 1080×1920 | 9:16 | safe zone below |
| Instagram feed | 1080×1080 | 1:1 | |
| LinkedIn | 1080×1350 | 4:5 | or 1920×1080 for feed video |
| Cinematic | 2560×1080 | 21:9 | |

### Vertical safe zone

Apps draw captions, buttons and profile info over the edges. Keep every word and logo:

- between **y 360 and y 1420**
- out of the **right 120px**
- ideally 60px margin on the left too

A 16:9 clip scaled to 1080 wide is 608 tall — it sits well at y 660, with the headline above it inside the zone.

## 3. Horizontal → vertical

Build a transparent `1080×1920` PNG overlay in HTML (headline + logos as styled text) and screenshot it; text you style in the browser beats text burned by ffmpeg.

```bash
ffmpeg -y -i in.mp4 -loop 1 -i overlay.png -f lavfi -i anullsrc=r=48000:cl=stereo \
 -filter_complex "color=c=0x0B0B0F:s=1080x1920:r=30[bg];\
 [0:v]fps=30,scale=1080:-2,setsar=1[v];\
 [bg][v]overlay=0:660:shortest=1[o];\
 [o][1:v]overlay=0:0:shortest=1,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[out]" \
 -map "[out]" -map 2:a -shortest \
 -c:v libx264 -profile:v high -crf 18 -pix_fmt yuv420p -color_range tv -colorspace bt709 \
 -c:a aac -b:a 128k -movflags +faststart reel.mp4
```

Swap `-map 2:a` for `-map 0:a` when the source has sound.

Blurred-fill variant (no overlay):

```bash
ffmpeg -y -i in.mp4 -filter_complex \
"[0:v]fps=30,split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=40[bg];\
 [b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p[out]" \
 -map "[out]" -map "0:a?" -c:v libx264 -crf 18 -movflags +faststart vertical.mp4
```

## 4. Captions

Burn-in with style (never rely on default white-on-white):

```bash
ffmpeg -y -i in.mp4 -vf "subtitles=subs.srt:force_style='FontName=Inter,FontSize=18,PrimaryColour=&H00FFFFFF,BorderStyle=3,Outline=0,Shadow=0,MarginV=60'" \
 -c:a copy out.mp4
```

For social, prefer captions authored in the composition (you control position inside the safe zone) over ffmpeg burn-in. Sidecar `.srt` for YouTube.

## 5. Derived assets

```bash
# poster frame
ffmpeg -y -ss 2.5 -i master.mp4 -frames:v 1 -q:v 2 renders/poster.jpg

# silent cut (keeps video frames, drops audio)
ffmpeg -y -i master.mp4 -an -c:v copy renders/silent.mp4

# web copy
ffmpeg -y -i master.mp4 -vf "scale=1600:-2:flags=lanczos" -c:v libx264 -preset slow -crf 23 \
  -c:a aac -b:a 128k -movflags +faststart renders/web.mp4

# looping GIF
ffmpeg -y -i master.mp4 -vf "fps=15,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" renders/loop.gif
```

## 6. Acceptance test

```bash
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,pix_fmt,color_range,color_space,r_frame_rate \
  -of compact renders/master.mp4
```

Pass means: `h264`, expected `WxH`, `yuv420p`, `color_range=tv`, `bt709`, plus one `aac` stream. `hevc` or `color_range=pc` means encode again.

Audio:

```bash
ffmpeg -nostats -i renders/master.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
```

Defects:

```bash
ffmpeg -i renders/master.mp4 -vf "blackdetect=d=0.1:pix_th=0.10" -an -f null - 2>&1 | grep blackdetect
ffmpeg -i renders/master.mp4 -vf "freezedetect=n=0.003:d=2" -map 0:v -f null - 2>&1 | grep freeze
```

Black or frozen segments in a piece that isn't supposed to have them are bugs, not style.

## 7. Delivery folder

```
renders/master.mp4        full quality, with audio
renders/silent.mp4        video only (for VO/dub)
renders/poster.jpg        first-frame-of-value
renders/web.mp4           lighter copy if requested
brief.md beat-sheet.md design-spec.md
CREDITS.txt SOUND.md
src/                      the HTML page or Remotion project
```

Close with a short note: length, format, what is placeholder, what to change for v2, and one alternative direction you'd try. Don't open a browser preview unless asked; if asked, serve the final render, not a dev server.
