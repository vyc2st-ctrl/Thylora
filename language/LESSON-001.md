# EdereAriah · Lesson 001

**The line between two worlds, and the names that hold it**

Work code: `THY-WORK-DAILY-LANGUAGE-584`
Corpus: `language/lexicon.mjs` — 12 entries, every one carried by file and line
Fabricated words in this lesson: **0**

---

## Before the lesson: what this lesson is not

This lesson does not teach you to say anything.

There is no greeting here, no verb, no number, no word for water or house or
day. Not because Lesson 001 should be light, but because **no such word is
attested anywhere this session could read**. The approved lexicon was not
recovered. It is not in `vyc2st-ctrl/Thylora` at HEAD, not in any of that
repository's 51 commits, and not in `vyc2st-ctrl/thylora-executive-dashboard`.
The backend that would hold it refused connection — 403, 2026-09-22T04:07:20Z.

So Lesson 001 teaches what the recovered corpus **actually contains**: a name
set, and one rule those names exist to enforce. That rule turns out to be the
most important thing in the language, and it can be taught honestly today.

A note on the spelling before we start. The instruction spells the world
**EdereAirah**. Every one of the 14 occurrences in committed source spells it
**EdereAriah** — *r* before *i* in the second element. Zero occurrences of the
other spelling exist. This lesson uses the attested spelling and flags the
difference rather than quietly correcting either one. Chairman decision **D4**
settles which is canon.

---

## 1 · The world has a name

**EdereAriah**

A world. Not Earth, and never a version of Earth.

> *rae-link/index.html:45, :73, :115, :255 · db/rae-link/0001_identity_channels.sql:17
> · docs/RAE-LINK-ARCHITECTURE.md:71 · docs/RAE-LINK-RIGHTS-PRIVACY.md:104
> · public-site/index.html:33, :40 · app/sports-betting.html:7, :13
> · tests/rights.test.mjs:50*

How it sounds is **UNKNOWN**. No pronunciation is recorded anywhere. If you are
tempted to sound it out, notice that you would be inventing — and inventing is
the one thing this lesson refuses. Write it; do not yet claim to say it.

---

## 2 · The world has people, and they are not Earth people

**EDEREARIAH_INHABITANT** — one who lives there.

> *rae-link/lib/rights.js:22 · db/rae-link/0001_identity_channels.sql:24, :82
> · tests/rights.test.mjs:43, :49*

**WORLD_CHANNEL** — a voice of the world rather than of an Earth person.

> *db/rae-link/0001_identity_channels.sql:82 · rae-link/index.html:73*

Both carry the same status:

**WORLD_SIMULATED** — the world's own status.
**EARTH_REAL** — the status of Earth: real people, real places, real money.

> *rae-link/lib/rights.js:22 · docs/RAE-LINK-ARCHITECTURE.md:81 · tests/rights.test.mjs:49*

---

## 3 · The rule the whole language is built around

Here is the actual grammar of EdereAriah as it exists today. Not word order —
this:

> **An inhabitant of EdereAriah may never be presented as an Earth person.**

It is not a style guide. It is a database constraint named
`rael_channels_world_truth`, and it fires whether or not anyone remembers it:

```
(channel_class in ('EDEREARIAH_INHABITANT','WORLD_CHANNEL')  →  disclosure required, ≥ 12 characters)
```
> *db/rae-link/0001_identity_channels.sql:82 · docs/RAE-LINK-ARCHITECTURE.md:81*

Three things follow, and they are the substance of Lesson 001:

**a. Every world voice must say it is a world voice.** Twelve characters is the
floor. A world channel with an empty disclosure is rejected by the database, not
by a reviewer who might be tired.

**b. The lie is blocked in one direction, on purpose.** Claiming EdereAriah
production on an Earth channel is refused as `WORLD_BASIS_ON_EARTH_CHANNEL`.
The constraint is asymmetric because the danger is asymmetric: a simulated
person mistaken for a real one does harm a real person mistaken for a simulated
one does not.

**c. Money crosses the line only one way.** The world's currency is **R**.

> *app/sports-betting.html:7, :13 — "EdereAriah R-currency implementation only.
> Earth real-money wagering is not authorized by this build."*

Earth money is hard-blocked against it in the backend. You can hold R in
EdereAriah. You cannot turn Earth money into a wager there.

---

## 4 · Names that exist but are not yet explained

Recorded so they are not lost. Meaning **UNKNOWN** — and left that way.

| Token | What source says | What source does not say |
|---|---|---|
| **THEHANDLUH** | An approved living-art castle environment, with cart and workers | Whether the name is EdereAriah-language or an internal designation |
| **ERSATZREALITY** | Names the Business Factory room family | Whether this is what "ERC" abbreviates |
| **VLEGH** | Has its own registry, `vlegh_registry` | What it names. Nothing. |
| **DASHUL** | Names the router | What DASHUL itself means |

> *thylora-executive-dashboard@a634249: app/build8-visual-floor.js:39,
> app/thylora-forward.js:18, app/index-v8.html:17, db/0001_control_surface.sql*

Four tokens, four honest blanks. A language recovered with its blanks intact is
recoverable. A language recovered with its blanks filled in is lost, and nobody
can tell which parts were lost.

---

## 5 · The one exercise

No translation drill is possible — there is nothing to translate. This is the
exercise the corpus does support, and it is the one that matters:

> Take any THYLORA surface showing a person, a voice or a place.
> Answer in one word: **EARTH_REAL** or **WORLD_SIMULATED**.
> Then find where the surface says so.
>
> If you cannot find where it says so, you have found a defect — report it.
> That is Lesson 001 working.

---

## 6 · What Lesson 002 needs

Lesson 002 cannot be written from this corpus. It needs, in this order:

1. **The approved lexicon**, read from the backend — common vocabulary, any
   grammar, any phonology. **HELD** on the 403.
2. **The spelling decision** (D4): EdereAriah or EdereAirah.
3. **A pronunciation record**, or an explicit statement that none exists.

None of the three can be supplied by inference. All three are one backend read
and one Chairman answer away.

---

*No word in this lesson was invented. Every token is carried by a file and a
line. Where the corpus is silent, this lesson is silent.*
