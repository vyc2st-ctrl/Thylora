# THYLORA Spine · QYRIS-2ST advancement engine

Runs **Question → Yield → Reason → Inspect → Safeguard → Act → Transfer** over every
open item in a read-only snapshot of the backend (`thylora-dash`), and groups items by
shared blocker so one action can advance many.

```
node spine/advance.mjs spine/private/snapshots/<snapshot>.json spine/private/runs/<YYYY-MM-DD>
npm test
```

- **This repository is public.** Snapshots and item-level output hold unreleased internal
  records, so they live in `spine/private/` (gitignored). Only counts-only
  `runs/<date>/PUBLIC-SUMMARY.json` is committed.
- `private/snapshots/` — read-only captures of open backend records. Never edited after capture.
- `private/runs/<date>/` — `advancement-records.json` (one record per item), `run-summary.json`,
  `CHAIRMAN-LEDGER.md`. The CLI refuses to write into an existing run, so history is kept.
- `lib/qyris.mjs` — pure functions. It does not write to the backend, a store, a
  payment provider or anyone outside. Any step that trips a gate (public release, payment,
  price, legal, identity, outreach, spend/account, production DDL, Chairman decision)
  becomes a `CHAIRMAN GATE` next action instead of an action.
- Truth layer is carried on every record. Simulated EdereAirah staff are labelled as
  not Earth-licensed, and no Earth licence is ever assumed.
