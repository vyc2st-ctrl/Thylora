# GATE NETWORK 620 · first connected adjacency map

> Generated from `gates/gate-network.js` by `node gates/render-doc.mjs`. Do not edit by hand.

**Math:** `G_i = E_i × C_i × A_i × R_i × X_i` (MATH-GATE-NETWORK-620) · `Ω_k = (V×E×C×Rev×Cap×Fit) ÷ (1+Risk+Cost+Dep)` (MATH-ROUTE-VALUE-620)

**Factor reading (working interpretation — the letters are authoritative, these readings must be confirmed against the MATH-GATE-NETWORK-620 source):**
E evidence · C self-check · A authority (computed from held level vs floor; never supplied by a model) · R redundancy check · X cross-gate clearance (each open warning on the same route halves it).

**Decision order:** authority below floor → ESCALATE · any factor UNKNOWN → HOLD / PRESERVE_UNKNOWN · E below evidence floor → HOLD / REPAIR · G ≥ 0.8 → PASS · otherwise PARTIAL. A route takes its worst gate. Warnings apply only inside the route that raised them.

**Graph check:** consistent — all edges reciprocated, all rules and gap actions defined

## Adjacency matrix

| | PERS | PRIV | SCEN | OBJE | VISU | RIGH | PROD | STOR | PUBL | MONE | LEGA | AUTO |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **PERSON** | · | ● | ● |  | ● | ● |  |  |  |  | ● |  |
| **PRIVACY** | ● | · | ● |  | ● |  |  |  | ● |  | ● | ● |
| **SCENE** | ● | ● | · | ● | ● |  |  |  |  |  |  |  |
| **OBJECT** |  |  | ● | · | ● | ● | ● |  |  |  |  |  |
| **VISUAL** | ● | ● | ● | ● | · | ● |  |  | ● |  |  |  |
| **RIGHTS** | ● |  |  | ● | ● | · | ● |  | ● |  | ● |  |
| **PRODUCT** |  |  |  | ● |  | ● | · | ● |  | ● | ● |  |
| **STORE** |  |  |  |  |  |  | ● | · | ● | ● | ● |  |
| **PUBLICATION** |  | ● |  |  | ● | ● |  | ● | · |  | ● | ● |
| **MONEY** |  |  |  |  |  |  | ● | ● |  | · | ● | ● |
| **LEGAL** | ● | ● |  |  |  | ● | ● | ● | ● | ● | · | ● |
| **AUTONOMY** |  | ● |  |  |  |  |  |  | ● | ● | ● | · |

## Lane routes

| Lane | Gate path | Current gate | Autonomy may pass alone | Artifact |
|---|---|---|---|---|
| SECOND-GEAR-DETECTIVE | OBJECT → RIGHTS → PRODUCT → LEGAL → MONEY → STORE → PUBLICATION | OBJECT | OBJECT, PRODUCT | `products/second-gear-detective/photosynthesis-pilot.md` |
| SECOND-GEAR-TEACHER | OBJECT → RIGHTS → PRODUCT → LEGAL → MONEY → STORE → PUBLICATION | OBJECT | OBJECT, PRODUCT | `products/second-gear-teacher-pack/content-spec.md` |
| BUILD-YOUR-GATE | OBJECT → RIGHTS → PRODUCT → LEGAL → MONEY → STORE → PUBLICATION | OBJECT | OBJECT, PRODUCT | `products/build-your-gate/activity-spec.md` |
| TALK-WHILE-WORKING | PERSON → PRIVACY → LEGAL → PRODUCT → MONEY → STORE → PUBLICATION | PRIVACY | PRODUCT | `products/talk-while-working/phase1-voice-workflow.md` |
| SCHOOL-ROOMS-VASHON-1986 | PERSON → PRIVACY → RIGHTS → LEGAL → PRODUCT → MONEY → STORE → PUBLICATION | PERSON | PRODUCT | `school-rooms/vashon-class-of-1986/pilot-design.md` |
| DOCTOR-TRANSMISSION | SCENE → PERSON → VISUAL → RIGHTS → LEGAL → PUBLICATION | SCENE | SCENE | `lanes/doctor-transmission/LANE-STATUS.md` |

## PERSON

**Purpose:** Establish who a real person in the work is, and whether they may be depicted, named or quoted at all.

**Inputs:** subject identity claim · relationship to THYLORA · age band (adult / minor / unknown) · living / deceased

**Outputs:** person record ref · depiction permission state · minor flag

**Evidence floor (E ≥ 0.9):** Named person has a consent or authority record on file; a minor has a guardian consent record. Likeness of a real person without either never passes.

**Authority floor:** OPERATOR

**Self-check:** Does every face, name and voice in the output map to exactly one person record?

**Redundancy check:** A second pass matches the output against the person list; any unmatched face or name is a failure.

**Connected gates:** PRIVACY, SCENE, VISUAL, RIGHTS, LEGAL

| Decision | Rule |
|---|---|
| PASS | Every person matched, consent on file, no minor without guardian consent. |
| PARTIAL | Some persons cleared; uncleared persons removed or anonymised and the rest may continue. |
| HOLD | A person is present with no consent record, or age is UNKNOWN where it matters. |
| ESCALATE | Real, identifiable, non-consenting person; any minor in a public output; a deceased person whose estate is unknown. |

| Gap action | What it means here |
|---|---|
| REMOVE | Remove the unconsented person from the output. |
| REPAIR | Obtain the missing consent record (through an operator — never by autonomous outreach). |
| REPURPOSE | Replace with a fictional, clearly labelled character. |
| ROUTE_AROUND | Ship the version that contains no people. |
| ESCALATE | Send to Chairman with the person, the use, and the missing record. |
| PRESERVE_UNKNOWN | Record identity or age as UNKNOWN; never guess it. |

## PRIVACY

**Purpose:** Keep personal data to the minimum necessary and out of any output where it is not required.

**Inputs:** data fields present · audience of the output · retention intent · recording context (who was in earshot / frame)

**Outputs:** redaction list · retention class · audience class

**Evidence floor (E ≥ 0.9):** A field-level inventory of personal data exists for the artifact, and every field has a stated purpose.

**Authority floor:** OPERATOR

**Self-check:** Is any field present that the stated purpose does not need? (health, address, phone, school schedule of a minor, faces of bystanders, account numbers)

**Redundancy check:** Pattern scan (emails, phones, addresses, ID numbers) independent of the author's inventory; any hit not in the inventory fails.

**Connected gates:** PERSON, SCENE, VISUAL, PUBLICATION, LEGAL, AUTONOMY

| Decision | Rule |
|---|---|
| PASS | Inventory complete, every field justified, redactions applied, retention set. |
| PARTIAL | Private-audience version passes; public version still carries unjustified fields. |
| HOLD | No inventory, or scan finds fields the inventory missed. |
| ESCALATE | Minor's data, health data, or covert recording of another person. |

| Gap action | What it means here |
|---|---|
| REMOVE | Strip the unjustified field. |
| REPAIR | Complete the inventory; apply redaction. |
| REPURPOSE | Aggregate or anonymise so the record serves the purpose without the identity. |
| ROUTE_AROUND | Keep the record private; publish only the redacted derivative. |
| ESCALATE | Chairman decision on any minor, health or covert-capture data. |
| PRESERVE_UNKNOWN | Mark the field as UNKNOWN-SENSITIVITY and treat as sensitive until classified. |

## SCENE

**Purpose:** Confirm that a depicted or recorded scene matches its measured scene contract (place, time, people, objects, lighting, framing).

**Inputs:** scene contract · reference measurements · candidate render or capture

**Outputs:** scene contract result per clause · measured deltas

**Evidence floor (E ≥ 1):** A written, measured scene contract exists before any render. No contract, no render.

**Authority floor:** AUTONOMY_SAFE_INTERNAL

**Self-check:** Does every clause of the scene contract have a measured value in the candidate?

**Redundancy check:** Independent re-measurement of the three highest-risk clauses.

**Connected gates:** PERSON, PRIVACY, OBJECT, VISUAL

| Decision | Rule |
|---|---|
| PASS | Every contract clause measured and within tolerance. |
| PARTIAL | Non-critical clauses out of tolerance; critical ones pass. |
| HOLD | No measured contract, or a critical clause fails. Do not render again until the contract passes. |
| ESCALATE | The contract itself depicts a real person, place or institution without clearance. |

| Gap action | What it means here |
|---|---|
| REMOVE | Drop the failing element from the scene. |
| REPAIR | Fix the contract or the measurement, then re-check — do not re-render blind. |
| REPURPOSE | Use the scene for an internal study rather than a public output. |
| ROUTE_AROUND | Publish a text or diagram form of the idea while the scene is held. |
| ESCALATE | Send clause failures on real subjects to Chairman. |
| PRESERVE_UNKNOWN | Unmeasured clauses stay UNMEASURED; they are not assumed to pass. |

## OBJECT

**Purpose:** Confirm every object, material and specification in the work is real, correctly described, and safe to show or use.

**Inputs:** object list · specifications · safety data · source for each factual claim

**Outputs:** verified object list · safety notes · factual-claim citations

**Evidence floor (E ≥ 0.9):** Each factual claim about an object or process has a cited source; each hands-on activity has a safety note.

**Authority floor:** AUTONOMY_SAFE_INTERNAL

**Self-check:** Is every claim either cited or labelled as illustrative?

**Redundancy check:** Second reviewer or second source confirms each science or safety claim.

**Connected gates:** SCENE, VISUAL, RIGHTS, PRODUCT

| Decision | Rule |
|---|---|
| PASS | All claims cited, all activities have safety notes. |
| PARTIAL | Core content verified; an extension activity still lacks a safety note and is withheld. |
| HOLD | An uncited factual claim, or an activity without a safety note. |
| ESCALATE | An activity that could cause injury, or a product claim with regulatory weight (toys, food, medical). |

| Gap action | What it means here |
|---|---|
| REMOVE | Delete the uncited claim or unsafe activity. |
| REPAIR | Cite it or add the safety note. |
| REPURPOSE | Turn an unverifiable claim into an open question for the reader. |
| ROUTE_AROUND | Ship without the extension activity. |
| ESCALATE | Chairman / qualified reviewer for injury or regulated claims. |
| PRESERVE_UNKNOWN | Label as "not yet verified" in the draft; never publish that label as fact. |

## VISUAL

**Purpose:** Decide whether a visual asset may be generated, used or published.

**Inputs:** asset · scene gate result · person gate result · rights basis · generation provenance

**Outputs:** visual release state · provenance record · alt text

**Evidence floor (E ≥ 0.9):** Provenance recorded (made how, by what, from which inputs); SCENE and PERSON results attached.

**Authority floor:** OPERATOR

**Self-check:** Does the image show only what the scene contract allows? Is there alt text?

**Redundancy check:** Independent visual review against the contract, not against the prompt. For product visuals, THY-VISUAL-QUALITY-GATE-001 is the quality check of record.

**Binds existing gate:** THY-VISUAL-QUALITY-GATE-001 (WR-VISUAL-STANDARD-545, branch claude/visual-standard-recovery-gate-2oc3jc, not yet merged). This gate decides whether a visual may exist or be used at all; that gate decides whether a product visual meets the quality standard. Neither replaces the other.

**Connected gates:** PERSON, PRIVACY, SCENE, OBJECT, RIGHTS, PUBLICATION

| Decision | Rule |
|---|---|
| PASS | Provenance on file, SCENE and PERSON pass, rights basis set. |
| PARTIAL | Approved for internal or draft use only. |
| HOLD | SCENE not passed, or provenance missing. One held visual holds only its own route. |
| ESCALATE | Real-person likeness, a real institution's marks, or a medical depiction. |

| Gap action | What it means here |
|---|---|
| REMOVE | Drop the image; the product ships text-first. |
| REPAIR | Pass SCENE first, then regenerate once against the passed contract. |
| REPURPOSE | Use as internal reference only. |
| ROUTE_AROUND | Use a line diagram or icon set that needs no scene contract. |
| ESCALATE | Chairman on likeness, marks or medical depiction. |
| PRESERVE_UNKNOWN | Unknown provenance = not usable; keep the file, record why. |

## RIGHTS

**Purpose:** Confirm THYLORA holds the right to use, adapt, sell and license every component.

**Inputs:** ownership basis per component · licence references · third-party marks and names

**Outputs:** rights ledger entry · licensable / not-licensable flag

**Evidence floor (E ≥ 1):** Every component has an ownership basis (owned original, licensed with reference, public domain with source, or written authorization).

**Authority floor:** OPERATOR

**Self-check:** Is any component's basis UNRESOLVED?

**Redundancy check:** Search for third-party marks (school names, mascots, team names, brand names) the ledger does not list.

**Connected gates:** PERSON, OBJECT, VISUAL, PRODUCT, PUBLICATION, LEGAL

| Decision | Rule |
|---|---|
| PASS | No UNRESOLVED component; no unlisted third-party mark. |
| PARTIAL | Owned-original core passes; a component with an unresolved basis is removed from the release. |
| HOLD | Any UNRESOLVED basis in a sellable output. |
| ESCALATE | A third party's trademark or a school / district name used commercially. |

| Gap action | What it means here |
|---|---|
| REMOVE | Take out the unresolved component. |
| REPAIR | Record the basis or obtain the licence (operator, not autonomy). |
| REPURPOSE | Replace with an owned original. |
| ROUTE_AROUND | Release the owned-original core. |
| ESCALATE | Chairman on third-party marks and school names. |
| PRESERVE_UNKNOWN | Basis stays UNRESOLVED on the ledger until evidence arrives. |

## PRODUCT

**Purpose:** Confirm the thing being sold exists as a complete, checked artifact matching its specification.

**Inputs:** specification · artifact files · OBJECT and RIGHTS results · age band

**Outputs:** product record · completeness report · SKU draft

**Evidence floor (E ≥ 0.9):** The artifact exists as files; every spec section is present; a reviewer has read it end to end.

**Authority floor:** AUTONOMY_SAFE_INTERNAL

**Self-check:** Spec-to-artifact checklist: every section present, no placeholder text.

**Redundancy check:** A second reviewer reads it as the buyer would.

**Connected gates:** OBJECT, RIGHTS, STORE, MONEY, LEGAL

| Decision | Rule |
|---|---|
| PASS | Complete artifact, OBJECT and RIGHTS pass. |
| PARTIAL | A pilot subset is complete (for example 10 of 30 cards) and may go forward as a pilot. |
| HOLD | Placeholder content, a missing section, or OBJECT/RIGHTS not passed. |
| ESCALATE | A product aimed at children with a physical component (toy safety), or a claim of educational outcome. |

| Gap action | What it means here |
|---|---|
| REMOVE | Cut the incomplete section. |
| REPAIR | Finish the missing section. |
| REPURPOSE | Ship the complete subset as a pilot or free sample. |
| ROUTE_AROUND | Release the digital version while the physical version is held. |
| ESCALATE | Chairman on physical children's goods and outcome claims. |
| PRESERVE_UNKNOWN | Unknown page count, format or age band stays UNKNOWN on the record. |

## STORE

**Purpose:** Decide whether a passed product may be listed in a store (draft or live).

**Inputs:** PRODUCT result · price (PROPOSED or approved) · listing copy · delivery path · refund policy

**Outputs:** listing draft · listing state (DRAFT / LIVE)

**Evidence floor (E ≥ 0.9):** Delivery path tested end-to-end with a test purchase; listing copy makes no unverified claim.

**Authority floor:** CHAIRMAN

**Self-check:** Does the listing promise anything the artifact does not contain?

**Redundancy check:** Test purchase receipt + protected download witnessed.

**Connected gates:** PRODUCT, PUBLICATION, MONEY, LEGAL

| Decision | Rule |
|---|---|
| PASS | Chairman approved price and listing; test purchase witnessed. |
| PARTIAL | Listing prepared as DRAFT (unpublished); nothing is purchasable. |
| HOLD | No test purchase, or price is still PROPOSED. |
| ESCALATE | Always, for the move from DRAFT to LIVE. |

| Gap action | What it means here |
|---|---|
| REMOVE | Withdraw the listing. |
| REPAIR | Fix copy or delivery; re-run the test purchase. |
| REPURPOSE | List as a free sample to test delivery with no money path. |
| ROUTE_AROUND | Keep the product in the library while the store listing is held. |
| ESCALATE | Chairman approves price and go-live. |
| PRESERVE_UNKNOWN | Unset price stays UNSET — never defaulted. |

## PUBLICATION

**Purpose:** Decide whether anything leaves THYLORA to a public or third-party audience (post, page, email, listing, outreach).

**Inputs:** artifact · audience · channel · PRIVACY, VISUAL and RIGHTS results

**Outputs:** publication decision · publication record

**Evidence floor (E ≥ 1):** PRIVACY, VISUAL (if images) and RIGHTS all passed for this artifact and audience.

**Authority floor:** CHAIRMAN

**Self-check:** Is the audience exactly the intended one? Is anything in it private?

**Redundancy check:** Final read of the exact bytes to be published, not the draft.

**Connected gates:** PRIVACY, VISUAL, RIGHTS, STORE, LEGAL, AUTONOMY

| Decision | Rule |
|---|---|
| PASS | Upstream gates passed and Chairman instruction on record for this publication. |
| PARTIAL | Approved for an internal audience only. |
| HOLD | Any upstream gate not passed. |
| ESCALATE | All external outreach and all first posts. External outreach requires Chairman instruction. |

| Gap action | What it means here |
|---|---|
| REMOVE | Do not publish. |
| REPAIR | Pass the upstream gate, then re-submit. |
| REPURPOSE | Keep as an internal brief. |
| ROUTE_AROUND | Publish the part that passed; hold the rest. |
| ESCALATE | Chairman instruction required. |
| PRESERVE_UNKNOWN | Unknown audience = do not publish. |

## MONEY

**Purpose:** Decide whether any money can move: price, charge, credit, payout, subscription.

**Inputs:** price record and status · processor · fee model · refund path · payer age class

**Outputs:** money path record · net-per-unit estimate

**Evidence floor (E ≥ 1):** Price approved (not PROPOSED); processor connected and witnessed; refund path exists.

**Authority floor:** CHAIRMAN

**Self-check:** Does net per unit stay positive after processor fees?

**Redundancy check:** Reconcile against the processor's own record, not THYLORA's.

**Connected gates:** PRODUCT, STORE, LEGAL, AUTONOMY

| Decision | Rule |
|---|---|
| PASS | Chairman-approved price, witnessed processor, positive net, refund path. |
| PARTIAL | Money path designed and modelled; nothing charges. |
| HOLD | Price PROPOSED, processor unwitnessed, or net negative. |
| ESCALATE | Any stored value, prepaid credit, subscription, or payment from or for a minor. |

| Gap action | What it means here |
|---|---|
| REMOVE | Remove the charge; ship free. |
| REPAIR | Fix the fee model or bundle to make net positive. |
| REPURPOSE | Move a micro-price item into a bundle. |
| ROUTE_AROUND | Sell through the existing witnessed store path only. |
| ESCALATE | Chairman on credits, subscriptions and minors. |
| PRESERVE_UNKNOWN | Unknown price stays UNKNOWN (e.g. enterprise pricing). |

## LEGAL

**Purpose:** Flag anything with legal weight before it acts: consent to record, children's data, education claims, stored value, trademarks, contracts.

**Inputs:** jurisdictions · audience age · recording / data practices · commitments made

**Outputs:** legal flag list · required-review list

**Evidence floor (E ≥ 1):** Each flag either cleared by a qualified reviewer or held; THYLORA does not self-certify legal clearance.

**Authority floor:** CHAIRMAN

**Self-check:** Does this create a commitment, collect a child's data, record a person, or hold money?

**Redundancy check:** Checklist per jurisdiction in scope; unknown jurisdiction = held.

**Connected gates:** PERSON, PRIVACY, RIGHTS, PRODUCT, STORE, PUBLICATION, MONEY, AUTONOMY

| Decision | Rule |
|---|---|
| PASS | No flags, or every flag cleared by a qualified reviewer on record. |
| PARTIAL | Flagged features removed; the unflagged remainder proceeds. |
| HOLD | An open flag with no review. |
| ESCALATE | Children, recording consent, stored value, trademarks, contracts. |

| Gap action | What it means here |
|---|---|
| REMOVE | Remove the flagged feature. |
| REPAIR | Obtain qualified review. |
| REPURPOSE | Redesign the feature so it carries no flag (e.g. no child accounts; guardian holds the account). |
| ROUTE_AROUND | Launch in one jurisdiction with known rules. |
| ESCALATE | Chairman decides whether to seek review. |
| PRESERVE_UNKNOWN | Unknown legal status stays UNKNOWN — never "probably fine". |

## AUTONOMY

**Purpose:** Decide what the autonomy worker may do without a human: which lanes it may advance and which actions it must never take.

**Inputs:** task autonomy_class · gate path of the route · upstream gate receipts

**Outputs:** autonomy decision · gate receipts · cross-gate warnings

**Evidence floor (E ≥ 0.9):** The task names its gate path; every action the worker proposes maps to a gate whose authority floor it meets.

**Authority floor:** AUTONOMY_SAFE_INTERNAL

**Self-check:** Did the worker claim an external action, deployment, payment or completion without evidence?

**Redundancy check:** Deterministic code re-computes A for each gate from autonomy_class; the model's own self-assessment never grants authority.

**Connected gates:** PRIVACY, PUBLICATION, MONEY, LEGAL

| Decision | Rule |
|---|---|
| PASS | Internal drafting on a route whose gates it may pass. |
| PARTIAL | Worker completes the internal part and parks the rest as WAITING_CHAIRMAN. |
| HOLD | The route has no gate path, or a receipt is missing. |
| ESCALATE | Any STORE, PUBLICATION, MONEY or LEGAL action; all external outreach. |

| Gap action | What it means here |
|---|---|
| REMOVE | Drop the proposed action. |
| REPAIR | Attach the missing gate path or receipt. |
| REPURPOSE | Convert an external action into an internal draft for review. |
| ROUTE_AROUND | Continue independent lanes; one held lane never stops another. |
| ESCALATE | Park as WAITING_CHAIRMAN. |
| PRESERVE_UNKNOWN | Unknown autonomy_class = CHAIRMAN_RESERVED. |
