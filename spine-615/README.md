# spine-615 — THYLORA Pass 615 · store reconciliation + help-first batch (2026-09-25)

Start here: **[SPINE-615-REPORT.md](SPINE-615-REPORT.md)** — six numbered sections plus continuity. Restart point is in §6.8.

| Folder | What it holds | State |
|---|---|---|
| `evidence/` | Backend readbacks (JSON), the four delivery PDFs (re-hashed), rendered first pages, storefront screenshot | Read-only snapshots |
| `library-fix/` | Customer library with a Download PDF control, patch, Chromium test, original source | Tested; **NOT deployed** |
| `batch/` | Six help-first interiors (`pdf/`), previews, builder, `SCENE-CONTRACTS.md` | Draft; **nothing listed**; art plates held |
| `first-post/` | Chairman review package, still v2 (+ phone view), verbatim caption, proposed caption, diff | **NOT published** |

Backend pointer: `thylora_query_carryforward.sequence_no = 615`. Phase-2 work (`spine-610/`) is preserved unchanged.
Rebuild: `python3 batch/build_batch.py` · Test: `python3 library-fix/test_download_control.py`
