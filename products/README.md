# THYLORA products · artifact engine and store items

This directory holds **customer artifacts** — the actual bytes a buyer receives —
and the engine that produces them. It is not a store, not a checkout and not a
second product catalogue. Registration for sale happens against the registries
that already exist (see `db/store/`).

## Engine

`_engine/` is dependency-free and produces deterministic output.

| File | What it does |
|---|---|
| `pdf.mjs` | PDF writer: vector pages, base-14 text, AcroForm fields, outlines, UTF-16BE metadata, Flate-compressed content streams, valid cross-reference table |
| `metrics.mjs` | AFM widths for the four faces used, so wrapping, centring and fitting are exact |
| `preview.mjs` | Replays a page's own content stream into SVG, for proof-reading, device tests and store thumbnails without a PDF rasteriser |
| `probe.mjs` | Opens a built PDF the way a reader does — xref offsets, object table, stream inflation, page tree, form fields, metadata — so "it opens" is a check, not a claim |
| `zip.mjs` | Deterministic ZIP writer for the delivery package |

Design rules held by the engine:

- **No embedded font, no external reference.** Base-14 only. The artifact opens
  on any reader, on any device, offline, with nothing to download.
- **Deterministic.** The same serial rebuilds byte-identical files. That is what
  makes re-access a rebuild rather than a stored blob.
- **The preview reads the artifact, not a parallel mock-up.** A preview can only
  be wrong in the same direction the PDF is.

## Store items

| Product | SKU | State | Artifact |
|---|---|---|---|
| QYRIS QuickCheck | `THY-QYRIS-QC-001` | **Chairman preview** | Built — `qyris-quickcheck/dist/` |
| Stuck Loop Reset | `THY-SLR-002` | Production copy and design complete | Copy in `stuck-loop-reset/content.mjs`, design in `DESIGN.md` |
| Before You Buy | `THY-BYB-003` | Production copy and design complete | Copy in `before-you-buy/content.mjs`, design in `DESIGN.md` |

All three share one content schema, so the second and third are a layout pass
from finished bytes, not a rewrite.

## Building

```sh
node products/qyris-quickcheck/build.mjs                       # master copy
node products/qyris-quickcheck/build.mjs --serial THY-QC1-260922-000001
node products/qyris-quickcheck/preview.mjs                     # SVG + HTML proofs
node products/qyris-quickcheck/thumbnail.mjs                   # store thumbnail
node products/qyris-quickcheck/chairman-preview.mjs            # preview surface
npm test                                                       # includes the artifact tests
```

Nothing here is routed in `vercel.json` and nothing is linked from
`public-site/`. **No publication.**
