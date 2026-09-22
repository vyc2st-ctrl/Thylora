# THYLORA · Genealogy Evidence Journey

**Work item:** THY-WORK-GENEALOGY-EVIDENCE-JOURNEY-587
**Code:** `genealogy/evidence.js` · **Tests:** `tests/genealogy.test.mjs`
**Register:** `genealogy/seeds.json` · **Search log:** `genealogy/search-log.json`

---

## The result of sequence 587, stated first

**Verified relationships: 0.**
**Negative or unrunnable searches logged: 12.**
**Candidates noted and not accepted: 1.**

That is not a failure to report. Under the rules the Chairman set, it is the only honest
output available from this session, and the reasons are recorded per search rather than
summarised away.

## Why zero

Two independent walls, either of which alone would have been enough.

**1 · The existing intake could not be read.** The instruction was READ EXISTING INTAKE
FIRST. The intake lives in the `thylora-dash` backend, and the egress proxy answered
**403 on CONNECT** to that host — the same organisation policy denial first recorded on
2026-09-11 as blocker B1 in WR-RAELINK-001. A search of this repository found the
`family_story_archives` write path and the `FAMILY_STORY` channel class, i.e. the
containers, but no intake rows: no locality, no date window, no prior research.

**2 · The seeds carry names only.** Six of six have no state, no county, no birth or
death year, no spouse, no parent. *Peete*, *Wright* and *Harris* are common surnames
across many US states. Name-only searching against them produces coincidence, and
reporting coincidence as lineage is precisely the random surname matching the Chairman
prohibited. The correct output was the log, not a tree.

Every major record repository was also unreachable by direct connection — FamilySearch,
Find a Grave and the National Archives all returned 403 on CONNECT. Index-level searching
still ran, and is logged; it returned no individual under any seed name.

## The one candidate, and why it is not a finding

An aggregator summary described an **Elmer Peete**, said to be born 16 December 1930 near
**Covington, Tennessee** and to have died 16 February 2001 in Missouri, named as the son
of a **Willie Peete** and a **Hattie Whitley**. That pairing has the shape of SEED-05 and
SEED-06, which is why it is written down.

It is recorded as `CAND-01`, **NOT ACCEPTED**, because:

- the source page itself was unreachable, so nothing was read at source;
- no record was seen — only a search-engine summary of an aggregator's summary;
- nothing ties that household to the Chairman's line, and there was no county or date
  window to test it against;
- accepting it would be surname matching.

It is a lead for a session that has a locality. It is not a grandparent.

A test asserts that nothing in the committed register is accepted, and that every entry
in the search log validates — including the assertion that the hit count is **zero**. If
that ever changes, the test has to be changed deliberately, by hand.

---

## The rules, as code

| Chairman's rule | Enforced by |
|---|---|
| Source citation for every accepted relationship | `acceptRelationship()` → `NO_CITATION` |
| No random surname matching | `evaluateIdentityMatch()` → `SURNAME_ONLY_MATCH` |
| No race or tribal claim from surname or geography | `evaluateAncestryOrCitizenshipClaim()` → `INFERENCE_FROM_SURNAME_OR_GEOGRAPHY` |
| Prioritise deceased people | `livingStatus()` / `researchPriority()` |
| Log negative searches | `validateSearchLogEntry()` → `NEGATIVE_WITHOUT_COVERAGE` |

### Identity: a surname plus two anchors, or nothing

Anchors are `EXACT_OR_VARIANT_GIVEN_NAME`, `DATE_WINDOW`, `COUNTY_OR_STATE`,
`HOUSEHOLD_MEMBER`, `FAN_NETWORK`, `OCCUPATION`, `RECORD_CROSS_REFERENCE`. A surname plus
**one** anchor is still refused. An invented anchor is rejected rather than counted.

### Ancestry and tribal citizenship

`SURNAME`, `GEOGRAPHY`, `PHOTOGRAPH` and `FAMILY_ASSUMPTION` are forbidden bases, and two
forbidden bases do not add up to one good one. **Tribal citizenship is determined by the
nation itself, from its own rolls and its own criteria** — a research record cannot assert
it, and the code will not let one try. Such an account is stored as a family account
pending the nation's own determination.

### Living people

No documented death and inside the 100-year privacy horizon → `POSSIBLY_LIVING`, not
publishable, research priority `DEFERRED`. Silence never counts as a death.

### Evidence, and what a conclusion costs

Classes: `ORIGINAL_RECORD`, `DERIVATIVE_RECORD`, `AUTHORED_WORK`, `INDEX_ENTRY`,
`ORAL_HISTORY`, `USER_SUBMITTED_TREE`. Information: `PRIMARY`, `SECONDARY`,
`UNDETERMINED`. Directness: `DIRECT`, `INDIRECT`, `NEGATIVE`.

- A **user-submitted tree is never sufficient alone** — it points at a claim, not a record.
- Every citation needs repository, collection, locator, all three classes, and a
  retrieval date. A citation with no date cannot be re-checked.
- No direct evidence → **two independent indirect sources plus written reasoning**.
- A recorded conflict blocks acceptance until it is resolved in writing.
- Confidence returned: `ESTABLISHED` (2+ direct) · `SUPPORTED` (1 direct) ·
  `REASONED` (indirect + reasoning) · `NOT_ACCEPTED`.

### Negative searches

A negative with no coverage statement proves nothing — it may simply have looked in the
wrong place. `NEGATIVE` requires a coverage statement; `UNREACHABLE` requires a named
obstacle, so the next session knows what to fix rather than repeating the wall.

---

## Next record sources, in the order they should be worked

**Step 0 — unblock, in this order. Everything below is cheap once these are done.**

1. **The Chairman supplies, for any one seed:** a state, ideally a county, and any date
   within about ten years. One locality turns twelve dead searches into a working list.
2. **Backend egress**, or a Chairman-run read of the existing intake, so prior work is not
   repeated. (`thylora-dash`, blocker B1, open since 2026-09-11.)
3. **Hattie's maiden surname**, if it is known in the family. It is the single most
   valuable missing fact in the register.

**Then, in cost order — free and specific first:**

| # | Source | What it settles | Access |
|---|---|---|---|
| 1 | **US Federal Census 1950, 1940, 1930, 1920, 1910, 1900** | Whole households in one view: ages, birthplaces, parents' birthplaces, neighbours. The fastest route from a name to a family | Free; 1950 and 1940 are freely searchable by name |
| 2 | **State death indexes** for the named state | Death date, county, often parents' names and the informant | Mostly free online by state |
| 3 | **County death, marriage and probate records** | The original certificate and register page — `ORIGINAL_RECORD`, `PRIMARY` | County clerk; mail or in person |
| 4 | **WWI and WWII draft registration cards** | An exact birth date in the man's own hand — decisive for Walter James Peete and Eugene Wright | Free via NARA and the major indexes |
| 5 | **Social Security applications (SS-5 / Numident)** | Parents' full names including the mother's maiden name — often the only source that names her | Paid FOIA request to SSA |
| 6 | **Newspapers — obituaries and local columns** | Survivor lists, which name siblings and children in one paragraph. Also where a nickname like "Kid" Wright actually lives | Subscription archives; many state libraries give free access with a library card |
| 7 | **Cemetery and burial records** | Burial place, often a family plot showing a whole group | Find a Grave, BillionGraves, and the cemetery's own office |
| 8 | **City directories** | Year-by-year address and occupation — the tool that separates two men of the same name in the same city | State and local library digital collections |
| 9 | **Deeds and land records** | Relationships stated outright: "heirs of", "widow of" | County register of deeds |
| 10 | **Freedmen's Bureau and Freedman's Bank records** | For African American lines, the records that bridge 1870 — Freedman's Bank applications often name parents, siblings and the plantation of origin | Free via NARA and FamilySearch |
| 11 | **The FAN network** | When the direct line goes silent: the neighbours, witnesses and fellow church members who move with a family and name it in their own records | Same repositories, searched sideways |

**A note on the 1870 wall, stated plainly because the Chairman's lines are African
American and it will be met:** before 1870, most enslaved ancestors are not named in the
federal census. The research moves to the records of the last enslaver — probate
inventories, estate divisions, bills of sale, wills — plus Freedmen's Bureau labour
contracts and Freedman's Bank applications. It is slower, it is documentable, and it is
done by evidence, not by surname. The surname of a formerly enslaved family is not
evidence of descent from the family that held that name, and this repository's code
refuses to record it as such.

**A specific unsearched holding:** one obituary aggregator reported holding **225 Peete
obituaries**, which were not individually reachable this session. With a state, that
collection is a first-morning target.
