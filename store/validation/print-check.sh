#!/usr/bin/env bash
# THYLORA STORE · print check · WR-STORE-UTILITY-582
#
# Renders each utility packet to A4 PDF with headless Chromium and refuses any
# packet that spills onto an extra page or prints a page with no ink on it.
#
#   store/validation/print-check.sh
#
# Requires: a Chromium/Chrome binary and python3 with pypdf.
# Everything else in this lane runs with no dependency at all; this check is the
# one place we need a real print engine, because "no blank white PDF" is a claim
# about printed output and nothing else can prove it.
set -euo pipefail
cd "$(dirname "$0")/../.."

CHROME="${CHROME:-}"
if [ -z "$CHROME" ]; then
  for c in "$(command -v chromium || true)" "$(command -v google-chrome || true)" \
           /opt/pw-browsers/chromium-*/chrome-linux/chrome; do
    [ -x "${c:-}" ] && CHROME="$c" && break
  done
fi
[ -n "$CHROME" ] || { echo "No Chromium found. Set CHROME=/path/to/chrome."; exit 3; }

PORT="${PORT:-8731}"
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1.5

status=0
while IFS='|' read -r path pages name; do
  [ -n "$path" ] || continue
  out="/tmp/thylora-packet-$(basename "$(dirname "$path")").pdf"
  echo "── $name"
  "$CHROME" --headless --disable-gpu --no-sandbox --virtual-time-budget=6000 \
    --no-pdf-header-footer --print-to-pdf="$out" \
    "http://127.0.0.1:$PORT/$path" >/dev/null 2>&1
  python3 store/validation/print-check.py "$out" "$pages" || status=1
done < <(node -e '
  import("./store/lib/catalog.js").then(m => {
    m.PRODUCTS.filter(p => p.lane_state === "PREVIEW-READY")
      .forEach(p => console.log(`${p.file}|${p.pages}|${p.title}`));
  });')

exit $status
