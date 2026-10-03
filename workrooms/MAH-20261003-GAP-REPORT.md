# MAH 2026-10-03 · Backend Readback + Gap Report

**Backend read:** `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`), live.

**Source captured (2026-10-03 15:43 UTC):** `chairman_source_messages` · thread `CLAUDE-CODE-HEAD-SPINE-FORWARD-20261003` · ordinal 1 · id `b911ce2c-5ba9-4b63-9c18-fda98ab29871` · 39,616 chars · SHA-256 `6474b01f45232f98a7079144a752b99ccf67f1b2b9e1986d94b5a813c2251344` · `EXACT_VERBATIM`. That is the only backend write so far; nothing else was changed.
**Rule followed:** read what is there, don't change it, name the gaps.

---

## 1 · The biggest gap: everything stays "active"

| Measure | Backend count |
|---|---|
| Ideas registered | 414 |
| Ideas finished / released | **0** |
| `DESIGN_ACTIVE` | 239 |
| `IMPLEMENTATION_ACTIVE` | 78 |
| `RESEARCH_ACTIVE` | 39 |
| Products in catalogue | 28 |
| Products a customer can buy today | **0** (the one "available" item is the Stripe test) |
| Departments | 67, all `active` |
| Studio render jobs | 0 |
| Qyris nodes | 0 (169 work-item checks, no nodes) |

**Why:** the idea states have no finished or shipped state, and no gate pushes ideas toward one. Ideas only ever go in. Departments say "active" without showing output.

**Fix:** add a finish lane: `SHIPPED` (customer can get it) and `RETIRED`. Then a daily gate picks the 5 closest-to-done items and moves each one exactly one step. Measure each department by what it shipped, not by its status.

---

## 2 · Items checked against the MAH

| Chairman item | In backend? | Gap |
|---|---|---|
| Left-ear V-question tattoo | Yes · `THY-IDEA-VQUESTION-TATTOO-001` | Size, orientation, script, and whether the Yoruba line *Ìwọ ni ọkàn mi yàn* joins the mark are OPEN. Needs 3 placement renders and a native-speaker check of the Yoruba. |
| Tattoo studio | Yes · `THY-IDEA-TEMPORARY-TATTOO-STUDIO-001` | Artist (Desmond) identity, licence, and Maryland health rules not verified. |
| World people wear tattoos, shirts, logo, serials | Partial · `thylora_person_garment_registry` has 3 rows; `thylora_person_serial_registry` has 0 | Serial format `VYC2ST-…` is not defined in the backend. |
| Living studio (writers, editors, actors make it themselves) | Schema yes · `studio_*` (25 tables) | 0 render jobs, no render provider connected. Only 3 studio departments. |
| Real names, not sci-fi names | No | See §3. |
| Books / publishing company | `PUBLISHING` department exists | No book is on sale. Bramble Wick, Population Memorandum, Coloring & Story Book all `not_available`. |
| Famous actors / artists / writers | 23 studio people, 88 identities | 5 studio people are duplicated. Few performers (TheSmyl, PRYE). |
| Car company | 10 concepts `CNW-CONCEPT-001…010` | **Every vehicle name is `UNKNOWN`.** No dimensions or specs. `CNW` lines up with the family's **C&W**; confirm that's the company name. |
| Aircraft | Idea `THY-IDEA-GUARDIAN-FLIGHT-001` | No design record. |
| Boat / ship | `OCEAN_SYSTEMS_AND_INFRASTRUCTURE` dept | No vessel record. |
| Apparel (underwear, socks, PJs, caps, sweaters, sweats) | 2 apparel products, 21 garment cost lines | No full apparel line or brand name. |
| Math keyboard | Yes · `THY-IDEA-MATH-KEYBOARD-001` | "No installable build witnessed." |
| Cali QuickTurn | Yes · `THY-IDEA-CALI-QUICKWIT-001` | Needs Chairman approval of the final name and rules wording. |
| Mirror (Earth ↔ EdereAirah) | Yes · `THY-IDEA-MIRROR-STORY-COMMERCE-001` | `mirror_story_record` has 0 rows. |
| Mini world for kids | `thylora_miniworld_registry` 1 row | No access rules published. |
| Legal / supreme court in world | `EDEREARIAH_LAW_HOUSE`, `legal_*` tables | 1 office and 1 constitution row. No court levels, no world names. |
| World terms / language | `thylora_world_term_registry` 8 terms | Target was 5,000 words. 8 are stored. |
| Solar system, sun, moons | Time canon ideas exist | The sun and moon names the Chairman gave are not stored as terms. |
| Social media sites owned in-world | 23 social channels | No world-owned platform or owner records. |
| World computers / AI | none | Not designed. |
| Two gauges (1–50 THYLORA, Earth) | none | Not stored. Chairman's calibration: "almost a 1." |
| "What does THYLORA mean" | none | No definition is stored. **Don't invent one.** It needs the Chairman's words. |

---

## 3 · Names: the sci-fi problem is real

These stored names read invented. They don't come from any Earth language or family line:

`Aderon Vale, Mara Elowen, Kellan Rhys, Tomas Veyr, Ilyan Daro, Mavea Solen, Ivara Sen, Selene Varro, Niko Aralen, Tavian Cor, Seyra Tal, Tovan Rei, Nara Sel, Ilyra Venn, Orin Vale, Kelan Orr, Old Jaro`

Also too many repeats of a few surnames: Vale ×5, Cole ×5, Mercer ×4.

**Duplicates in `studio_people`:** Aderon Vale, Mara Elowen, Kellan Rhys, Tomas Veyr, Sahra N'Dele (2 rows each).

**Spelling or duplicate checks needed:**
- "Victoria **Asley** Peete" (MAH says Ashley)
- "jonnie peete" vs "Johnny Peete" (MAH says Johnnie James)
- "micheal chillers" vs "Michael Chillers"
- "im chairman. for now" is stored as a person name

**Fix:** a name rule. Every world person gets a real Earth name, a heritage-language name, or a marked blend, and the record says which. The `thylora_name_lock_worklist` (395 items) is the existing place to do it.

---

## 4 · Family departments: named by the Chairman, not yet in the backend

The person records exist. The departments don't.

| Named for | Backend person | Purpose given in MAH | Location given |
|---|---|---|---|
| Terry Allen | Terry Allen Peete | Mechanics, trucking, Midas work | Tennessee |
| Mary Ann | Mary Ann Wright | The Archive of My Line | — |
| Victoria Ashley | Victoria Asley Peete | Help for people struggling with drug addiction, all languages | Japan |
| Keziah Elana | Keziah Elana Peete | Help for people who are homeless (muse) | Pennsylvania |
| Verneda Elizabeth | Verneda Elizabeth Curry | Legal | New York office |
| Lakisha Nicole (Key) | not stored as a person | Legal / department of … (Key) | — |
| Michael Curry | not stored | Department of Energy (electrician) | — |
| Johnnie James | Johnny Peete? (verify) | Security and … | — |
| Walter Tyrone Peete | not stored | North Side Protocol: poor schools, north St. Louis, then TN, MD, Baltimore, NY, IN, Chicago, MS | St. Louis |
| Ree & Walter | not stored | Dementia and memory loss | — |
| Hattie | Hattie Marie Ramsey | Hotels and housekeeping; works directly with the Chairman when money allows | — |
| Candy | not stored | Hospital billing | — |
| Verneda Lashelle ("TinyTiny") | Verneda Lachelle Hammond (spelling?) | Elder care / nursing-home aide work | — |
| Nickali (Dominic) | not stored | Amazon / logistics | — |
| Annod Hall | not stored | Place for women who have been battered | — |
| JoJo (Key's mom) | not stored | Show taking stories people want understood | — |

Chairman instructions: don't box them in; show functioning departments to Earth first; ownership and running come later; place offices around the world but for everyone.

---

## 5 · Next 5 moves (smallest steps that ship)

1. ~~Capture this MAH verbatim~~ **DONE** (see header).
2. **Insert the family departments** above as `chairman_review_required` (the same status as `THY-WORLD-DOUBT-REMOVER-607`), name and idea only.
3. **Name the 10 CNW vehicles** and give each its base dimensions.
4. **Put one real product on sale** end to end (Cali QuickTurn printable is closest) to prove the store path.
5. **Rename the sci-fi names** through the name-lock worklist; remove the 5 studio duplicates.
