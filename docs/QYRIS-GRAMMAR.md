# QYRIS grammar

One grammar. Every question in this system — pre-marriage, music, comedy,
business, religion, education, family, or support-role vetting — is the same
five-part object, recursively nested.

| Field | What it holds |
|---|---|
| **QUESTION** | What is asked. |
| **YIELD** | What a real answer produces that did not exist before. |
| **REASON** | Why this is asked here rather than somewhere else. |
| **INSPECT** | What the answer is checked against — how you would know it is wrong. |
| **SAFEGUARD** | What protects the person if the answer is wrong, coerced or misused. |

Then child questions, which are the same object again, to any depth.

A question missing any of the five is refused by `validateNode`, and by the
`qyr_nodes_*_present` check constraints in the database. A question without a
SAFEGUARD is not a question in this grammar; it is a trap.

---

## The five deltas

Every question declares which of five things it can move. A question that moves
none of them is not asked — `NO_DELTA_DECLARED` in JavaScript, and a deferred
constraint trigger in SQL.

| Delta | Meaning |
|---|---|
| **ACTION** | Something someone would actually do differently. |
| **EVIDENCE** | Something that becomes checkable that was previously assertion. |
| **RISK** | A named exposure that changes size, owner or reversibility. |
| **AUTHORITY** | Who may decide, and whose consent is required. |
| **TRANSFER** | Something of value, obligation or access moving between parties. |

---

## The recursive stopping rule

> The frontier remains **OPEN**. A current pass **pauses** when another question
> would not change **ACTION / EVIDENCE / RISK / AUTHORITY / TRANSFER**.

Inquiry is never globally finished. This is enforced rather than promised:

- `FRONTIER_STATES` contains exactly `OPEN_ACTIVE` and `OPEN_PAUSED`.
- `assertNeverFinished()` throws on `CLOSED`, `COMPLETE`, `COMPLETED`,
  `FINISHED`, `DONE`, `EXHAUSTED`, `FINAL`, `SETTLED_FOREVER`.
- `qyr_passes` carries **two** constraints: the state enum, and a second one
  refusing those words outright, so a later migration that widens the enum still
  cannot introduce a terminal state.
- `Pass.prototype` has no method whose name begins `close`, `complete`, `finish`
  or `end`. A test asserts this, so one cannot be added quietly.
- `qyr_read_pass()` returns `frontier_open = true` and
  `globally_finished = false` as literal columns.

### How a pass actually runs

A question is **live** when three things hold:

1. it has not been answered in this pass,
2. its parent has been answered, or it is a cluster root, and
3. at least one delta it declares is **not yet settled** for this pass.

Answering a question settles the deltas it declared. When no live question
remains, the pass reports `OPEN_PAUSED` with a reason. It does not report
completion, because nothing has been completed — a pass is a pass.

### Why the frontier reopens

`Pass.disturb(delta, cause)` un-settles a delta and the pass resumes. This is
not an escape hatch; it is the mechanism. A marriage, a company, a congregation
and a classroom all keep supplying new facts, and a settled question is settled
only against what was known when it was answered.

```js
const pass = openPass(PREMARRIAGE_PACK, { scope: ['MONEY'] });
pass.answer('MONEY');                 // settles all five deltas
pass.state();                         // 'OPEN_PAUSED'
pass.disturb('TRANSFER', 'A relative began receiving monthly support.');
pass.state();                         // 'OPEN_ACTIVE'
```

---

## Where the grammar lives

| Layer | File |
|---|---|
| Engine | `qyris/lib/grammar.js` |
| Pre-marriage pack (source of truth) | `qyris/data/premarriage-pack.js` |
| Industry projection | `qyris/lib/industry.js` |
| Schema | `db/qyris/0001_qyris_grammar.sql` |
| Generated seeds | `db/qyris/0002_premarriage_pack.sql`, `0003_industry_template.sql` |
| Surface | `qyris/index.html`, `qyris/app.js` |

The SQL seeds are **generated** from the JavaScript by
`db/qyris/generate-seed.mjs`. `npm test` runs `--check` against the committed
files, so editing the SQL by hand fails the build rather than forking the pack.
One source of truth, mechanically enforced.
