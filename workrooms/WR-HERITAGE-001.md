# WR-HERITAGE-001 · Heritage Records, Ancestral Language & Creator Partnership

**Lane:** ancestry research from public records · ancestral language lexicons · heritage creator partnership
**Backend of record:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)
**Source repository:** `vyc2st-ctrl/Thylora`, branch `claude/heritage-spine-forward`
**Opened:** 2026-10-03 · **Carried by:** THYLORA HEAD — SPINE FORWARD

---

## 1 · Authority position

- `DASHBOARD_AUTHORITY.md` holds. This delta does **not** touch `dashboard-current-head.html`.
- `dashboard-baseline.json` floor `THY-DASH-FLOOR-20260823-001`: no capability removed or renamed.
- Additive only. New files: `heritage/`, `db/heritage/`, this workroom, `docs/CHAIRMAN-LOGIC-PROTOCOL.md`,
  `docs/HERITAGE-CREATOR-PROPOSAL-DRAFT.md`, `tests/heritage.test.mjs`.
- **No duplication.** Family stories already have a home: the app's Family Story Archive
  (`SOURCE STORY → FAMILY PERSPECTIVES → ERSATZ INTERPRETATION → EVIDENCE`). This lane feeds
  the **EVIDENCE** layer. It does not create a second story archive.
- Creator outreach is **drafted and held**. Nothing is sent until the Chairman reviews it.

---

## 2 · Chairman's words, captured so nothing is missed (2026-10-03)

| # | What was said | Where it lands |
|---|---|---|
| 1 | "Why is it so hard and so long… people pull up their information so quick using public records" | §3 Why it's slow, and the fix |
| 2 | Researcher's video: Extra Census Bulletin, Dept. of the Interior Census Office, Robert P. Porter, the Five Civilized Tribes, 1890 census, Cherokee | `heritage/sources.json` SRC-009, verified on HathiTrust and Internet Archive |
| 3 | "Why aren't we looking at things like that, finding things like that" | §4 Records protocol, 15 sources in work order |
| 4 | Help the researcher: cleaner presentation, store products, movies, shows, education; "we'll go over it first" | `docs/HERITAGE-CREATOR-PROPOSAL-DRAFT.md` (HELD) |
| 5 | "I bet he can find my ancestor faster than we are" | §4 intake. The team needs names, years and places to start |
| 6 | "How could it not be that hard for my sister to do it" | §4 intake: ask where she stopped and start from there |
| 7 | "Who called what… what were my ancestors called" | `heritage/lexicon.json` self-names for each people |
| 8 | Dictionary for Blackfeet, Egyptian, Benin, Hebrew, then confirm pronunciation | `heritage/lexicon.json` (73 seed entries) + §6 |
| 9 | Dashboard: buttons don't work, Green Milk screen not back, Gallery broken, app discouraging | Audit run on `app/`. The live dashboard is in `thylora-executive-dashboard` (see §8) |
| 10 | Objects that remember how they changed; two objects remembering the same event differently | `docs/CHAIRMAN-LOGIC-PROTOCOL.md` §2 |
| 11 | The math: [f(x+Δx) − f(x)] / Δx and f(x) = 1/x² | `docs/CHAIRMAN-LOGIC-PROTOCOL.md` §3 |
| 12 | "Give me two or three ways of logic every time we talk: erotetic, deontic, defeasible…" | `docs/CHAIRMAN-LOGIC-PROTOCOL.md` §1, a standing rule |
| 13 | "I'm not thinking of the right question at that moment" | `docs/CHAIRMAN-LOGIC-PROTOCOL.md` §4: question starters |

---

## 3 · Why it's been slow, and the fix

The researcher in the video is fast because he works **records-first**: he opens a named
document and reads it. Our work has been **story-first**: start from what the family said,
then try to prove it. Story-first is slower because the story might not match the record.

The fix is to flip the order. Records go first and the story gets tested against them. The
story keeps its place in SOURCE STORY and never gets overwritten.

**One honest blocker:** the team doesn't yet have the starting names. Public records are
searched by **name + year + place**. Without at least one ancestor born before about 1920
with a county, no search can begin, however good the tools are. See §4 intake.

---

## 4 · Records protocol (work order)

`heritage/sources.json` is the registry. The order:

1. **Living → 1900.** Censuses from 1950 to 1900, SS-5 applications, death certificates, draft cards.
2. **The 1870 wall.** 1880 and 1870 censuses. 1870 is the first that names every Black American.
   The 1890 schedules mostly burned in 1921, so a family vanishing between 1880 and 1900 is
   a gap in the records, not a dead end.
3. **Past the wall.** Freedman's Bank, Freedmen's Bureau, and the enslaver's slave schedule
   (only after the enslaver is identified).
4. **Indian Territory and tribal rolls.** The 1890 Five Civilized Tribes bulletin (context),
   then the Dawes citizen *and* Freedmen cards, the Wallace and Kern-Clifton rolls, Guion Miller
   applications, and the Indian Census Rolls (including the Blackfeet Agency).
5. **Cousins.** Newspapers, "Information Wanted" ads, and DNA matches with documented trees.

**Intake needed from the Chairman (blocking):**
- Names, approximate birth years and states or counties back to great-grandparents, as far as known
- Which line carries the Blackfoot story, in the elders' own words
- What the sister found and where (FamilySearch, Ancestry, a DNA test)
- Bible pages, obituaries, funeral programs, photos with names

---

## 5 · Absolute Truth breakdowns (Prime Directive on Relevance)

### 5a · "Blackfoot" in Black family oral history

**The claim.** Many Black American families say they descend from "Blackfoot" Indians.

**Evidence for the family story having a real basis:**
- Black and Native lives were tied together in the South and in Indian Territory. The Five
  Civilized Tribes held enslaved Africans, and after 1866 their Freedmen became tribal citizens.
  This is documented on the Dawes Freedmen cards and in the 1890 bulletin you saw.
- Intermarriage and shared communities are documented in the Guion Miller files and the
  Indian Territory records.
- Genealogists who research Freedmen, notably Angela Walton-Raji, have shown how often these
  connections were real and then erased by later record-keeping that sorted people into
  "Negro" or "Indian" boxes.

**Evidence against the literal reading (Blackfeet Nation of Montana or Alberta):**
- The Blackfeet / Siksiká homeland is the northern Plains, far from where most Black
  families' ancestors lived in the 1800s.
- Researchers rarely find Blackfeet Agency enrollment in these lines.
- One explanation genealogists have proposed, not proven: "black foot" may have described
  people of mixed African and Native ancestry, or been a local label, rather than naming the
  Montana nation.

**Bias to watch for, on both sides:**
- Mainstream records erased Native ancestry in Black families. Census takers often wrote
  "B" or "Mu" whatever the family said.
- Family stories sometimes reached for a Native ancestor to explain features or to soften a
  history of enslavement and white paternity.

Both biases are real, so the records decide.

**How we test it:** SRC-013 (Indian Census Rolls, Blackfeet Agency) for a direct Blackfeet
link; SRC-010 to SRC-012 (Dawes, Freedmen and Cherokee rolls) for the more common Indian
Territory link. Status stays **UNKNOWN** until a record names the person.

### 5b · Kemet: "black land" or "land of the Black people"?

**Agreed by all scholars:** Egypt called itself *kmt* (Kemet), from the root *km*, "black."

- **Mainstream reading:** the black, fertile Nile silt, in contrast to *dšrt*, the red desert.
  The word is written with the sign for a town or land, which points to a place.
- **Afrocentric reading (Cheikh Anta Diop and others):** *kmt* and *kmtyw*, "the black ones,"
  refer to the people. Diop also pointed to Egyptian art, to Herodotus calling Egyptians
  "black-skinned," and to biological evidence.
- **Counterpoints:** *kmtyw* can be read as "people of Kemet," formed from the land name the
  same way "Egyptians" comes from "Egypt."
- **What the wider evidence says:** ancient Egyptians were an African population. The art
  depicts a range of skin tones. Early Egypt grew from Nile Valley and Saharan cultures.
  Twentieth-century European scholars at times pushed a "Mediterranean / Caucasian Egypt" for
  racial reasons, and that bias is documented.

**Status:** DISPUTED (lexicon entry `EGY-001`). Both readings are recorded with their evidence.

---

## 6 · Ancestral language program

`heritage/lexicon.json` holds 73 seed entries across four languages:

| Language | Self-name | Entries | Living speakers? | Confirm with |
|---|---|---|---|---|
| Blackfoot | Niitsítapi | 13 | Yes | Blackfoot Online Dictionary; Piegan Institute (Browning, MT) |
| Egyptian | *rmṯ n kmt* | 21 | No (Coptic descends from it) | Faulkner; Thesaurus Linguae Aegyptiae |
| Edo (Benin) | Ẹ̀dó | 18 | Yes | Agheyisi's dictionary; speakers in Benin City (tone is meaning) |
| Hebrew | ʿIvri | 21 | Yes | Brown-Driver-Briggs; Strong's |

**Rules:**
- Every entry starts as `SEED_PENDING_CONFIRMATION`. It moves to `CONFIRMED` only with a named
  speaker, teacher or dictionary page.
- Pronunciation is recorded from a speaker, never generated. Egyptian pronunciation is a
  scholarly convention and is labeled that way.
- Words are grouped by domain (identity, family, feeling, mind, spirit, world, logic) so the
  Chairman can compare how each people thought. For example, the heart as the seat of the mind
  appears in both *ỉb* (Egyptian) and *lev* (Hebrew).

**Next:** grow each language to about 200 words in the same domains, then record the
pronunciation sessions.

---

## 7 · Backend schema (reviewable, not applied)

`db/heritage/0001_heritage_records.sql` adds `thy_heritage_*` tables: persons, records, evidence
links, lexicon entries and pronunciation confirmations. RLS keeps each family private, with no
SSNs or tax documents (same rule as the Family Story Archive). Every statement is guarded and
idempotent. Applying it to the live backend is a production change held for the Chairman.

---

## 8 · Dashboard and app status

- **Live Chairman dashboard:** the source is `vyc2st-ctrl/thylora-executive-dashboard`, which is
  outside this session's GitHub scope. Its buttons can only be fixed in that repository.
- **Member app (`app/`):** audited in this session. Findings are recorded in the commit that
  carries any fixes.

---

## 9 · Open gaps

| Gap | Owner | Blocking? |
|---|---|---|
| Ancestor names, years, places | Chairman | **Yes** for records search |
| Sister's findings and where she found them | Chairman | No, but saves the most time |
| Researcher's name and channel (from the screenshots) | Chairman | Yes, before outreach |
| Speaker confirmation for all 73 lexicon entries | Language lane | No |
| Access to `thylora-executive-dashboard` in this session | Chairman | Yes, for live dashboard fixes |
