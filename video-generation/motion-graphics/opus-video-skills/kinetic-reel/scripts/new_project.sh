#!/usr/bin/env bash
# new_project.sh <target-dir>
# Scaffolds a kinetic-reel project from the skill's template, installs deps and checks the toolchain.
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:?usage: new_project.sh <target-dir>}"
if [ -e "$TARGET/reel/reel.js" ]; then echo "error: $TARGET already has reel/reel.js; not overwriting" >&2; exit 1; fi
mkdir -p "$TARGET"
rsync -a "$SKILL_DIR/template/" "$TARGET/"
mkdir -p "$TARGET/out/check" "$TARGET/assets"
cd "$TARGET"
echo "== installing puppeteer-core, three"
npm install --silent
echo "== toolchain"
command -v node   >/dev/null && echo "node   $(node -v)"   || echo "MISSING: node"
command -v ffmpeg >/dev/null && echo "ffmpeg ok"           || echo "MISSING: ffmpeg (brew install ffmpeg)"
for c in "${CHROME_PATH:-}" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" /usr/bin/google-chrome /usr/bin/chromium; do
  [ -n "$c" ] && [ -x "$c" ] && { echo "chrome $c"; FOUND=1; break; }
done
[ "${FOUND:-}" = 1 ] || echo "MISSING: Chrome (install it, or pass --chrome=<path> to render.mjs)"
echo "== ready: $TARGET   (try: npm run sheet  → out/check/sheet.jpg)"
