# F · Origins Lab

Idea `THY-IDEA-ORIGINS-LAB-001` · app `THY-ORIGINS-LAB-APP-001` (registry `IN PRODUCTION` v1; **runtime not witnessed**) · tables drafted: `thy_media_intake_batches`, `thy_media_intake_items`

## 1. Intake batch for the ten early-work MP4s: **NOT REGISTERED**

The Chairman supplied the ten MP4s in a ChatGPT chat. **No bytes reached this environment.** No `.mp4` exists on this container's filesystem, and the backend `media_assets` table has 0 rows created in the last two days. The brief allows registration only "once bytes/hashes are available", so no hash, no batch row and no item rows were written.

Batch shape, ready for when the bytes arrive:

```
thy_media_intake_batches  batch_id ORIGINS-INTAKE-001 · supplied_by Chairman · supplied_via ChatGPT chat upload · item_count_declared 10
thy_media_intake_items    item_no 1..10 · sha256 (server-computed) · byte_size · container · duration_s
                          visual_lanes (from visual inspection only; see below)
                          transcription_state NOT_TRANSCRIBED · release_state UNKNOWN · custody_state CHAT_ONLY → BYTES_HASHED
```
The schema won't accept `BYTES_HASHED` without a hash (`hashed_needs_hash`) or `RELEASED_EVIDENCED` without evidence (`released_needs_evidence`).

Visual lanes reported from inspection (lanes only; which file shows which lane isn't mapped here): early Afrocentric/lens · evidence/perspective · public-defense/poverty · Africa/Alkebulan · religion/scripture · Kid2Kid · Truth Files/Evidence File. **Audio isn't transcribed, so nothing about spoken content is claimed.** Publication state of every file stays **UNKNOWN**.

## 2. Episode format

| # | Segment | What it must contain | Evidence rule |
|---|---|---|---|
| 1 | Original artifact | the early work shown as made, with hash and date on screen | provenance panel = intake hash |
| 2 | Source / history | where it was made, what prompted it, what it drew on | Chairman testimony tagged as testimony |
| 3 | Visual logic | why it looks the way it does: framing, text, colour, pacing | described from the frames |
| 4 | Evidence | each factual claim in the artifact, with its sources | primary > secondary > testimony; every claim graded |
| 5 | Inference | what the evidence supports beyond the literal claim | labelled INFERENCE |
| 6 | Uncertainty | what isn't known or is disputed, with the strongest counter-argument | mandatory segment; can't be skipped |
| 7 | Missed opportunity | what the work could have done or reached then | — |
| 8 | Money / derivatives | what product, course or licence the idea supports now | tied to product registry refs |
| 9 | Modern remaster | the idea rebuilt with today's tools and evidence | clearly a new version, never passed off as the original |
| 10 | Later THYLORA lineage | which current lanes descend from it (e.g. Truth Files → Context Court, Kid2Kid → learning lanes) | links to idea_registry ids |

On the core-interest lanes (African history and lineage, Alkebulan, scripture, suppressed narratives): segments 4–6 give full weight both to the evidence *for* the artifact's thesis and to mainstream and critical counter-evidence, with sources, and they name any bias in mainstream reporting where evidence shows it. The episode's credibility comes from showing that work.

## 3. Hosts: real EdereAirah people, not panel roles

A host needs a persisted life packet **and** a compiled Person Causal Spine. Their reasons for caring, their doubts and their disagreements come from their spine, not from a script.

Candidates found in `thylora_person_life_registry` (all `PRE_DEBUT_DESIGN`, spines **not yet compiled**). The **selection is for the Chairman to make.**

| Candidate | Why the packet makes them plausible |
|---|---|
| Denise Carter (`ER-NEWS-LOCAL-REPORTER-001`) | reporter: evidence and sourcing segments |
| Rochelle King or Henry Tate (Continuity) | provenance, versions, what changed between original and remaster |
| Patrice Lawson (Post) | visual logic and remaster segments |
| Nahla Mercer | sequence reconstruction: "what information disappeared between original and later telling" is her stated learning style |

Before any host appears, run their spine with Origins-relevant seeds (*what do they believe about origins narratives and why; whom do they trust as a source; what are they afraid of getting wrong on air; why did they take this job; what irritates them about how history is reported*) and resolve at least the CAUSE and PRIOR_EVENTS dimensions.

## 4. Episode 001 path
1. Get the bytes into custody (Chairman upload to storage, or a Drive link this environment can read).
2. Hash all ten and group duplicates or re-exports into families.
3. Transcribe to MACHINE_DRAFT, then HUMAN_REVIEWED.
4. Classify release state with evidence (post URLs or dates) or leave it UNKNOWN.
5. The Chairman picks the artifact and the hosts.
6. Build Episode 001.
