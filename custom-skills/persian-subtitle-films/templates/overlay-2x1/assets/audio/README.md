# Sound-effect files — not redistributed

The overlay template's `<audio>` cues expect these five recordings in this folder.
They are Mixkit sounds; Mixkit's licence lets you use them in your own work but not
share the files, so they are deliberately absent from this repository. Download them
before the first `hyperframes check`, or repoint the cues at your own library.

| File used by the template | Mixkit effect |
|---|---|
| `whoosh-fast.mp3` | fast air whoosh (scene enter/exit) |
| `glass-hit-cine.mp3` | cinematic glass hit (card land) |
| `pop.mp3` | small pop (chip lands) |
| `ui-click-tone.mp3` | UI click (typing, toggles) |
| `typewriter-digital.mp3` | digital typewriter (terminal typing) |

Browse them at <https://mixkit.co/free-sound-effects/ui/> and
<https://mixkit.co/free-sound-effects/notification/>.

To verify a scaffolded overlay without any audio, delete or mute the `sfx-*`
clips in `index.html` — the composition still renders, and `check` reports
`film_silent`, which is an expected warning rather than an error.
