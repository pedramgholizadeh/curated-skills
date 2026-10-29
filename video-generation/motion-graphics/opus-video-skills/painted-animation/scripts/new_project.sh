#!/usr/bin/env bash
# new_project.sh <target-dir> [--keep-demo]
# Scaffolds a painted-animation project from the skill's template, installs deps and checks the toolchain.
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:?usage: new_project.sh <target-dir> [--keep-demo]}"
KEEP_DEMO="${2:-}"

if [ -e "$TARGET/studio.html" ]; then echo "error: $TARGET already has a studio.html; not overwriting" >&2; exit 1; fi
mkdir -p "$TARGET"
rsync -a "$SKILL_DIR/template/" "$TARGET/"
mkdir -p "$TARGET/assets" "$TARGET/out/check"

# The demo is an example, not a template: unless asked, unhook it so the new video starts clean.
if [ "$KEEP_DEMO" != "--keep-demo" ]; then
  sed -i.bak 's|<script src="src/scenes/demo.js"></script>|<!-- <script src="src/scenes/demo.js"></script>  (example only) -->|' "$TARGET/studio.html" && rm -f "$TARGET/studio.html.bak"
fi

cd "$TARGET"
echo "== installing p5, p5.brush, puppeteer-core"
npm install --silent

echo "== toolchain"
command -v node   >/dev/null && echo "node   $(node -v)"   || echo "MISSING: node"
command -v ffmpeg >/dev/null && echo "ffmpeg ok"           || echo "MISSING: ffmpeg (brew install ffmpeg)"
for c in "${CHROME_PATH:-}" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" /usr/bin/google-chrome /usr/bin/chromium; do
  [ -n "$c" ] && [ -x "$c" ] && { echo "chrome $c"; FOUND=1; break; }
done
[ "${FOUND:-}" = 1 ] || echo "MISSING: Chrome (install it, or pass --chrome=<path> to render.mjs)"
echo "== ready: $TARGET"
