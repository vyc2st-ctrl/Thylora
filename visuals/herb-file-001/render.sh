#!/usr/bin/env bash
# THYLORA · HERB FILE 001 — WHITE WILLOW · deterministic preview render
#
# The source HTML is seeded, so the same input always produces the same bytes
# and therefore the same SHA-256 recorded in the version binding.
#
# Headless Chromium here paints 80 CSS px short of the requested window height,
# so the still is rendered into an over-tall viewport and the exact 1080x1350
# frame is cropped out with pngcrop.py (stdlib only — no image library needed).
#
# usage: ./render.sh [output-dir]
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${1:-$HERE}"
CHROME="${CHROME:-/opt/pw-browsers/chromium}"
SRC="$HERE/herb-file-001-white-willow.html"

W=1080; H=1350; PAD=80          # PAD compensates the headless paint shortfall

FLAGS=(--headless --no-sandbox --disable-gpu --hide-scrollbars
       --disable-lcd-text --virtual-time-budget=5000)

tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
mkdir -p "$OUT"

render() {                       # render <scale> <tmpfile>
  "$CHROME" "${FLAGS[@]}" --force-device-scale-factor="$1" \
    --window-size="$W,$((H + PAD))" --screenshot="$2" "file://$SRC" 2>/dev/null
}

render 2 "$tmp/tall2x.png"
render 1 "$tmp/tall1x.png"

python3 "$HERE/pngcrop.py" "$tmp/tall2x.png" "$OUT/herb-file-001-white-willow@2x.png" \
        0 0 $((W * 2)) $((H * 2))
python3 "$HERE/pngcrop.py" "$tmp/tall1x.png" "$OUT/herb-file-001-white-willow.png" \
        0 0 "$W" "$H"

echo
echo "SHA-256:"
for f in "$OUT/herb-file-001-white-willow@2x.png" "$OUT/herb-file-001-white-willow.png"; do
  printf '  %-40s %s\n' "$(basename "$f")" "$(sha256sum "$f" | cut -d' ' -f1)"
done
