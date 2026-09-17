# C&W VEHICLE CIVILIZATION
## ENGINEERING NOTEBOOK — VOLUME 1
### How THYLORA Interrogates a Vehicle Before It Is Allowed to Exist

**Product code:** CW-ENG-NOTEBOOK-VOL1
**Edition:** First edition, 2026
**Publisher:** ErsatzReality / THYLORA
**Shop identity:** C&W (canonical; see the naming note in Chapter 0)

---

> ## READ THIS BEFORE ANYTHING ELSE
>
> **This is design, simulation and research work. It is not a certified production vehicle. No claim of road homologation is made anywhere in this document.**
>
> Nothing in this notebook has been crash tested. No dimension here has been measured on hardware. No control described here has been validated. There is no CAD geometry behind these pages and no physical prototype.
>
> That is not a disclaimer bolted onto a sales page. It is the subject of the book. This notebook is about what you are required to *know you do not know* while designing a vehicle, and about the discipline of writing that down instead of covering it up.
>
> If you are looking for a finished car, this is the wrong document. If you are looking for how a serious programme keeps itself honest before it has earned the right to draw a car, keep reading.

---

## CHAPTER 0 — WHAT THIS NOTEBOOK IS, AND THE THREE LABELS

Most engineering documents fail in the same way. They mix what is known, what is believed, and what is hoped, and then they present the mixture in one uniform typeface. Six months later nobody can reconstruct which sentence was measured and which was somebody's Tuesday-afternoon opinion.

The whole C&W method rests on refusing to do that. Every statement in the working record carries exactly one of three labels, and they are never merged:

**DOCUMENTED** — There is a source, a measurement, or a test result. It can be pointed at.

**HYPOTHESIS** — A reasoned engineering direction that has not been validated. It may be excellent. It is still not a fact, and it never gets to borrow the authority of one.

**UNKNOWN** — We have named the thing we do not know. This is a positive act, not an absence. An unnamed unknown is the one that kills people.

You will see these labels throughout. Where an entire chapter is HYPOTHESIS, it says so at the top.

### A note on the name

The canonical form of the shop identity is **C&W**. It is written that way everywhere.

The form "CNW" exists in older technical records because voice transcription repeatedly substituted the letter N for the ampersand. Those legacy identifiers are preserved as inert technical history — they are not renamed destructively, because rewriting an identifier in a record you can no longer verify is how provenance is lost. They are mapped forward, not erased.

This is itself a small lesson in the method: when you find a naming error in a live system, the correct move is a controlled mapping with both forms preserved, not a global find-and-replace that quietly rewrites history.

---

## CHAPTER 1 — OCCUPANT PACKAGE: THE BODY COMES FIRST

**Chapter state: ARCHITECTURE DEFINED. NUMERIC LIMITS OPEN.**

Most vehicle design starts with a silhouette and then asks where the human fits. C&W inverts that. The occupant envelope is fixed first, and the body is drawn around it afterwards. A shape that cannot accommodate the body is not a beautiful shape with a packaging problem. It is a failed shape.

### The eleven inputs

The occupant package is driven by eleven measurements, and all eleven are required before any surface is committed:

stature · seated eye height · hip breadth · shoulder breadth · functional reach · knee clearance · foot length · body mass · mobility limits · prosthesis and assistive-device envelope · child-restraint geometry

Two of those are routinely left out of commercial packaging studies, and their absence is exactly where products fail their users: **the prosthesis and assistive-device envelope**, and **mobility limits**. A vehicle that only packages the unimpaired median body has not solved packaging. It has solved packaging for the easiest case and declared victory.

### Design population

Provisional design envelope: **5th percentile adult female through 95th percentile adult male.**

Children are handled through regulated child restraints, not by treating a child as a small adult.

Disability cases and bodies outside the envelope are explicitly *not* solved by simulation. They require physical buck trials. Writing "accommodates all users" into a specification without running those trials is a claim, not an engineering result.

> **HYPOTHESIS.** The 5th–95th envelope is conventional and defensible as a starting point, but it is a starting point, not a finding. It under-serves the tails by construction. A programme that intends to serve the tails must say so and widen the envelope deliberately, then pay the packaging cost.

### The seven hard gates

These are pass/fail. A design that misses any one of them is not adjusted, it is rejected:

1. Clear sight triangles
2. No control interference
3. Belt geometry within validated corridors
4. Head, knee and chest clearance
5. **Two-path emergency egress**
6. Child-seat anchor access
7. Rescue access

Gate 5 and gate 7 are the ones commercial programmes argue about, because they cost styling. They are also the two that determine whether a survivable crash becomes a fatality. A person who survives the impact and cannot get out, or cannot be got out, has not been saved by the structure.

### What is adjustable, and why that matters

seat fore-aft, height, cushion tilt, back angle · pedal reach module · steering reach and rake · belt upper anchor and pretension profile · head restraint · display and HMI position and contrast · entry step and handhold · climate zones

Adjustability is not comfort equipment. It is how one physical structure serves a population instead of a percentile. Every adjustment removed from this list narrows the set of humans the vehicle actually fits.

### Verification required before any of this is believed

digital manikins · full-scale adjustable buck · ingress and egress trials · reach and visibility study · child-restraint installation study · mobility-device study · **misuse testing**

> **UNKNOWN.** The numeric biometric corridors have not been measured. Every dimension in the eventual package is currently open. This chapter describes a method that is ready to be executed and has not been executed.

---

## CHAPTER 2 — BODY ARCHITECTURE, ROLLOVER AND THE CLOSED RING

**Chapter state: CONCEPT ARCHITECTURE. CAE AND PHYSICAL VALIDATION REQUIRED.**

### The cell

A continuous multi-ring occupant safety cell, with front and rear crush rails, side sill and roof cross-load paths, and a protected floor boundary for energy storage.

Note the sequencing constraint: **the floor battery or fuel boundary is selected only after propulsion is locked.** You cannot protect a volume whose contents and failure modes you have not yet chosen. Programmes that draw the floor before choosing the energy system are drawing a picture, not an architecture.

### Rollover

The governing rule is short: **the closed load ring is preserved independently of the cosmetic roof, and door openings cannot sever the primary ring.**

This is where styling and survival collide most directly. Every large door aperture, every frameless glass decision, every roofline that sells the car in a photograph is a potential cut through the ring. The rule does not forbid those features. It forbids them *at the cost of the ring*.

### Side impact

Deep sill, seat crossmember, and B-pillar to roof-rail load sharing.

> **HYPOTHESIS — and a deliberate refusal.** External deployable protection is research-only. It is not in the architecture. The temptation here is significant, because a deployable external structure is a compelling idea and photographs beautifully. It is also unvalidated against false deployment, pedestrian and cyclist interaction, repairability and crash compatibility. Until those exist, it stays out. **It must never be represented as a force field.**

### Crash modules and repairability

Bolt-on, replaceable front and rear crash boxes with keyed interfaces and post-repair dimensional verification.

The keyed interface and the dimensional verification are the entire point. A replaceable crash structure that can be fitted wrongly, or fitted correctly but never checked, is worse than a welded one, because it carries an unearned assumption of restored performance.

### Restraints

adaptive load-limited belts · multi-stage frontal airbags · far-side and curtain protection · seat-integrated side protection · occupant classification with **privacy-minimized local processing** · **mechanical release accessible after power loss**

The last item is the one that gets deleted in cost reviews. It is the one that matters at the moment the vehicle has no electrical power and someone is inside it.

### Post-crash

automatic energy isolation · hazard lighting · location beacon · rescue sheet and QR **plus offline physical markings** · manual door and window escape · fire and immersion response

"Plus offline physical markings" is not redundancy for its own sake. The rescue crew arriving at a deformed vehicle in the rain may have no working scanner, no network, and no power in the car. Physical markings work under all three conditions.

---

## CHAPTER 3 — MASS, CENTRE OF GRAVITY AND THE HONEST GAP

**Chapter state: UNKNOWN. THIS CHAPTER DEFINES WORK, NOT RESULTS.**

This is the shortest chapter in the notebook and the most important one to read carefully, because it is where most engineering documents start lying.

The mass and centre-of-gravity envelope is **unresolved**. There is no mass target. There are no hard dimensions. Consequently:

- Rollover threshold cannot be computed. It is a function of track width and CG height, and neither is fixed.
- Braking distances cannot be estimated.
- Suspension rates cannot be specified.
- Crash pulse cannot be predicted.
- Tyre loads cannot be derived, which means wheel design cannot be validated.

A document that presented a rollover threshold at this stage would be presenting arithmetic performed on invented inputs. The number would look authoritative and mean nothing.

**What is defined instead is the dependency order**, which is genuine engineering content:

```
propulsion and energy architecture locked
        ↓
mass model and distribution
        ↓
CG envelope (height, longitudinal, lateral)
        ↓
track and wheelbase
        ↓
rollover threshold · suspension rates · brake sizing · tyre load
        ↓
wheel structural validation
        ↓
ONLY THEN: final body geometry
```

Every arrow is a gate. You cannot skip one by assuming the value.

> **This is why there is no picture of a finished car in this notebook, and why the cover is an engineering sheet.** Final body geometry sits at the bottom of a chain whose top is still open. Rendering the car now would be rendering a guess and calling it a design. The programme's own visual gate prohibits exactly that, and prohibits rendering before the design brief and geometry gates are reviewed.

---

## CHAPTER 4 — HYDROPLANING, CROSSWIND AND THE LOSS-OF-CONTROL TREE

**Chapter state: HYPOTHESIS AND METHOD. NO VALIDATION.**

Hydroplaning and crosswind behaviour are both downstream of Chapter 3. Hydroplaning speed depends on tyre load, contact patch and tread depth — tyre load is open. Crosswind response depends on side area, CG height and the relationship between the aerodynamic centre of pressure and the CG — all open.

So instead of fabricating numbers, the method treats both as branches of a single fault tree.

### Top event: LOSS OF CONTROL

**Branches:** service-brake loss · steering authority loss · uncommanded propulsion · traction estimate corruption · safety-bus failure

**Controls:** segregation · diverse sensing · independent reserve · degraded mode · driver warning

**Minimum cut sets** — the combinations that are individually sufficient to produce the top event:

1. Common power loss **plus** no reserve
2. Shared sensor corruption **plus** missing plausibility check
3. Actuator jam **plus** no mechanical or degraded path

Read those three lines again. Each is a *pair*. That is the structural insight of cut-set analysis: the single failures are survivable, and the vehicle is killed by a failure arriving alongside a missing backstop. Which means the engineering work is not primarily about preventing the first item in each pair. It is about guaranteeing the second never goes missing — and the second is always the thing that looks like expensive redundancy in a cost review.

Traction estimate corruption is where hydroplaning enters formally. A vehicle that has lost tyre contact and does not *know* it has lost contact is in a worse state than one that has, because the control system continues to act on a false model of the road.

### Two further top events

**OCCUPANT SURVIVAL CELL COMPROMISED**
Branches: frontal intrusion · side intrusion · rollover collapse · restraint mistiming · door opening or jam
Controls: closed load rings · crush management · restraint synchronization · latch retention · two-path egress

**POST-CRASH ENTRAPMENT OR FIRE**
Branches: energy not isolated · handles unavailable · glass or door pressure jam · beacon failure · rescue information absent
Controls: automatic plus manual isolation · mechanical releases · escape tool and path · dual beacon path · offline rescue markings

---

## CHAPTER 5 — THE FMEA: SIX ITEMS, ALL OPEN

**Chapter state: ALL SIX VALIDATION STATES ARE OPEN.**

The failure-mode table is reproduced honestly, including the fact that not one line has been closed.

| Item | Failure mode | Effect | Control | Detection | Validation required | State |
|---|---|---|---|---|---|---|
| Service brake circuit | Leak or pressure loss | Longer stop; loss of one axle circuit | Split circuits, warning, friction reserve | Pressure and pedal-travel plausibility | Fault injection plus loaded fade/stop tests | **OPEN** |
| Steering actuator/sensor | Jam, dropout, disagreement | Directional-control degradation | Mechanical or independently validated fail-operational path | Dual diverse sensing; current/position plausibility | Hardware-in-loop and proving-ground fault injection | **OPEN** |
| Occupant classification | Misclassification | Wrong restraint deployment profile | Validated fallback plus manual child-seat guidance | Sensor disagreement; conservative fallback | Body-form, posture, cargo and misuse matrix | **OPEN** |
| Door release | Power loss or deformation | Delayed egress and rescue | Ambidextrous mechanical release; external rescue point | Self-test plus physical inspection | Post-impact, rollover, fire and immersion drills | **OPEN** |
| Safety network gateway | Bus-off, spoofing, update fault | Loss or corruption of commands | Segmentation, safe state, signed rollback-capable update | Heartbeat, message authentication, sequence/time plausibility | Cybersecurity and fault-injection campaign | **OPEN** |
| Energy storage / fuel boundary | Intrusion, leak, thermal propagation | Fire or toxic exposure | Protected placement, vent path, isolation, propagation barriers | Temperature, pressure, isolation or leak sensing | Component and full-vehicle abuse and crash tests | **OPEN** |

Two observations worth carrying into your own work.

**Every detection column is a plausibility check, not a sensor.** The pattern repeats: pressure *and* pedal travel; dual *diverse* sensing; sensor *disagreement*. A single sensor reporting a value is not detection. Detection is two independent things that should agree, and a defined response when they do not.

**Conservative fallback appears twice and should appear everywhere.** When the occupant classifier is unsure, it does not guess. It falls back to the profile that is least likely to injure. Systems that resolve uncertainty by picking the most probable answer are optimising the wrong quantity when the cost of the two errors is asymmetric.

---

## CHAPTER 6 — SUBMERSION, AND WHERE THE NOTEBOOK REFUSES

**Chapter state: PARTIALLY BENCHMARKED. LARGELY UNVALIDATED.**

Submersion is included because it demonstrates the method under maximum temptation.

**The documented hazard:** water entry impairs electrical systems and rapid egress.

**The improvement direction:** mechanical egress redundancy, electrical isolation, beaconing, coordinated rescue.

**The seductive idea:** long-duration sealed survival, with breathable gas derived from the surrounding water.

That idea is genuinely compelling. It would be a landmark capability. It is also, in this record, explicitly held as **research-only and unvalidated**, and the primary design is required to prioritise something far less exciting: **immediate, reliable egress, plus a redundant emergency breathing reserve.**

This is the discipline the notebook is actually selling. The engineering system had an opportunity to promise something extraordinary and instead wrote down that the ordinary thing — get the person out fast — takes design priority, and that the extraordinary thing does not get to influence the architecture until it has survived:

full-vehicle immersion tests · window and door operation under pressure · electrical isolation · battery behaviour · occupant breathing-gas safety · rescue interface

**A capability that has not passed those tests is a story. The notebook's position is that stories do not get to shape load paths.**

---

## CHAPTER 7 — REPAIRABILITY AS A SAFETY PROPERTY

**Chapter state: PUBLIC RESEARCH REQUIRED. OPEN.**

Repairability is usually filed under ownership cost. In this method it is filed under safety, for one reason: **a vehicle that has been repaired badly is a vehicle whose crash performance is now unknown, and nobody knows it is unknown.**

Baseline problem: integrated assemblies and software complicate repair.

Direction: modular service zones · safe replaceable crash modules · diagnostic evidence · part provenance · repair instructions.

"Part provenance" is doing heavy work in that list. A replaceable crash box only restores performance if the fitted part is *the* part. Without provenance, the modular architecture has converted a known structure into an unknown one, and has done it invisibly.

---

## CHAPTER 8 — THE EIGHT OPEN GAPS

The complete gap register, reproduced without softening. Every one is OPEN.

| Code | Domain | Earth baseline | C&W direction | Evidence state |
|---|---|---|---|---|
| GAP-001 | Occupant package | Performance packaging trades comfort and accessibility against compactness and aero | Occupant-envelope-first: comfort, egress, visibility, survivability **before** final surfacing | Public research required |
| GAP-002 | Side impact | Side crash space is inherently limited | Increase usable side crash volume and load paths; predictive external protection stays evidence-gated | Engineering research required |
| GAP-003 | Submersion | Water entry impairs electrical systems and rapid egress | Mechanical egress redundancy, electrical isolation, beaconing, breathing reserve, coordinated rescue | Engineering research required |
| GAP-004 | Underride / vulnerable road users | High-clearance geometry creates underride and VRU conflicts | High seating with controlled lower envelope, smooth anti-hook geometry, sensing, speed management | Engineering research required |
| GAP-005 | Repairability | Integrated assemblies and software complicate repair | Modular service zones, safe replaceable crash modules, diagnostic evidence, part provenance | Public research required |
| GAP-006 | Wheel design | Large aesthetic wheels add unsprung mass and cost and increase impact vulnerability | Original deep-dish language validated for fatigue, impact, mass, brake cooling and tyre loads | Engineering research required |
| GAP-007 | Door egress | Flush and electronic handles trade discoverability against emergency access | Ambidextrous rapid-access interface with mechanical fallback and reinforced hinge/latch architecture | Engineering research required |
| GAP-008 | Post-crash response | Crash notification and rescue dispatch are fragmented | Integrate vehicle, road corridor, dispatch and rescue with truthful confidence **plus privacy and due-process gates** | System research required |

GAP-006 is the honest one about styling: the deep-dish wheel language is an aesthetic commitment that has been written down as an *engineering obligation* — it must be validated for fatigue, impact, mass, brake cooling and tyre loads, and tyre loads are blocked behind Chapter 3. The programme is not permitted to ship the look and validate later.

GAP-008 carries a constraint most safety-systems work omits: the integration of vehicle, corridor, dispatch and rescue must report **truthful confidence** and must pass **privacy and due-process gates**. A system that tells a dispatcher it is certain when it is not will eventually send help to the wrong place, and a system that achieves its response times by abolishing privacy has bought safety with a currency it did not own.

---

## CHAPTER 9 — THE NINE BLOCKERS

What stands between this notebook and a vehicle. Stated plainly, because a programme that cannot list its own blockers is not a programme.

1. Numeric biometric corridors not yet measured
2. Hard dimensions and mass target unresolved
3. Powertrain and energy architecture unresolved
4. Materials and joint stack unvalidated
5. No CAD geometry or CAE correlation evidence
6. No physical prototype or test evidence
7. Homologation market unresolved
8. Patent prior-art and counsel review not performed
9. Supplier and manufacturer commitment not evidenced

And the ten open work packages: hard dimensions and mass model · propulsion and energy architecture · materials coupons, joints and corrosion · CAE model correlation · sled and component tests · full-vehicle crash, rollover and brake tests · human-factors buck trials · EMC, cybersecurity and environmental tests · homologation market and regulatory matrix · **independent safety review**.

The last one is deliberately last and deliberately independent. A safety review conducted by the people who produced the design is not a safety review. It is a proofread.

---

## CHAPTER 10 — HOW TO USE THIS METHOD ON YOUR OWN WORK

The vehicle is the worked example. The method generalises. Six steps:

**1. Write the three labels into your document template.** Not as a convention people are asked to remember — as literal required fields. If a statement cannot be labelled, it is not ready to be in the document.

**2. Fix the human envelope before the shape.** Whatever you are building, identify the thing that must fit — the user, the body, the payload, the regulation — and freeze that before you commit to form. Most bad designs are a form that was chosen first and then defended.

**3. Build the dependency chain and mark every arrow as a gate.** Then check whether you have skipped one by assuming a value. You will have. Everyone has.

**4. Do cut-set analysis, not single-failure analysis.** Ask what *pair* of things kills the system. The second item in each pair is almost always the safeguard that looks like waste in a budget review. That is what your analysis is for: making the case for the thing that looks like waste.

**5. Make every detection a plausibility check.** Two independent sources that should agree, and a defined behaviour when they do not. One sensor reporting a value is not detection.

**6. Write down the exciting idea you are refusing, and why.** Chapter 6 is the template. The refusal, recorded with its conditions for reconsideration, is worth more than the idea.

---

## CLOSING

There is no car at the end of this notebook.

There is an occupant envelope defined but not measured, a structural architecture conceived but not correlated, a fault tree with three top events and no test data behind any of them, a failure table with six lines and six OPEN states, eight named gaps and nine named blockers.

Most programmes at this stage have a rendering and a press release. This one has a list of what it does not know, written down precisely enough that someone could go and find out.

**That is the deliverable. The car comes after — and only after — the list is closed.**

---

### PROVENANCE

Every technical statement in this notebook is drawn from the C&W / ErsatzReality vehicle engineering records held in the THYLORA backend: build sheet **ER-AUTO-BS-009** (occupant package, body architecture, crash engineering, fault trees, failure-mode table, open gaps, blockers), the automotive gap register **ER-AUTO-GAP-001** through **ER-AUTO-GAP-008**, the transport safety case register, the transport design gate **AUTO-VISUAL-GATE-001**, and naming correction **AUTO-NAME-001**.

Nothing has been invented for publication. Where the record says a thing is open, this notebook says it is open.

### RIGHTS

Original THYLORA / ErsatzReality work. No Earth manufacturer's design, identity, trade dress or documentation is reproduced. Earth vehicles appear only as baseline context in the gap register, described in general terms and never named. No photography, no third-party diagrams, no licensed standards text.

### THE STATEMENT, REPEATED

**Design, simulation and research work. Not a certified production vehicle. No claim of road homologation.**
