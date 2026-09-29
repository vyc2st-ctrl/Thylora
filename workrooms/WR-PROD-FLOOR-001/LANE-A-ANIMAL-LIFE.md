# WR-PROD-FLOOR-001 · LANE A · EdereAirah Animal Life Department

**Lane:** A (EdereAirah Animal Life Department)
**Written:** 2026-09-28, production-floor session, working in `/home/user/Thylora`
**Inputs read in full:** `SOURCE-DIRECTIVE.md` (Chairman verbatim), `00-RECOVERED-STATE.md` (backend read record). Also checked `LANE-B-FIRST-TRANSMISSION.md` for overlap. Lane B holds "no animal in frame" until Lane A clears a species (its line 323).
**Backend:** this lane has **not** connected to the backend, read from it, or written to it. Everything this file says about backend content comes from `00-RECOVERED-STATE.md` §3. The write-back is the **BACKEND CHANGE PACKET** in §22. Its column mapping is `VERIFY_BEFORE_APPLY`.
**Owning world department (working):** the department behind `THY-TRANS-WILDLIFE-607`, "Wildlife Refuge & Return" (working name; EdereAirah name OPEN). Its keeper, habitat ecologist and release lead are all **OPEN**, so this file uses **UNNAMED SLOTs** and adds no invented people.

## 0 · Truth key used in this file

| Tag | Meaning |
|---|---|
| `RECOVERED` | Read from the backend (via `00-RECOVERED-STATE.md`). Not changed here. |
| `PROPOSED` | Created by this lane. It is **not canon** until the Chairman approves it. Every planetary value, biome, species, name and root below is PROPOSED. |
| `EARTH-FACT` | A real-world scientific or legal statement, cited from training knowledge. It was **not re-fetched this session**, so check it before publication (§18). |
| `ESTIMATE` | A number with no verified source. Its basis is stated next to it. |
| `UNKNOWN` | Not known. Not invented. |
| `OPEN` | Awaiting canon or a decision. Not guessed. |
| `VERIFY_BEFORE_APPLY` | A backend column mapping that was not read. |

Units: metric first, US customary in brackets. **Local day** = 26.0 h (PROPOSED). **Local year** = 314 local days = 340.5 Earth days = 0.932 Earth years (PROPOSED, derived in E4). The production calendar divides the local year into twelve numbered **twelfths T1–T12**, each 26.2 local days (≈ 28.4 Earth days). They are numbered only and deliberately not named (Chairman decision CD-07).

---

## 1 · Every-Word coverage: Lane A source atoms

Each Lane A atom in the directive leaves with a state.

| # | Source atom (verbatim or near-verbatim) | State | Where |
|---|---|---|---|
| A01 | "Retrieve any existing animal/estate/ecology records before inventing." | EXECUTED (via recovered-state read; this lane made no new backend read) | §2 |
| A02 | "older 1700s estate animal groups such as draught horses" | ANSWERED | §2 row ANIMAL-HORSE-001 |
| A03 | "riding horses" | ANSWERED | §2 ANIMAL-HORSE-RIDING-001 |
| A04 | "cattle" | ANSWERED | §2 ANIMAL-CLASS-CATTLE |
| A05 | "sheep" | ANSWERED | §2 ANIMAL-CLASS-SHEEP |
| A06 | "pigs" | ANSWERED | §2 ANIMAL-CLASS-PIG |
| A07 | "poultry" | ANSWERED | §2 ANIMAL-CLASS-POULTRY |
| A08 | "working dogs" | ANSWERED | §2 ANIMAL-CLASS-WORKING-DOG |
| A09 | "These records are incomplete and are NOT equivalent to the wider native EdereAirah fauna" | ANSWERED | §3 gaps G-01…G-14 |
| A10 | "Build the modern/native animal-life system." | EXECUTED (as PROPOSED) | §4–§12 |
| A11 | primates | EXECUTED | S06 VASKRELL, S07 DROVATH |
| A12 | gorilla/monkey analogues | EXECUTED | S07 (gorilla analogue), S06 (monkey analogue) |
| A13 | slugs/small organisms | EXECUTED | S01 DROVESK; §7 microbes and invertebrates |
| A14 | giraffe-like species | EXECUTED | S08 VELLSTRAN |
| A15 | whales | EXECUTED | S13 HOLVOND; aquatic zone Z6/Z7 in §6.5 |
| A16 | lions/predators | EXECUTED | S11 SORRHALD; S02 SORRVIRR (invertebrate predator) |
| A17 | "elephants or large forest animals where physically viable" | EXECUTED with viability check | S09 BRUSKOND; E5, E6, E7, E8 |
| A18 | insects | EXECUTED | S02, S03, S04 |
| A19 | bees | EXECUTED | S03 PLENNIT |
| A20 | "hummingbird/butterfly ecological analogues if appropriate" | EXECUTED (appropriate: justified by E11 and flower chemistry) | S05 VIRRESK, S04 PLENNREN |
| A21 | migration | EXECUTED | §11 |
| A22 | habitats | EXECUTED | §6 zones Z1–Z7; each species card |
| A23 | food webs | EXECUTED | §10 |
| A24 | animal-care systems | EXECUTED (design) | §12 |
| A25 | Earth pet-care derivatives | EXECUTED (design) | every species card; §15 |
| A26 | "DO NOT simply name animals." | OBEYED | every species has 24 fields and a physics basis |
| A27 | "FIRST: Define one biome" + 12 listed dimensions | EXECUTED | §6.1–§6.12 |
| A28 | "Then derive plants, microbes, invertebrates, herbivores, predators, scavengers, domesticated/companion life" | EXECUTED in that order | §7 |
| A29 | 24 per-species fields | EXECUTED 14 × 24 = 336 / 336 | §9 |
| A30 | Deliverables 1–11 | EXECUTED as drafts | §2, §3, §6, §9, §11, §13, §14, §15, §16, §17, §18 |
| A31 | Global DO NOT list, VISUAL LAW, MATH RULE, COMMERCE LAW, NO NAKED LATER, DEPARTMENT RETURN FORMAT | OBEYED | §5 math, §16 visuals, §17 commerce, §19 later-register, §21 return |
| A32 | "If NOT connected to backend: … Return a BACKEND CHANGE PACKET" | EXECUTED | §22 |

---

## 2 · Deliverable 1: Recovered existing animal records (RECOVERED, unchanged)

Source: `thylora_estate_animal_groups` (7 rows). All rows share `estate_code = ER-CASTLE-ROYAL-001`, `time_region = 1700s`, `function_code = EST-ANIMAL-CARE-001`, `source_query_id = THY-WORK-IMPLEMENT-ESTATE-ECONOMY-533`, created 2026-09-19. In every row, `headcount` is null and `care_cycle`, `farrier_or_vet_provision` and `retirement_rule` are `OPEN`.

| animal_group_code | species_class | purpose | housed_at | responsible_role | state | open_fields |
|---|---|---|---|---|---|---|
| ANIMAL-HORSE-001 | HORSE | DRAUGHT | SEC-Z-STABLES | HH-1700-STABLE | CANON_ANCHORED_DETAIL_OPEN | stable_count, headcount, farrier_provision, feed_chain, animal_retirement_rule |
| ANIMAL-HORSE-RIDING-001 | HORSE | RIDING | SEC-Z-STABLES | HH-1700-STABLE | CANON_ANCHORED_DETAIL_OPEN | headcount, remount_standard, escort_mount_allocation |
| ANIMAL-CLASS-CATTLE | CATTLE | DAIRY | OPEN | HH-1700-STABLE | STRUCTURE_OPEN_DETAIL | whether_cattle_are_kept, headcount, dairy_route |
| ANIMAL-CLASS-SHEEP | SHEEP | WOOL | OPEN | HH-1700-STABLE | STRUCTURE_OPEN_DETAIL | whether_sheep_are_kept, headcount, wool_route |
| ANIMAL-CLASS-PIG | PIG | MEAT | OPEN | HH-1700-STABLE | STRUCTURE_OPEN_DETAIL | whether_pigs_are_kept, headcount |
| ANIMAL-CLASS-POULTRY | POULTRY | EGGS | OPEN | HH-1700-PROVISIONER | STRUCTURE_OPEN_DETAIL | whether_poultry_are_kept, headcount |
| ANIMAL-CLASS-WORKING-DOG | WORKING_DOG | GUARD | OPEN | HH-1700-CAPTAIN | STRUCTURE_OPEN_DETAIL | whether_dogs_are_kept, post_assignment |

Related recovered records:

| Record | State | What it holds that Lane A must respect |
|---|---|---|
| `THY-TRANS-WILDLIFE-607` (`thylora_world_earth_transmission_packets`) | DESIGN_ONLY | World department "Wildlife Refuge & Return" (working name; EdereAirah name OPEN). Keeper, habitat ecologist and release lead are OPEN. Equation: `Release readiness = health pass × behavior pass × habitat pass × legal pass`. Species OPEN. **Lane A links to this record and does not duplicate its equation** (§12.3). |
| `THY-PLANT-NAME-CANDIDATES-596` | PROPOSED, none canon | Naming precedent: 12 candidates; shortlist Greyneedle, Stonewarm, Veslusk. Guards: no medical-claim names, no invented Indigenous-sounding names, "EdereAirah name leads; Earth plant is comparison only". Note: "NO canonical EdereAirah plant name exists; no plant root lane in THY-WORLD-NAMING-LEXICON-001." |
| Planetary physics | **NONE FOUND** | No gravity, atmosphere, day length, star or biome record exists in `thylora_world_term_registry` (8), `thylora_world_design_records` (88) or `thylora_world_entities` (93). |
| Lane B file | DESIGN | Its "No animal in frame" row stays QUEUED until Lane A clears a species. Lane A's candidate for that is S14 THESKIT (§20, OD-06). |

Records **not** read, and not guessed: `thylora_living_world_records` (11 rows) and `LIVING_WORLD_ATLAS` personnel were not read in full. `OCEAN_SYSTEMS_AND_INFRASTRUCTURE` department details were not read. Either may already hold ecology material, so it must be read before applying §22 (see §19, L-01).

---

## 3 · Deliverable 2: Gap analysis

| Gap ID | Gap | Why it matters | Resolution in this file | Residual state |
|---|---|---|---|---|
| G-01 | The 7 recovered rows are **1700s estate domesticates** at one estate (ER-CASTLE-ROYAL-001). They are not native fauna. | The Chairman asked for native animal life. Estate rows cannot stand in for it. | A native biome and 14 native species are PROPOSED (§6, §9). | APPROVAL_REQUIRED (CD-08…CD-23) |
| G-02 | The estate rows use **Earth species classes** (HORSE, CATTLE…). No record says whether EdereAirah horses are Earth horses or native analogues. | This is a DO NOT risk ("merge Earth and EdereAirah as though they are the same place"). | Raised as a canon decision (CD-24). Not guessed. | APPROVAL_REQUIRED |
| G-03 | Every `headcount` is null. | No feed chain, housing or staffing can be sized without it. | Not invented. A gap note is proposed on each row (§22 P-01…P-07). | DEFERRED_WITH_DEFINED_DEPENDENCY: estate size canon |
| G-04 | Every `care_cycle` is OPEN. | Animal care cannot run without one. | A **care-cycle template** is designed (§12.1). It can be applied to estate rows once CD-24 is decided. | QUEUED_WITH_DEPENDENCY |
| G-05 | `farrier_or_vet_provision` is OPEN. No world animal-health institution exists. | Care systems need a clinical tier. | A care-tier structure is proposed (§12.2). No clinicians are named: UNNAMED SLOTs only. | APPROVAL_REQUIRED |
| G-06 | `retirement_rule` is OPEN. | This is a welfare question and a story question. | A retirement-rule template is proposed (§12.1, field CC-09). | APPROVAL_REQUIRED |
| G-07 | `feed_chain` is OPEN. | Feed ties to the food provenance registries. | Energy-based feed sizing is shown with E7 (Kleiber). It links to `thylora_food_provenance_chain` once headcounts exist. | QUEUED_WITH_DEPENDENCY |
| G-08 | No **planetary physics canon** exists (gravity, atmosphere, star, day, year). | No large-animal design can be checked without it. | PROPOSED values with derivations (§4, E1–E4). Chairman decisions CD-01…CD-07. | APPROVAL_REQUIRED |
| G-09 | No **biome** record exists. | The directive requires "FIRST: define one biome". | BIOME-P001 is PROPOSED (§6). | APPROVAL_REQUIRED (CD-08) |
| G-10 | No **fauna naming root lane** exists (plants have none either). | Names would otherwise be ad hoc. | 20-morpheme fauna root set PROPOSED (§8). | APPROVAL_REQUIRED (CD-09) |
| G-11 | `THY-TRANS-WILDLIFE-607` has species OPEN and staff OPEN. | Its transmission cannot proceed without a species. | Candidate species mapped to its release equation (§12.3). Staff stay UNNAMED SLOTs. | APPROVAL_REQUIRED (OD-01) |
| G-12 | No native fauna registry table exists (none among the recovered table names). | Species cannot be stored or read back. | A new table name is proposed: `thylora_world_fauna_registry` (§22). | APPROVAL_REQUIRED + backend write session |
| G-13 | Disease ecology: none in canon. | Care and story both touch disease. The directive forbids grouping diseases, and diagnoses must not be invented. | **Not invented.** Marked UNKNOWN in every card. | UNKNOWN |
| G-14 | No settlement–wildlife interface canon (roads, fences, farms, fishing, shipping near the biome). | Threat fields depend on it. | Threats that depend on human infrastructure are marked `(OPEN: depends on settlement canon)`. | UNKNOWN |

---

## 4 · Planetary physics proposal (PROPOSED, needs Chairman decisions)

**Canon discipline.** No EdereAirah value for gravity, atmosphere, star, day length or year exists in the backend (recovered §3). The values below are **PROPOSED**. They were chosen so that the Chairman's requested animals, including giraffe-like, elephant-scale and whale-scale animals, are **physically viable**, and so that the numbers stay close enough to Earth for Earth science to transfer with stated corrections.

| Param | PROPOSED value | Earth reference | Why this value | Decision |
|---|---|---|---|---|
| Surface gravity g_E | **8.80 m/s²** (0.897 g⊕) (28.9 ft/s²) | 9.81 m/s² (32.2 ft/s²) | ~10% lower gravity cuts bone stress and heart-height pressure for the same body. That raises the isometric land-mass ceiling by ×1.385 (E5). It stays high enough that atmosphere retention is not in question (escape speed 10.36 km/s, E1). | CD-01 |
| Planet radius R_E | 6,100 km (3,790 mi) | 6,371 km | Gives g = 8.80 m/s² with rocky density 5,160 kg/m³ (E1) | CD-01 |
| Planet mass M_P | 4.906 × 10²⁴ kg (0.822 M⊕) | 5.972 × 10²⁴ kg | Derived from g and R (E1) | CD-01 |
| Surface pressure P₀ | **111.5 kPa** (1.10 atm; 16.17 psi) | 101.3 kPa | Denser air (ρ = 1.309 kg/m³ at 24 °C) lowers hover power (E11) and soaring speed (E13) | CD-02 |
| O₂ mole fraction | **23.0 %** → pO₂ = 25.6 kPa | 20.95 % → 21.2 kPa | Supports ~24% larger maximum insect linear size (E10). Kept below the ~25–30% range where fire becomes extreme (EARTH-FACT, Belcher et al. 2010). Fire is still a real constraint (§6.12). | CD-02 |
| CO₂ | 500 ppm (pCO₂ = 55.8 Pa) | ~420 ppm (42.6 Pa) | Mild fertilization. C3 and C4-analogue grass mix plausible. | CD-02 |
| Ar / N₂ | 0.93 % / 76.02 % | 0.93 / 78.08 | Remainder | CD-02 |
| Mean molar mass of dry air | 0.02900 kg/mol | 0.02897 | Computed from the composition | CD-02 |
| Star | **G-type main sequence**, T_eff 5,650 K, L = 0.86 L☉, M = 0.95 M☉, R ≈ 0.97 R☉ | Sun 5,772 K | Solar-like. Peak emission 513 nm (E4). Chlorophyll-analogue plants plausible. | CD-03 |
| Orbital distance | 0.938 AU | 1.000 AU | Gives instellation 1,330 W/m² (0.977 of Earth) | CD-05 |
| Day length | **26.0 h** | 24 h | A slightly longer day widens the day/night temperature swing a little. That gives a sleep/torpor rationale (S05). | CD-04 |
| Year | **340.5 Earth days = 314 local days** | 365.25 | Derived by Kepler's third law (E4) | CD-05 |
| Obliquity | 21° | 23.44° | Seasons are driven mostly by the rainfall belt at the biome's latitude | CD-05 |
| Moon | One moon, giving ~1.5 m (4.9 ft) spring tidal range in the bay | Earth Moon | Needed for the intertidal estuary zone Z6 as written. Without a moon, solar tides alone would give roughly 0.3–0.5 m (ESTIMATE: Earth solar tide ≈ 46% of lunar), and Z6 would be re-derived. | CD-06 |

### 4.1 · Re-derivation dependency map (if the Chairman sets different values)

If the Chairman sets different values, **the species and systems below must be re-derived**. This is a hard dependency, not a style note.

| If this changes | Re-derive | Equations |
|---|---|---|
| g (CD-01) | **S06 VASKRELL** (leap range), **S07 DROVATH**, **S08 VELLSTRAN** (heart pressure, fall), **S09 BRUSKOND** (bone, viability), **S10 HARLREN** (limb stress), **S11 SORRHALD** (limb, sprint), **S12 MURRETH** (stall speed, turn radius), **S05 VIRRESK** (hover power), **S13 HOLVOND** (pressure-depth, buoyancy), **S03 PLENNIT** (dance references gravity: qualitative only), **S14 THESKIT** (minor), tree height (WL-1), scale height and lapse rate (Z4/Z5 climate) | E1, E2, E3, E5, E6, E9, E11, E12, E13, E14 |
| Pressure / O₂ (CD-02) | **S02 SORRVIRR**, **S03 PLENNIT**, **S04 PLENNREN**, **S01 DROVESK** (O₂ supply), **S05 VIRRESK**, **S12 MURRETH** (air density), the fire regime and therefore **WL-2, WL-6, S04 roost groves, the whole savanna–forest boundary** | E2, E10, E11, E13 |
| Star (CD-03) | Plant pigment and colour (§6.8), light budget (§6.9), temperature (§6.3), and so every species' visual-appearance field | E4 |
| Day length (CD-04) | Every per-day food figure (E7), sleep fields, gestation in local days, twelfth length | E7 |
| Year / obliquity (CD-05) | Migration calendar (§11), every reproduction timing, lifespans in local years | E4, E17 |
| Moon (CD-06) | Z6 estuary, WL-8 mangrove-analogue, S13 bay entry timing | — |

---

## 5 · Math register (MATH RULE applied to every equation)

Every equation lists its symbols, subscripts, operators, units, domain, threshold, assumptions, failure conditions, class, and one worked example. Symbols common to all equations:

| Symbol | Meaning | Unit |
|---|---|---|
| g | gravitational acceleration at the surface | m/s² |
| subscript `E` | EdereAirah (PROPOSED values) | — |
| subscript `⊕` | Earth | — |
| M | body mass (or planet mass where stated) | kg |
| ρ | density (subscript says which substance) | kg/m³ |
| `×` or `·` | multiplication | — |
| `/` | division | — |
| `^` | exponent (power) | — |
| `√` | square root | — |
| `=` | equality or definition | — |
| `≈` | approximately equal | — |
| `∝` | proportional to | — |
| `exp(x)` | e raised to x, e = 2.71828… | — |

### E1 · Surface gravity from planet mass and radius

- **Class:** PHYSICAL LAW (Newtonian gravitation, spherical body)
- **Equation:** `g_E = G · M_P / R_E²`; escape speed `v_esc = √(2 · g_E · R_E)`; bulk density `ρ_P = M_P / ((4/3) · π · R_E³)`
- **Symbols:** G = gravitational constant 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻²; M_P = planet mass (kg); R_E = planet radius (m); v_esc = escape speed (m/s); ρ_P = bulk density (kg/m³); π = 3.14159…; subscript P = planet.
- **Operators:** `·` multiply; `/` divide; `²`, `³` powers; `√` square root.
- **Domain:** spherical, non-rotating approximation. Rotation at a 26 h day reduces effective g at the equator by ω²R = (2π/93,600 s)² × 6.1 × 10⁶ m = 0.0275 m/s² (0.3%), which is ignored here.
- **Threshold:** v_esc must be well above ~6× the thermal speed of O₂/N₂ for atmosphere retention over geologic time. At 300 K the O₂ rms speed is ≈ 0.48 km/s, and 6 × 0.48 = 2.9 km/s ≪ 10.36 km/s → **PASS**.
- **Assumptions:** uniform-density sphere for the density check. Rocky composition.
- **Failure conditions:** if the Chairman sets R and M independently, g follows from them and all g-dependent species in §4.1 must be re-derived.
- **Worked example:** R_E = 6.1 × 10⁶ m, target g_E = 8.80 → M_P = g·R²/G = 8.80 × 3.721 × 10¹³ / 6.674 × 10⁻¹¹ = **4.906 × 10²⁴ kg**. Check: 6.674 × 10⁻¹¹ × 4.906 × 10²⁴ / 3.721 × 10¹³ = 8.80 m/s² ✓. v_esc = √(2 × 8.80 × 6.1 × 10⁶) = √(1.0736 × 10⁸) = **10,361 m/s**. ρ_P = 4.906 × 10²⁴ / (4.18879 × 2.2698 × 10²⁰) = **5,160 kg/m³** (Earth 5,514).

### E2 · Barometric scale height and pressure with altitude

- **Class:** PHYSICAL LAW (hydrostatic balance plus ideal gas, isothermal approximation)
- **Equation:** `H = R_u · T / (M_air · g_E)`; `P(z) = P₀ · exp(−z / H)`; `pO₂(z) = x_O₂ · P(z)`; air density `ρ_air = P · M_air / (R_u · T)`
- **Symbols:** H = scale height (m); R_u = universal gas constant 8.314 J mol⁻¹ K⁻¹; T = absolute temperature (K); M_air = molar mass of air 0.02900 kg/mol; P(z) = pressure at altitude z (Pa); P₀ = surface (sea-level) pressure 111,500 Pa; z = altitude above sea level (m); x_O₂ = O₂ mole fraction 0.230 (unitless); pO₂ = O₂ partial pressure (Pa); ρ_air = air density (kg/m³); subscript u = universal, 0 = sea level.
- **Operators:** `·` multiply; `/` divide; `exp` exponential; `−` negative sign.
- **Domain:** 0–3,000 m (0–9,800 ft), where the isothermal approximation is within a few percent.
- **Threshold used:** pO₂ at biome elevations must stay ≥ 21 kPa, so that animals designed for the lowland remain viable in the uplands.
- **Assumptions:** T = 288 K for H. Dry air. Composition constant with height.
- **Failure conditions:** strong inversions or very high elevations (> 5 km), where lapse effects dominate.
- **Worked example:** H = 8.314 × 288 / (0.02900 × 8.80) = 2,394.4 / 0.2552 = **9,382 m** (Earth ≈ 8,425 m). At z = 1,500 m (Z4 upland forest): P = 111.5 × exp(−1,500/9,382) = 111.5 × 0.8522 = **95.0 kPa**, pO₂ = 0.230 × 95.0 = **21.9 kPa**, about Earth sea level. Sea-level air density at 297 K (24 °C): ρ = 111,500 × 0.02900 / (8.314 × 297) = 3,233.5 / 2,469.3 = **1.309 kg/m³** (Earth 1.184 at 25 °C).

### E3 · Dry adiabatic lapse rate and working environmental lapse rate

- **Class:** PHYSICAL LAW (Γ_d) + HEURISTIC (Γ_env scaling)
- **Equation:** `Γ_d = g_E / c_p`; `Γ_env ≈ 6.5 K/km × (g_E / g⊕)`; `T(z₂) = T(z₁) − Γ_env · (z₂ − z₁)`
- **Symbols:** Γ_d = dry adiabatic lapse rate (K/m); c_p = specific heat of air at constant pressure 1,005 J kg⁻¹ K⁻¹; Γ_env = working environmental lapse rate (K/km); T(z) = air temperature at altitude z (°C or K; differences are equal); z₁, z₂ = altitudes (km); subscript d = dry, env = environment.
- **Operators:** `/` divide; `×` multiply; `−` subtract.
- **Domain:** lower troposphere of the biome (0–2,100 m).
- **Threshold:** used only to set zone temperatures (§6.3), not for weather prediction.
- **Assumptions:** the Earth mean lapse (6.5 K/km) scales with g like Γ_d. This is a HEURISTIC, because moist lapse also depends on humidity.
- **Failure conditions:** humid convective regimes and inversions. Real values range from 4 to 9.8 K/km on Earth.
- **Worked example:** Γ_d = 8.80 / 1,005 = **0.00876 K/m = 8.76 K/km** (Earth 9.76). Γ_env = 6.5 × 0.897 = **5.83 K/km**. Savanna Z2 at 500 m has mean 25.0 °C. Upland forest Z4 at 1,300 m: 25.0 − 5.83 × 0.8 = **20.3 °C** (68.5 °F).

### E4 · Star peak wavelength, instellation, and year length

- **Class:** PHYSICAL LAW (Wien displacement; inverse-square flux; Kepler's third law in solar units)
- **Equation:** `λ_max = b / T_eff`; `S = S⊕ · (L/L☉) / d²`; `P_yr = √(a³ / (M_*/M☉))`
- **Symbols:** λ_max = peak emission wavelength (m); b = Wien constant 2.898 × 10⁻³ m·K; T_eff = stellar effective temperature (K); S = instellation at the planet (W/m²); S⊕ = 1,361 W/m²; L/L☉ = stellar luminosity in solar units (unitless); d = orbital distance (AU); P_yr = orbital period (Earth years); a = semi-major axis (AU; a = d for a circular orbit); M_*/M☉ = stellar mass in solar units; subscripts ☉ = Sun, * = EdereAirah's star.
- **Operators:** `/` divide; `·` multiply; `²`, `³` powers; `√` root.
- **Domain:** main-sequence star, near-circular orbit.
- **Threshold:** S within ±5% of Earth's (keeps Earth-like water and temperatures) → 0.977 **PASS**.
- **Assumptions:** circular orbit. Blackbody approximation for the peak.
- **Failure conditions:** high eccentricity, or a K or M dwarf (which would change light spectrum, tidal locking risk and plant pigments) → re-derive §6.8–§6.9.
- **Worked example:** λ_max = 2.898 × 10⁻³ / 5,650 = **513 nm** (Sun 502 nm). d = √(0.86 × 1,361 / 1,330) = √0.8801 = **0.938 AU**. S = 1,361 × 0.86 / 0.8801 = **1,330 W/m²**. P_yr = √(0.938³ / 0.95) = √(0.8256 / 0.95) = √0.8690 = **0.932 Earth yr = 340.5 Earth days** = 8,172 h ÷ 26 h = **314 local days**.

### E5 · Square–cube law and isometric land-mass ceiling (the elephant viability check)

- **Class:** PHYSICAL LAW (geometry) applied as ENGINEERING CONSTRAINT
- **Equation:** under isometric scaling by linear factor k: `A ∝ k²`, `V ∝ k³`, `M ∝ k³`, so support stress `σ ∝ M·g/A ∝ g·M^(1/3)`. Setting σ = σ_allow gives `M_max ∝ (σ_allow/g)³`, so `M_max,E / M_max,⊕ = (g⊕ / g_E)³`
- **Symbols:** k = linear scale factor (unitless); A = cross-sectional area of load-bearing tissue (m²); V = volume (m³); M = body mass (kg); σ = stress (Pa); σ_allow = allowable tissue stress (Pa); M_max = isometric mass ceiling (kg); subscripts E, ⊕ as above.
- **Operators:** `∝` proportional to; `/` divide; `^` power; `³` cube.
- **Domain:** terrestrial vertebrates with bone-like skeletons of equal material strength.
- **Threshold:** a proposed land species passes when M_species ≤ 0.5 × M_max,E. The factor 0.5 is a HEURISTIC margin, because real animals change posture and limb proportions rather than scaling isometrically.
- **Assumptions:** same tissue strength on both worlds. Isometry. Real mammals scale bone area closer to M^0.72–0.80 and straighten their limbs (EARTH-FACT, Biewener 1989), which is why the real ceiling is higher than pure isometry predicts.
- **Failure conditions:** if EdereAirah bone chemistry differs (UNKNOWN) or g changes → re-derive.
- **Worked example:** k = 2 → area ×4, mass ×8, stress ×2. Ceiling ratio: (9.81 / 8.80)³ = 1.1148³ = **1.385**. The largest Earth land mammal, *Paraceratherium*, is estimated at ~15–20 t (EARTH-FACT; published estimates vary). The equivalent EdereAirah ceiling is **20.8–27.7 t**. **S09 BRUSKOND at 5.2 t = 19–25% of the ceiling → PASS (well under 50%)**.

### E6 · Limb bone stress and safety factor

- **Class:** ENGINEERING CONSTRAINT (with HEURISTIC bending factor)
- **Equation:** `σ_peak = β · φ · M · g_E / A_c`; `SF = σ_fail / σ_peak`
- **Symbols:** σ_peak = peak stress in the principal limb bone (Pa); β = bending amplification (unitless, ≥ 1; about 2–4 for columnar limbs, 4–10 for crouched limbs; HEURISTIC); φ = peak force on one limb as a multiple of body weight (unitless; ~0.6–0.7 for a slow walk in a heavy quadruped, ~1.5–2.5 for a gallop; ESTIMATE from Earth force-plate literature); M = mass (kg); A_c = cortical cross-sectional area at midshaft (m²); SF = safety factor (unitless); σ_fail = bone failure stress, taken as 150 MPa (ESTIMATE, low end of the cortical-bone compressive and bending range 150–200 MPa); subscript c = cortical.
- **Operators:** `·` multiply; `/` divide.
- **Domain:** peak locomotor loads of adult quadrupeds.
- **Threshold:** **SF ≥ 2** passes. Earth mammals typically run at SF 2–4 at peak locomotor loads (EARTH-FACT, Biewener 1989/1990).
- **Assumptions:** A_c values are ESTIMATES scaled from comparable Earth bones. Uniform loading.
- **Failure conditions:** SF < 2 → the species must change posture, thicken bones, or lose mass.
- **Worked example 1 (S09 BRUSKOND, walk):** β = 3, φ = 0.65, M = 5,200 kg, A_c = 0.0080 m² (80 cm²; 12.4 in²). σ = 3 × 0.65 × 5,200 × 8.80 / 0.0080 = 3 × 29,744 / 0.0080 = **11.2 MPa** → SF = 150/11.2 = **13.4 PASS** (Earth same animal: 12.4 MPa, SF 12.1).
- **Worked example 2 (S10 HARLREN, gallop):** β = 4, φ = 2.0, M = 190 kg, A_c = 3.5 × 10⁻⁴ m² (3.5 cm²; 0.54 in²). σ = 4 × 2.0 × 190 × 8.80 / 3.5 × 10⁻⁴ = **38.2 MPa** → SF = **3.9 PASS** (Earth 42.6 MPa, SF 3.5).

### E7 · Kleiber metabolic rate → daily energy → food intake

- **Class:** EMPIRICAL MODEL
- **Equation:** `B = B₀ · M^0.75`; `E_day = f_FMR · B · t_day`; `I = E_day / e_food`
- **Symbols:** B = basal metabolic rate (W); B₀ = Kleiber constant **3.39 W·kg⁻⁰·⁷⁵** (= 70 kcal/day per kg^0.75: 70 × 4,184 J / 86,400 s = 3.39 W); M = body mass (kg); 0.75 = allometric exponent (unitless); E_day = energy needed per local day (J); f_FMR = field metabolic multiple of basal (unitless; ~2.0–3.0 for free-living mammals, ESTIMATE); t_day = local day length 93,600 s (26 h); I = food intake per local day (kg); e_food = usable (digestible or metabolizable) energy per kg of food (J/kg; ESTIMATE per food type); subscript 0 = reference constant, FMR = field metabolic rate.
- **Operators:** `·` multiply; `^` power; `/` divide.
- **Domain:** placental-mammal-like endotherms from about 0.01 to 40,000 kg. Birds and "bird-like" animals have higher constants, so for S05 and S12 the values are indicative only.
- **Threshold:** intake must fall inside the Earth analogue's observed range (for example 1–1.5% of body mass per day as dry matter for elephant-scale browsers) or the design is flagged.
- **Assumptions:** EdereAirah endotherms follow Earth-like cellular energetics. This is UNKNOWN, and the equation is a design constraint, not a claim.
- **Failure conditions:** ectotherms (use a lower constant); diving or migrating bouts (use f_FMR 3+); juveniles (higher).
- **Worked example (S09 BRUSKOND):** M^0.75 = 5,200^0.75 = e^(0.75 × 8.556) = e^6.417 = 612.2 → B = 3.39 × 612.2 = **2,075 W**. f_FMR = 2.5 → 5,188 W. E_day = 5,188 × 93,600 = **485.6 MJ/local day**. e_food (browse, dry matter) = 8 MJ/kg (ESTIMATE: gross ≈ 18 MJ/kg × ~45% digestibility) → I = **60.7 kg DM/local day (133.8 lb)** = 1.17% of body mass. Earth elephants eat ~1–1.5% of body mass as dry matter → **PASS**.
- **Species quick table (B only):** VIRRESK 0.006 kg → 0.073 W (indicative) · VASKRELL 7.5 kg → 15.4 W · MURRETH 8.5 kg → 16.9 W (indicative) · THESKIT 9 kg → 17.6 W · SORRHALD 165 kg → 156.1 W · HARLREN / DROVATH 190 kg → 173.5 W · VELLSTRAN 1,050 kg → 625.3 W · BRUSKOND 5,200 kg → 2,076 W · HOLVOND 38,000 kg → 9,226 W.

### E8 · Skin area and heat-dissipation load (why big animals need heat flaps)

- **Class:** EMPIRICAL MODEL (Meeh relation) + energy balance
- **Equation:** `A_skin = k_M · M^(2/3)`; `q = f_FMR · B / A_skin`
- **Symbols:** A_skin = body surface area (m²); k_M = Meeh coefficient ≈ 0.10 m²·kg^(−2/3) for mammals (EMPIRICAL; equals 10 cm²·g^(−2/3)); M = mass (kg); q = mean metabolic heat flux that must leave through the skin (W/m²); B, f_FMR as in E7.
- **Operators:** `·` multiply; `^` power; `/` divide.
- **Domain:** terrestrial mammal-like endotherms.
- **Threshold:** when q > ~150 W/m² during daytime heat above 30 °C (86 °F), the design must include a dedicated heat-loss organ (large thin flaps, wallowing, or nocturnal activity). This threshold is a HEURISTIC.
- **Assumptions:** smooth-body approximation. Ignores solar load and evaporation.
- **Failure conditions:** strongly non-compact shapes (VELLSTRAN's long neck and legs raise real area above the Meeh estimate, which helps it).
- **Worked example:** BRUSKOND A_skin = 0.10 × 5,200^(2/3) = 0.10 × 300.1 = **30.0 m² (323 ft²)**. q = 5,188 / 30.0 = **173 W/m²** → above threshold → **thin vascular heat flaps (1.1 m² each) plus river-mud wallowing are required** (built into S09). THESKIT: A = 0.10 × 9^(2/3) = 0.433 m². q = 2 × 17.6 / 0.433 = 81 W/m² → no special organ needed.

### E9 · Hydrostatic head ρ·g·h (giraffe heart height and tree xylem)

- **Class:** PHYSICAL LAW (hydrostatics)
- **Equation:** `ΔP = ρ_f · g_E · h`; `MAP_heart = P_brain + ΔP`
- **Symbols:** ΔP = pressure difference across a vertical fluid column (Pa; 1 mmHg = 133.322 Pa); ρ_f = fluid density (blood 1,060 kg/m³; water 1,000 kg/m³); h = vertical height of the column (m); MAP_heart = mean arterial pressure required at the heart (mmHg); P_brain = mean arterial pressure needed at brain level (≈ 90 mmHg, ESTIMATE from mammalian values); subscript f = fluid.
- **Operators:** `·` multiply; `+` add.
- **Domain:** static column (standing, head up). Dynamic flow losses are ignored.
- **Threshold:** MAP_heart ≤ **300 mmHg**. Earth giraffes are measured at roughly 200–300 mmHg at heart level (EARTH-FACT, Hargens et al. 1987 and later work). Beyond that, ventricular wall stress (Laplace) becomes the binding constraint. HEURISTIC upper bound.
- **Assumptions:** P_brain ≈ 90 mmHg. A rete-like pressure buffer protects the brain when the head is lowered (as in giraffes).
- **Failure conditions:** heart-to-head height h > ~3.2 m at g_E (MAP > 300 mmHg) → the species would need a different circulatory design.
- **Worked example 1 (S08 VELLSTRAN):** heart-to-head h = 2.2 m (7.2 ft). ΔP = 1,060 × 8.80 × 2.2 = **20,522 Pa = 153.9 mmHg** → MAP_heart = 90 + 153.9 = **244 mmHg → PASS**. On Earth the same animal would need 90 + 1,060 × 9.81 × 2.2 / 133.322 = 90 + 171.6 = 261.6 mmHg. Maximum h at the 300 mmHg bound: h = (300 − 90) × 133.322 / (1,060 × 8.80) = **3.00 m** (9.8 ft).
- **Worked example 2 (WL-1 xylem, 45 m tree):** gravitational water-potential component = 1,000 × 8.80 × 45 = **0.396 MPa** (Earth 0.441 MPa). HEURISTIC: scaling only the gravity term of Earth's ~122–130 m hydraulic height limit (EARTH-FACT, Koch et al. 2004) gives an upper bound of ~145 m. WL-1 at 45 m is far inside it.

### E10 · Insect maximum linear size vs atmospheric O₂

- **Class:** HEURISTIC (diffusion-limited tracheal supply; the direction of the effect is supported by EARTH-FACT, Harrison, Kaiser & VandenBrooks 2010, Proc. R. Soc. B)
- **Equation:** `L_max,E / L_max,⊕ = (pO₂,E − pO₂,crit) / (pO₂,⊕ − pO₂,crit)`
- **Symbols:** L_max = maximum sustainable linear body dimension of a tracheate insect (m); pO₂ = ambient O₂ partial pressure (kPa); pO₂,crit = minimum O₂ partial pressure needed at the tissue end of the tracheae (kPa; ≈ 3 kPa, ESTIMATE); subscripts E, ⊕, crit = critical.
- **Operators:** `/` divide; `−` subtract.
- **Domain:** tracheate arthropods whose limit is set by diffusion distance. Not valid for animals with lungs and blood pigments.
- **Threshold:** a proposed insect's key dimension ≤ L_max,E.
- **Assumptions:** Fick diffusion (flux ∝ ΔpO₂ / L). Fixed metabolic demand per tissue volume. Same tracheal architecture.
- **Failure conditions:** active ventilation or other O₂ carriers (UNKNOWN on EdereAirah); temperature changes in demand; predation or other ecological limits that bind before O₂ does.
- **Worked example:** (25.6 − 3.0) / (21.2 − 3.0) = 22.6 / 18.2 = **1.24**. Earth's largest living odonate wingspan is ~19 cm (*Megaloprepus caerulatus*, EARTH-FACT) → ceiling ≈ **23.6 cm** at sea level. In the Z4 uplands (pO₂ 21.9 kPa): (18.9 / 18.2) = 1.04 → ≈ 19.7 cm. **S02 SORRVIRR at 17 cm → PASS in the lowland**. It is rare in the uplands, which matches its lowland habitat.

### E11 · Hovering induced power (hummingbird analogue)

- **Class:** PHYSICAL LAW (actuator-disc momentum theory, idealized) + EMPIRICAL efficiencies
- **Equation:** `P_ind = √( W³ / (2 · ρ_air · A_d) )`, with `W = M · g_E` and `A_d = π · (b/2)²`; `P_met ≈ P_ind / (η_a · η_m)`
- **Symbols:** P_ind = ideal induced power to hover (W); W = body weight (N); ρ_air = air density (kg/m³); A_d = area swept by the wings, the "disc" (m²); b = wingspan (m); P_met = metabolic power while hovering (W); η_a = aerodynamic figure of merit (unitless; ~0.6, ESTIMATE); η_m = muscle efficiency (unitless; ~0.10, ESTIMATE); subscripts ind = induced, d = disc, met = metabolic, a = aerodynamic, m = muscle.
- **Operators:** `√` root; `³` cube; `/` divide; `·` multiply.
- **Domain:** sustained hovering of small fliers (1–20 g).
- **Threshold:** P_met must be supportable by nectar intake during foraging. Design check: sugar needed per hour of hovering ≤ 0.5 g.
- **Assumptions:** uniform induced flow. Profile power folded into the efficiencies.
- **Failure conditions:** gusty conditions; very high altitudes (lower ρ_air raises P_ind).
- **Worked example (S05 VIRRESK):** M = 0.006 kg, b = 0.12 m → A_d = π × 0.06² = 0.01131 m². W = 0.006 × 8.80 = 0.0528 N. P_ind = √(0.0528³ / (2 × 1.309 × 0.01131)) = √(1.472 × 10⁻⁴ / 0.02961) = √(4.971 × 10⁻³) = **0.0705 W**. The same animal on Earth (ρ 1.184, g 9.81): **0.0873 W**, so EdereAirah hovering costs **19% less**. P_met = 0.0705 / (0.6 × 0.10) = **1.18 W**. Sugar (sucrose, 16.5 kJ/g): 1.18 × 3,600 / 16,500 = **0.26 g per hour of hovering → PASS**.

### E12 · Leap range (arboreal primate analogue)

- **Class:** PHYSICAL LAW (projectile motion, drag ignored)
- **Equation:** `R_leap = v₀² · sin(2θ) / g_E`
- **Symbols:** R_leap = horizontal leap distance on level take-off and landing (m); v₀ = take-off speed (m/s); θ = take-off angle above horizontal (degrees); sin = sine function; subscript 0 = initial.
- **Operators:** `²` square; `·` multiply; `/` divide; `sin` trigonometric sine.
- **Domain:** leaps of 1–8 m where drag is small.
- **Threshold:** a typical canopy gap in Z3 gallery forest (~3 m, ESTIMATE) must be crossable at sub-maximal effort.
- **Assumptions:** level take-off and landing. No drag. No lift from a gliding membrane.
- **Failure conditions:** strong downward landing (fall height adds range but raises landing impact).
- **Worked example (S06 VASKRELL):** v₀ = 5.5 m/s, θ = 35° → sin 70° = 0.9397. R = 30.25 × 0.9397 / 8.80 = **3.23 m (10.6 ft)**. Earth: 2.90 m. That is **11.5% more** range for the same muscle → **PASS**.

### E13 · Soaring: minimum flight speed and circling radius (scavenger)

- **Class:** PHYSICAL LAW (lift equation; circular-motion kinematics) as ENGINEERING CONSTRAINT
- **Equation:** `V_min = √( 2 · W / (ρ_air · S · C_L,max) )`; `r = V_c² / (g_E · tan φ)`, with circling speed `V_c = 1.25 · V_min`
- **Symbols:** V_min = straight-and-level stall speed (m/s); W = weight M·g_E (N); S = wing area (m²); C_L,max = maximum lift coefficient (unitless; ~1.6, ESTIMATE for soaring birds); r = circling radius (m); V_c = circling speed (m/s); φ = bank angle (degrees); tan = tangent; subscripts min = minimum, c = circling, L = lift.
- **Operators:** `√`, `·`, `/`, `²`, `tan`.
- **Domain:** thermal soaring, bank 20–45°.
- **Threshold:** r must fit inside typical thermal cores (radius ~50–100 m on Earth, EARTH-FACT order of magnitude). The banked stall speed V_min/√(cos φ) must be < V_c.
- **Assumptions:** steady coordinated turn.
- **Failure conditions:** weak or narrow thermals; wet plumage (UNKNOWN analogue).
- **Worked example (S12 MURRETH):** M = 8.5 kg → W = 74.8 N. S = 1.00 m² (10.8 ft²). V_min = √(2 × 74.8 / (1.309 × 1.00 × 1.6)) = √71.43 = **8.45 m/s** (Earth 9.38). V_c = 10.56 m/s. Banked stall at 30° = 8.45 / √0.866 = 9.08 < 10.56 ✓. r = 10.56² / (8.80 × tan 30°) = 111.5 / 5.081 = **21.9 m (71.9 ft)** (Earth 24.3 m) → **PASS**. It can work narrower thermal cores than an Earth vulture of the same build.

### E14 · Buoyancy and pressure with depth (whale analogue)

- **Class:** PHYSICAL LAW (Archimedes; hydrostatics; Boyle's law)
- **Equation:** `F_net = (ρ_w − ρ_b) · g_E · V_b`; `P(d) = P₀ + ρ_w · g_E · d`; `V_L(d) = V_L0 · P₀ / P(d)`; buoyancy lost by lung compression `ΔF = ρ_w · g_E · (V_L0 − V_L(d))`
- **Symbols:** F_net = net vertical force, positive = upward (N); ρ_w = seawater density 1,025 kg/m³; ρ_b = whole-body density at the surface, lungs full (kg/m³); V_b = body volume (m³); P(d) = absolute pressure at depth d (Pa); P₀ = surface air pressure 111,500 Pa; d = depth (m); V_L0 = lung air volume at the surface (m³); V_L(d) = lung air volume at depth (m³); ΔF = buoyancy lost (N); subscripts w = water, b = body, L = lung, 0 = surface.
- **Operators:** `−`, `+`, `·`, `/`.
- **Domain:** 0–300 m (0–984 ft). Tissue compressibility ignored.
- **Threshold:** the animal must be slightly positive at the surface (so it can rest and breathe) and negative below a shallow depth (so it can glide down cheaply).
- **Assumptions:** isothermal lung gas; fixed V_L0.
- **Failure conditions:** exhalation before a dive (whales vary this); fat-content changes across the season change ρ_b.
- **Worked example (S13 HOLVOND):** M = 38,000 kg, ρ_b = 1,020 → V_b = **37.25 m³**. F_net(surface) = (1,025 − 1,020) × 8.80 × 37.25 = **+1,639 N**. At 50 m: P = 111,500 + 1,025 × 8.80 × 50 = **562,500 Pa** (Earth: 604,100 Pa). The pressure gradient is 9.02 kPa/m vs 10.06 kPa/m on Earth, **10.3% less**, so the same depth is gentler on the lungs. With V_L0 = 1.5 m³ (ESTIMATE): V_L(50) = 1.5 × 111,500 / 562,500 = 0.297 m³ → ΔF = 1,025 × 8.80 × 1.203 = 10,851 N → F_net = 1,639 − 10,851 = **−9,212 N (sinks: passive glide)**. Neutral depth ≈ **1.7 m (5.6 ft)**.

### E15 · Aerobic dive limit

- **Class:** EMPIRICAL MODEL
- **Equation:** `ADL = O₂_store / VO₂_dive`, with `O₂_store = s_O₂ · M` and `VO₂_dive = f_dive · B / e_O₂`
- **Symbols:** ADL = aerobic dive limit (s); O₂_store = total usable body O₂ (L); s_O₂ = O₂ store per kg (L/kg; 0.050 L/kg, ESTIMATE for baleen-whale-like animals); M = mass (kg); VO₂_dive = O₂ consumption while diving (L/s); f_dive = diving metabolic multiple of Kleiber basal (unitless; 3, ESTIMATE for lunge feeding); B = Kleiber basal rate (W, E7); e_O₂ = energy per litre of O₂ 20,100 J/L.
- **Operators:** `/`, `·`.
- **Domain:** dives without anaerobic debt.
- **Threshold:** ADL must exceed the time to reach and work the prey layer (≈ 12–15 min at a 60–120 m krill-analogue layer; ESTIMATE).
- **Assumptions:** Kleiber holds for cetacean-like animals. This is debated on Earth; marine mammals may run higher.
- **Failure conditions:** if f_dive is 5 or more, ADL halves.
- **Worked example (S13 HOLVOND):** O₂_store = 0.050 × 38,000 = **1,900 L**. B = 9,226 W → f_dive × B = 27,679 W → VO₂ = 27,679 / 20,100 = **1.377 L/s**. ADL = 1,900 / 1.377 = **1,380 s = 23.0 min → PASS** (> 15 min).

### E16 · Carnivore biomass supported by prey biomass

- **Class:** EMPIRICAL MODEL (EARTH-FACT, Carbone & Gittleman 2002, *Science* 295:2273: "10,000 kg of prey supports about 90 kg of a given species of carnivore")
- **Equation:** `C_max = c · P_b`; `N_max = C_max / m̄`; `N_real = r · N_max`
- **Symbols:** C_max = maximum carnivore biomass of one species (kg); c = 0.009 (unitless; 90/10,000); P_b = standing prey biomass available to that carnivore (kg); N_max = maximum individuals; m̄ = mean individual mass across ages and sexes (kg); N_real = realistic population; r = realization factor for competition and prey inaccessibility (unitless; 0.4–0.7, HEURISTIC).
- **Operators:** `·`, `/`.
- **Domain:** mammalian-like carnivores feeding on mammalian-like prey.
- **Threshold:** population sizing only.
- **Assumptions:** Earth carnivore energetics transfer.
- **Failure conditions:** migratory prey absent for part of the year → P_b must be a time-weighted mean.
- **Worked example (S11 SORRHALD):** prey zone Z1–Z3 = 9,000 km² × time-weighted mean prey biomass 3,500 kg/km² (ESTIMATE; Earth savanna ecosystems range to > 10,000 kg/km² seasonally) → P_b = **31.5 × 10⁶ kg**. C_max = 0.009 × 31.5 × 10⁶ = **283,500 kg**. m̄ = 140 kg → N_max = **2,025**. N_real at r = 0.4–0.7 → **810–1,418**, about **130 prides of ~8**.

### E17 · Migration trigger (HARLREN leave / return rule)

- **Class:** HEURISTIC (decision rule; field calibration required)
- **Equation (rule):** LEAVE Z1 when `(R₂₆ < 40 mm) AND (D_w > 8 km)`, OR when `G < 400 kg DM/ha`. RETURN to Z1 when `R₂₆ ≥ 30 mm`.
- **Symbols:** R₂₆ = rainfall on Z1 over the last 26 local days, one twelfth (mm); D_w = distance from the herd centroid to the nearest surface water (km); G = green standing grass biomass on Z1 (kg dry matter per hectare); `AND`, `OR` = logical operators; `<`, `>`, `≥` = comparison operators.
- **Units:** mm, km, kg DM/ha.
- **Domain:** Z1 short-grass plains, twelfth-scale timing.
- **Thresholds:** 40 mm, 8 km, 400 kg DM/ha, 30 mm (all ESTIMATES, chosen to match the shape of Earth savanna migrations).
- **Assumptions:** Z1 rainfall = 0.80 × savanna column in §6.4 (rain shadow of the volcanic massif).
- **Failure conditions:** a failed wet season (R₂₆ never ≥ 30 mm) → herds stay on the floodplain and calving shifts. That is a story event, not an error.
- **Worked example:** T9 savanna rain 35 mm → Z1 = 0.80 × 35 = **28 mm < 40**, and the pans are dry (D_w ≈ 15 km) → **LEAVE** (T9). T3 savanna 45 mm → Z1 = **36 mm ≥ 30 → RETURN** (late T3), arriving for calving in T4.

### E18 · Earth pet-care business monthly contribution

- **Class:** FORMAL SYSTEM LAW (accounting identity; all inputs ESTIMATE)
- **Equation:** `Π_m = Σ_i (q_i · p_i) + Q_k · (p_k − c_k) − C_fixed − C_var`
- **Symbols:** Π_m = monthly contribution before owner pay and tax (USD); Σ_i = sum over service lines i; q_i = monthly units of service i (count); p_i = price per unit (USD); Q_k = kits sold per month (count); p_k, c_k = kit price and landed cost (USD); C_fixed = fixed monthly costs (USD); C_var = variable service costs such as mileage and supplies (USD); subscripts m = month, i = service index, k = kit.
- **Operators:** `Σ` summation; `·` multiply; `+`, `−`.
- **Domain:** a single-operator service in its first year.
- **Threshold:** Π_m > 0 by month 4 (go/no-go), else revise.
- **Assumptions:** see §15.6.
- **Failure conditions:** unverified prices (all ESTIMATE); insurance or licensing costs higher than estimated.
- **Worked example:** §15.6 computes Σ services = $3,220; kits 20 × ($22 − $9) = $260; C_fixed = $295; C_var = $571 → Π_m = 3,220 + 260 − 295 − 571 = **$2,614 / month (ESTIMATE)**, before owner pay, self-employment tax and income tax.

### E19 · Lane percent complete

- **Class:** FORMAL SYSTEM LAW (definition)
- **Equation:** `PC = n_pass / n_req × 100 %`
- **Symbols:** PC = percent complete (%); n_pass = gates passed (count); n_req = gates required (count).
- **Operators:** `/`, `×`.
- **Domain:** the 12 lane gates in §21.20.
- **Threshold:** 100% = canon approved, backend written and read back, visuals locked, store live, Earth facts verified.
- **Assumptions:** a gate passes only on evidence. Drafting passes a draft gate only.
- **Failure conditions:** counting a drafted item as verified.
- **Worked example:** 7 / 12 × 100% = **58.3%** (§21.20).

**Existing equations referenced, not restated:**

- `Vc = S × I × G × C` (Visual law, directive). S = subject agreement, I = imagery/style agreement, G = geometry/state agreement, C = causal/context agreement. Each factor is an integer 0–5 (unitless): 0 absent/contradictory, 1 major mismatch, 2 weak, 3 usable but unresolved, 4 strong, 5 locked/verified. `×` = multiply. Production rule: min(S, I, G, C) ≥ 4. Class: HEURISTIC (a governance scoring rule). Used in §16.
- `Release readiness = health pass × behavior pass × habitat pass × legal pass` (`THY-TRANS-WILDLIFE-607`). Each factor is a pass/fail gate taken as 1 or 0 (unitless). `×` = multiply. The product is 1 only if every gate passes. Class: HEURISTIC (a decision gate). **Owned by 607.** Lane A only maps species inputs to it (§12.3).

---

## 6 · Deliverable 3: One completed biome, BIOME-P001 (PROPOSED)

**Working label:** "Long-Water Mosaic". This is an English descriptive production label, **not** a native name. The native name is OPEN.
**Type:** tropical seasonal savanna–gallery-forest mosaic that rises to an upland seasonal forest on an escarpment, drained by one river into an estuary and a sheltered bay with a continental shelf.
**Latitude:** 11° from the equator (hemisphere OPEN).
**Location relative to known places** (Bell Crossing, the Maryland/Baltimore mirror, the royal castle): **OPEN, not guessed** (CD-08).
**Frame:** 200 km × 60 km (124 × 37 mi) of land = **12,000 km² (4,633 mi²)**, plus ~3,000 km² (1,158 mi²) of marine bay and shelf (Z7).

### 6.0 · Map logic (zones and grid)

Grid origin (0, 0) is at the bay mouth. The x-axis runs up-river toward the escarpment (km). The y-axis runs across the valley, positive = north bank (km).

| Zone | Name (working) | Grid extent | Elevation | Area | Role |
|---|---|---|---|---|---|
| Z1 | Volcanic short-grass plains | x 60–140, y −30 to −10 (south bank) | 700–900 m (2,300–2,950 ft) | 1,600 km² | Phosphorus- and calcium-rich wet-season grazing and calving ground |
| Z2 | Tall-grass savanna woodland | x 20–150, both banks outside Z1 and Z3 | 300–700 m | ~6,300 km² | Browse, grazing, fire landscape |
| Z3 | River floodplain and gallery forest | x 15–170, 3–8 km wide corridor | 20–300 m | ~1,100 km² | Dry-season refuge, water, river crossings at fords F1 (x 95) and F2 (x 110) |
| Z4 | Upland seasonal forest | x 150–185 | 900–1,600 m | ~1,900 km² | Tall canopy, primate core, dry-season flowering, bee core |
| Z5 | Escarpment and cliffs | x 185–200 | 1,600–2,100 m (5,250–6,890 ft) | ~800 km² | Cliff nesting (S12), sodium lick at x 188, butterfly roost groves |
| Z6 | Estuary and intertidal fringe | x 0–15 | 0–20 m | ~300 km² | Mangrove-analogue fringe (WL-8), river plume |
| Z7 | Bay and continental shelf | x −60 to 0, bay 40 × 25 km; shelf to 200 m depth at x −60, then shelf-break to >1,000 m | 0 to −1,000+ m | ~3,000 km² marine | Whale feeding ground (S13) |

Distances that drive movement: Z1 centroid (x 100, y −20) to river ford F1 = **21 km (13 mi)**. HARLREN migration loop Z1 → F1/F2 → north-bank floodplain → back = **~420 km (261 mi) per local year** including grazing drift. River length inside the frame = **260 km (162 mi)** including meanders.

### 6.1 · Gravity dependency

- g_E = 8.80 m/s² (PROPOSED, CD-01).
- Biome consequences:
  - Tall browsers (E9 bound h ≤ 3.0 m heart-to-head) → S08.
  - Megaherbivore viability (E5, E6) → S09.
  - Longer primate leaps (E12) → S06.
  - Deeper, cheaper whale dives (E14) → S13.
  - Tree hydraulic head 10% lower (E9) → emergent WL-1 trees to 45 m (148 ft), with occasional 55 m (180 ft) individuals.
  - Rockfall and cliff stability are unchanged in kind.
- Scale height 9,382 m (E2) → the uplands keep Earth-sea-level O₂.

### 6.2 · Atmosphere dependency

- 111.5 kPa; O₂ 23.0% (pO₂ 25.6 kPa); CO₂ 500 ppm; sea-level air density 1.309 kg/m³ at 24 °C (PROPOSED, CD-02).
- Biome consequences:
  - Large lowland insects (E10) → S02.
  - Cheap hovering (E11) → S05.
  - Slow soaring (E13) → S12.
  - **Higher flammability**, so fire is a primary ecological force (§6.12).
  - Upland pO₂ at 1,500 m = 21.9 kPa → upland insects are near Earth size.

### 6.3 · Temperature (zone means from E3, Γ_env = 5.83 K/km)

| Zone | Mean annual | Hot-dry peak (T10–T12, afternoon) | Cool minimum (T1–T2, pre-dawn) |
|---|---|---|---|
| Z6/Z7 coast (0 m) | 26.5 °C (79.7 °F) | 32 °C (89.6 °F) | 20 °C (68 °F) |
| Z3 floodplain (150 m) | 26.0 °C (78.8 °F) | 34 °C (93.2 °F) | 17 °C (62.6 °F) |
| Z2 savanna (500 m) | 25.0 °C (77.0 °F) | 34 °C (93.2 °F) | 15 °C (59.0 °F) |
| Z1 plains (800 m) | 23.3 °C (73.9 °F) | 32 °C (89.6 °F) | 13 °C (55.4 °F) |
| Z4 forest (1,300 m) | 20.3 °C (68.5 °F) | 27 °C (80.6 °F) | 11 °C (51.8 °F) |
| Z5 escarpment (1,900 m) | 16.8 °C (62.2 °F) | 23 °C (73.4 °F) | 6 °C (42.8 °F) |

Daily range: the 26 h day makes the savanna range ~15 K in the dry season (ESTIMATE, versus ~12–14 K for comparable Earth savannas). This drives nightly torpor (S05) and pre-dawn huddling (S06).

### 6.4 · Rainfall (by twelfth, mm; inches in brackets)

A single wet season follows the passage of the tropical rain belt. The forest column applies to Z4/Z5. The savanna column applies to Z2/Z3. Z1 = 0.80 × savanna (rain shadow of the volcanic massif, 720 mm/yr).

| Twelfth | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12 | **Year** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Savanna Z2/Z3 | 5 | 10 | 45 | 120 | 180 | 195 | 160 | 110 | 35 | 20 | 15 | 5 | **900 (35.4 in)** |
| Plains Z1 | 4 | 8 | 36 | 96 | 144 | 156 | 128 | 88 | 28 | 16 | 12 | 4 | **720 (28.3 in)** |
| Forest Z4/Z5 | 15 | 25 | 80 | 170 | 240 | 250 | 225 | 170 | 110 | 65 | 35 | 15 | **1,400 (55.1 in)** |

Season labels (production only): **Long dry** T10–T2 · **First rains** T3 · **Wet** T4–T8 · **Drying** T9.

### 6.5 · Water (including the adjacent aquatic zone for whales)

- **River:** perennial, fed by the Z4/Z5 forest catchment (1,400 mm).
  - Stage is low in T10–T3. It rises in T4, peaks in T7, and falls in T8–T9.
  - Peak discharge ≈ 1,200 m³/s (42,400 ft³/s); low flow ≈ 60 m³/s (2,100 ft³/s) (ESTIMATE, scaled from Earth rivers of similar catchment and rainfall).
  - Fords F1 and F2 are wadeable (< 1.2 m, 3.9 ft) in T9–T3 only. Crossings in T9 still drown animals, and the drowned carcasses feed the river (EARTH-FACT analogue: Subalusky et al. 2017, PNAS, on wildebeest drownings in the Mara River).
- **Pans:** seasonal rain-filled depressions on Z1 and Z2. Dry by T9 (E17).
- **Dry-season water access:** BRUSKOND digs in the sand bed of the Z3 channel in T10–T2 (S09). The dug holes are used by other species.
- **Estuary Z6:** mixing zone, salinity 2–30 PSU, tidal range ~1.5 m (4.9 ft) (depends on CD-06). The river plume carries nutrients into the bay in T6–T9.
- **Bay and shelf Z7 (whale zone):**
  - Sheltered bay 40 × 25 km (25 × 16 mi), depth 20–80 m. Shelf to 200 m (656 ft) at 60 km offshore, then shelf-break to > 1,000 m (3,280 ft).
  - Two nutrient pulses: (1) the **river plume** in T7–T9, and (2) **dry-season wind upwelling** at the shelf-break in T10–T1.
  - Together they sustain a swarming crustacean-analogue ("krill-analogue", class name OPEN) layer at 60–120 m depth from T8 to T1. This is the only reason S13 is present, and E15 checks it.
  - Sea-surface temperature 24–28 °C (75–82 °F); upwelled water 18–20 °C (64–68 °F).

### 6.6 · Soil and minerals

| Zone | Soil (Earth reference class) | Key chemistry | Consequence |
|---|---|---|---|
| Z1 | Young volcanic-ash soil (andosol-like) | High available P, Ca, Na; shallow calcrete hardpan at 0.5–1 m | Short, nutrient-dense grass. HARLREN calve here (calves need P and Ca for bone). The hardpan limits trees, so the plains stay open. |
| Z2 | Weathered sandy loam | Moderate N, low P | Tall coarse grass → fire fuel |
| Z3 | Alluvial silt, renewed each flood | High N and P, moist | Gallery forest; dry-season green |
| Z4 | Old deeply weathered red clay (oxisol-like) | Very low P, high Fe/Al | Trees depend on mycorrhizal fungi (§7.2); tall canopy recycles nutrients tightly |
| Z5 | Rock, thin soils; **sodium-rich outcrop at x 188** | Na, Mg | Natural lick visited by S08 and S09 in the dry season |
| Z6 | Anoxic mud | Sulfide, organic C | Mangrove-analogue roots with breathing projections |

**Edereaireum** (canon metal, all properties UNKNOWN): whether it occurs in this biome's geology is **UNKNOWN and not assumed**.

### 6.7 · Plant chemistry

- **Tannins and thorns** on WL-2 (flat-crown thorn tree) limit browsing, so VELLSTRAN browses lightly and moves on.
- **Silica-rich grass** (WL-5/WL-6) wears teeth, so grazers need high-crowned, continuously wearing teeth (S10).
- **Steroid-glycoside-analogue latex** (exact chemical identity UNKNOWN; not asserted to be an Earth compound) in the milky-sap forb WL-4. Larvae of S04 sequester it and become distasteful.
- **Nectar chemistry by pollinator** (ESTIMATE, from Earth pollination-syndrome data):
  - WL-3 red-tube flowers: dilute (20–25% sugar by mass), high volume → S05.
  - Open bee flowers on forbs and WL-2: concentrated (35–50%) → S03.
- **Megafaunal fruit** of WL-1: 2–3 kg (4.4–6.6 lb), hard husk, seeds 4 cm (1.6 in) → dispersed mainly by S09.
- **High-pith giant herbs** (WL-7): low energy (≈ 2 MJ/kg fresh), high water → food for S07.
- **Fire chemistry:** at 23% O₂ even moderately dry fuel ignites. Plants invest in **thick corky bark** (WL-2, WL-1 lower trunk) and **resprouting root crowns** (WL-6).

### 6.8 · Tree structure

| Working label | Structure | Height | Where | Why this shape |
|---|---|---|---|---|
| WL-1 megafruit emergent | Buttressed trunk 2.5 m (8.2 ft) diameter at buttress top; crown 30 m (98 ft) wide | 45 m (148 ft), rarely 55 m | Z4, Z3 | Lower g → lower hydraulic head (E9); competition for light |
| WL-2 flat-crown thorn tree | Umbrella crown, thorns 3–6 cm | 6–9 m (20–30 ft); crown underside 4.0–5.5 m | Z2 | Browse line set by S08 (head height 5.2 m); flat crown sheds fire heat |
| WL-3 red-tube flowering canopy tree | Mid-canopy, deciduous in the dry season, flowers on bare branches T9–T1 | 20–28 m | Z4 | Flowering while leafless gives S05 open flight paths |
| WL-7 giant herb | Unbranched pithy stems 3–4 m, regrows from rhizome | 3–4 m | Z4 gaps, Z3 | Food for S07 |
| WL-8 mangrove-analogue | Stilt roots, breathing root projections | 6–15 m | Z6 | Anoxic, tidal mud |

Grasses and sedges (not trees): WL-5 short grass (Z1, 5–20 cm), WL-6 tall tussock grass (Z2, 1.2–2.0 m, main fire fuel), WL-9 floodplain sedges and reeds (Z3). Forb: WL-4 milky-sap host forb (Z2).
**Foliage colour** (depends on CD-03): chlorophyll-analogue pigments under a 513 nm-peak star → foliage **deep green to slightly blue-green** (PROPOSED).

### 6.9 · Light

- Instellation 1,330 W/m² (E4). Clear-sky noon photosynthetic photon flux ≈ 1,950 µmol m⁻² s⁻¹ (ESTIMATE, scaled 0.977 from Earth's ~2,000).
- Daylight length at 11° latitude with 21° obliquity varies ≈ **12.4–13.6 h of the 26 h local day** (ESTIMATE from the Earth day-length curve at that latitude, scaled to a 26 h day). Seasonal light change is small, so **rain, not light, drives the calendar**.
- Understory of Z4 closed canopy: 1–2% of full sun (Earth tropical-forest analogue) → S01 and S07 live in dim light. Reliable photography there needs long exposures (§16).
- Moonlight: depends on CD-06.

### 6.10 · Weather

- **Wet season (T4–T8):** afternoon convective storms; lightning; hail rare. Wind 3–6 m/s (7–13 mph).
- **Transitions (T3, T9):** dry-lightning storms. These are the peak ignition windows.
- **Long dry (T10–T2):** steady land-to-sea trade wind 6–10 m/s (13–22 mph). This drives Z7 upwelling. Dust and haze. Strong thermals from mid-morning, which S12 uses.
- **Extreme events:** failed-rains years (story driver; frequency UNKNOWN); river floods above bankfull in 1 year in ~5 (ESTIMATE).

### 6.11 · Terrain

- From sea level at the bay, through a floodplain (gradient ~0.5 m/km), to savanna benches at 300–700 m and the volcanic plains block at 700–900 m, then up a forested scarp to cliffs at 1,600–2,100 m. Relief across the frame: **2,100 m (6,890 ft)**.
- Hazards: river cut banks 3–6 m (10–20 ft) high at fords F1 and F2 (crossing pile-ups); cliff roosts in Z5.
- Corridors: S09 trails following contours between Z3 and Z4; a migratory funnel at F1 and F2.

### 6.12 · Ecological constraints (the rules that shape every species)

| # | Constraint | Driver | Species shaped |
|---|---|---|---|
| EC-1 | **Fire** every 2–4 years on any Z2 patch (ESTIMATE) | 23% O₂, WL-6 fuel, dry-lightning | Thick-barked WL-2; S04 roosts only in fire-sheltered Z5 groves; S03 absconds from fire; S12 forages fire fronts |
| EC-2 | **Dry-season water bottleneck** | T10–T2 rain < 25 mm per twelfth | S10 migration (E17); S09 digging; S08 contraction to Z3 |
| EC-3 | **Phosphorus geography** | Z1 volcanic P vs Z4 P-poor | S10 calving in Z1; Z4 trees depend on mycorrhizae |
| EC-4 | **Heat load on big bodies** | E8 | S09 heat flaps and wallowing; S11 inactive by day |
| EC-5 | **Flowering pulse is out of phase between zones** | Lowland forbs flower wet, upland canopy flowers dry | S05 altitudinal tracking; S03 two brood peaks |
| EC-6 | **River crossing mortality** | Fords only T9–T3; cut banks | Carcass pulse feeding S12, the aquatic food web and the river nutrient load |
| EC-7 | **Carnivore ceiling** | E16 | S11 ≈ 810–1,418 individuals |
| EC-8 | **Marine pulse timing** | Plume T7–T9 + upwelling T10–T1 | S13 present T8–T1 only |
| EC-9 | **Megafaunal seed dispersal dependency** | WL-1 fruit 2–3 kg | If S09 declines, WL-1 recruitment collapses (a known Earth pattern in megafaunal fruit trees) |
| EC-10 | **Disease ecology UNKNOWN** | No canon | Not invented anywhere in this file |

---

## 7 · Derivation layers, in the order the directive requires

### 7.1 · Plants (derived from §6.6–§6.8)

| Label | Layer | Zone | Supports | Seasonal behaviour |
|---|---|---|---|---|
| WL-1 megafruit emergent | Canopy emergent | Z4, Z3 | S09 (fruit), S06 (fruit pulp), S03 (flowers) | Fruits T8–T11 |
| WL-2 flat-crown thorn tree | Savanna tree | Z2 | S08 (browse), S03 (flowers T3–T4), M-3 root partners | Leaf flush T3 (before rains) |
| WL-3 red-tube flowering canopy tree | Mid-canopy | Z4 | S05 (nectar), S06 (flowers) | Leafless flowering T9–T1 |
| WL-4 milky-sap host forb | Forb | Z2 | S04 larvae; S03 nectar | Grows T4–T8 |
| WL-5 short grass | Grass | Z1 | S10 (calving-season forage) | Green T3–T8 |
| WL-6 tall tussock grass | Grass | Z2 | S10 (dry-season fallback), S09 (wet) | Cures T9; fire fuel T10–T2 |
| WL-7 giant herb | Herb | Z4, Z3 | S07 | Evergreen, regrows from rhizome |
| WL-8 mangrove-analogue | Tidal tree | Z6 | Fish-analogue nursery (class OPEN) | Evergreen |
| WL-9 sedges and reeds | Wetland | Z3 | S02 larvae habitat, S10 | Wet T4–T9 |
| Fungi F-1 (litter decomposers), F-2 (mycorrhizal) | Soil | Z4, Z3 | S01 (food), all trees (P uptake) | Fruit bodies T5–T8 |

Plant native names: **OPEN**. They belong to a plant naming lane following `THY-PLANT-NAME-CANDIDATES-596`, not to this lane.

### 7.2 · Microbes (functional classes only; no pathogens invented)

| Class | Where | Function | Why it must exist |
|---|---|---|---|
| M-1 Foregut fermenters | S08, S10 multi-chamber stomachs | Break down cellulose; make volatile fatty acids | Grass and browse diets are impossible without them (Earth-analogue physiology) |
| M-2 Hindgut fermenters | S09, S07 | Same, lower efficiency, high throughput | Explains the high intake in E7 |
| M-3 Root-nodule nitrogen fixers | WL-2 roots | Fix atmospheric N₂ | Z2 is N-moderate; lets WL-2 persist after fire |
| M-4 Mycorrhizal partners (with F-2) | Z4 soils | Deliver phosphorus to trees | EC-3 |
| M-5 Carcass decomposers | Z1–Z3, river | Recycle crossing mortality | EC-6 |
| M-6 Sulfur-cycle bacteria | Z6 mud | Anoxic nutrient cycling | Estuary chemistry |
| M-7 Marine phytoplankton-analogue | Z7 | Primary production of the whale food web | EC-8 |
| Pathogens | — | **UNKNOWN; not invented** | G-13 |

### 7.3 · Invertebrates

| Class | Species card | Role |
|---|---|---|
| Litter gastropod | **S01 DROVESK** | Decomposer, fungal-spore disperser |
| Aerial predatory insect | **S02 SORRVIRR** | Controls biting flies near herds |
| Eusocial pollinator | **S03 PLENNIT** | Main pollinator of WL-1, WL-2, WL-4 |
| Migratory pollinator | **S04 PLENNREN** | Pollinator of long-tubed forbs; migration spectacle |
| Mound-building detritivore insects (class, not carded; native name OPEN) | — | Nutrient hotspots on Z2; food for S06 and S14's wild ancestor |
| Biting flies (class, not carded) | — | Pester herds. Vector roles: **UNKNOWN**, not invented |
| Marine swarming crustacean-analogue (class, not carded) | — | Whale food (S13) |

### 7.4 · Herbivores (and frugivores and nectarivores)

**S05 VIRRESK** (nectar) · **S06 VASKRELL** (fruit and omnivory) · **S07 DROVATH** (herbs) · **S08 VELLSTRAN** (browse) · **S09 BRUSKOND** (mixed megaherbivore) · **S10 HARLREN** (grazer). S13 HOLVOND is a filter-feeding consumer in the marine chain.

### 7.5 · Predators

**S11 SORRHALD** (apex, terrestrial) · **S02 SORRVIRR** (invertebrate apex of the insect layer). Classes recorded but not carded (native names OPEN, and **not canon**): a river ambush reptile-analogue at the fords, a canopy raptor-analogue, an arboreal constrictor-analogue, a marine predator of whale calves. Each is carried as a **gap** (§18 U-07), not a species.

### 7.6 · Scavengers

**S12 MURRETH** (aerial) · S01 DROVESK (micro-scale scavenger of dung and carrion scraps) · M-5 carcass decomposers.

### 7.7 · Domesticated and companion life

| Item | Status | Handling |
|---|---|---|
| Estate HORSE, CATTLE, SHEEP, PIG, POULTRY, WORKING_DOG (recovered) | RECOVERED; Earth-species identity OPEN | CD-24. The care-cycle template (§12.1) is ready to apply. |
| **S14 THESKIT**, native household companion, domesticated from a forest-edge small omnivore | PROPOSED | CD-26. Candidate for Lane B's first urban animal. |
| **S03 PLENNIT** kept in log hives (semi-domestic) | PROPOSED | CD-25 |
| Every other species | **Not domesticated.** Wild only. Rehabilitation via 607 only. | Explicit welfare position (§12.3) |

---

## 8 · Fauna naming lane (PROPOSED; following the 596 precedent)

Rules applied (from `THY-PLANT-NAME-CANDIDATES-596` and the task):
1. All names are **PROPOSED, none canon**.
2. **No medical-claim names.**
3. **No invented Indigenous-sounding names.** Names are built only from the 20 roots below, with English-like consonant clusters (the same register as the precedent's "Veslusk"). No syllable patterns imitate a specific living language family.
4. **No Earth-language disguises.** No root is a respelled Earth word for the animal.
5. **The EdereAirah name leads; the Earth animal is a comparison only.**
6. No root reuses the canon terms `Kelum`/`Keal-lum`, `vlegh`, `Edereaireum`, `RUDABAKAH` or `INTERFRAME`.
7. Collision checks come from model knowledge only. A **formal trademark and lexicon search is QUEUED** (§19 L-05) before any name is used on a product.

### 8.1 · Proposed fauna root set (for a fauna lane in `THY-WORLD-NAMING-LEXICON-001`, CD-09)

| Root | Meaning | Root | Meaning |
|---|---|---|---|
| DROV | floor, ground layer | -ESK | small, low-slung |
| SORR | hunt, pursue | VIRR | hum, fast wingbeat (sound-symbolic) |
| PLENN | flower, nectar | -IT | tiny, one of many |
| -REN | travels in groups | VASK | canopy, high branches |
| -RELL | chatterer, voice | -ATH | walker on limbs |
| VELL | high, above | STRAN | stretched, long |
| BRUSK | heavy, massive | -OND | great, largest of its kind |
| HARL | open plain | -HALD | holder of ground, territory keeper |
| MURR | return, undo, clean | -ETH | broad, wide-spread |
| HOLV | deep water | THESK | hearth, household |

### 8.2 · Name table

| # | Candidate | Pronunciation | Root meaning | Descriptive working label (596 style) | Collision flags known |
|---|---|---|---|---|---|
| S01 | **DROVESK** | DROH-vesk | floor-small | "litter slug" | Weak: English "drove" (herd) |
| S02 | **SORRVIRR** | SOR-veer | hunt-hum | "hum-hawker" | None known |
| S03 | **PLENNIT** | PLEN-it | flower-tiny | "comb bee" | Weak: English "plenty"; "Plenty" is an Earth vertical-farming company name. **Check before store use.** |
| S04 | **PLENNREN** | PLEN-ren | flower-group traveller | "slate wanderer" | None known |
| S05 | **VIRRESK** | VEER-esk | hum-small | "hover-sipper" | None known. (The root "ZELL" was rejected because of the US payment brand "Zelle", a commerce-confusion risk.) |
| S06 | **VASKRELL** | VASK-rel | canopy-chatterer | "canopy caller" | Weak: Danish/Norwegian "vask" (wash) |
| S07 | **DROVATH** | DROH-vath | floor-walker | "herb walker" | None known |
| S08 | **VELLSTRAN** | VEL-stran | high-stretched | "high reacher" | Weak: Catalan "vell" (old); English/German "strand" |
| S09 | **BRUSKOND** | BRUSK-ond | heavy-great | "forest heavy" | Weak: Swedish "ond" (evil); English "brusque" |
| S10 | **HARLREN** | HARL-ren | plain-group traveller | "plain runner" | Weak: given name "Harlan" |
| S11 | **SORRHALD** | SOR-hald | hunt-territory keeper | "ground holder" | Weak: Danish place/surname "Hald" |
| S12 | **MURRETH** | MUR-eth | return/clean-broad (wings) | "broadwing cleaner" | **Moderate: begins with "Murre", an Earth seabird name.** A kids' product could confuse the two. Alternative if rejected: **MURRVETH** (MUR-veth). |
| S13 | **HOLVOND** | HOL-vond | deep-water-great | "deep glider" | Weak: Dutch "hol" (hollow) |
| S14 | **THESKIT** | THES-kit | hearth-tiny | "hearth companion" | Weak: English "kit" (a young fox, or a set). Mild, and could help recall. |

---

## 9 · Deliverable 4: Fourteen fully developed species (all PROPOSED)

Every card has the 24 directive fields, F01–F24. The canonical IDs are name-independent (`THY-FAUNA-P001-nn`), so rejecting a name does not break any reference. "Local yr" = 0.932 Earth yr. "Local day" = 26 h. The **Earth comparison is explanatory only**: none of these animals *is* the Earth animal.

### S01 · DROVESK (`THY-FAUNA-P001-01`), litter gastropod (slug and small-organism layer)

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **DROVESK** (DROH-vesk; "floor-small"). Working label "litter slug". PROPOSED. |
| F02 | Earth comparison (reference only) | A large terrestrial slug, e.g. the Pacific banana slug (*Ariolimax*). Reference for size and mucus locomotion only. |
| F03 | Size | 18 cm (7.1 in) extended; 9 cm (3.5 in) contracted; 2.5 cm (1.0 in) wide |
| F04 | Mass | 95 g (3.35 oz) adult |
| F05 | Lifespan | 3–5 local yr (2.8–4.7 Earth yr) |
| F06 | Diet | Leaf litter softened by fungi F-1, fungal fruit bodies, fallen WL-1 fruit pulp, S09/S07 dung, carrion scraps |
| F07 | Social behaviour | Solitary. Gathers passively at moisture refuges (under logs) in the drying twelfth T9. Follows conspecific mucus trails. |
| F08 | Reproduction | Simultaneous hermaphrodite. Reciprocal mating at the start of the wet season (T4). 20–60 eggs per clutch in rotting logs. Hatch in ~25 local days. |
| F09 | Movement | Pedal-wave crawling on mucus, ≈ 10 cm/min (3.9 in/min); climbs trunks to 3 m in rain |
| F10 | Migration / range | No migration. Home range ≈ 10 m² (108 ft²). Vertical retreat into soil or logs (to 30 cm; 12 in) to aestivate T11–T2. |
| F11 | Habitat | Z4 forest floor (core); Z3 gallery forest; absent from Z1/Z2 (too dry) |
| F12 | Predators | Ground-foraging S06 VASKRELL (occasional); wild ancestor of S14 THESKIT; mound-builder-adjacent ground beetles (class OPEN) |
| F13 | Prey | None as a predator. Incidentally ingests nematodes and microbes. |
| F14 | Ecological role | Decomposer. Disperses fungal spores (F-1 and some F-2) in its faeces. Moves small understory seeds a few metres. |
| F15 | Sleep | No vertebrate-type sleep. Daily quiescence in the bright hours. Seasonal aestivation T11–T2 sealed in a dried mucus sheet. |
| F16 | Communication | Chemical: mucus trail chemistry signals identity and readiness to mate |
| F17 | Care needs if domesticated | Not domesticated. Classroom terrarium standard (EdereAirah schools, PROPOSED): 80–95% humidity, 16–22 °C (61–72 °F), leaf litter from Z4, no handling with dry hands, returned to the collection log within 1 twelfth. |
| F18 | Threats | Early dry season (desiccation); fire reaching Z3 litter; over-collection near settlements (OPEN: depends on settlement canon) |
| F19 | Visual appearance | Dark olive body with ochre speckles; ridged mantle over the front third; two pairs of tentacles (the upper pair has eyespots); mucus shows iridescence under low sidelight; breathing pore visible on the right mantle edge |
| F20 | Physical reason it can exist | Constant Z4 humidity (1,400 mm rain; forest shade). Mucus locomotion cost is set by mucus production, not by weight, so lower g slightly reduces the normal force and the mucus needed. pO₂ 21.9–25.6 kPa (E2) supports skin-and-lung gas exchange. |
| F21 | Media / story | Time-lapse: one fallen WL-1 fruit vanishing over 8 local days as DROVESK, fungi and insects take it apart ("The Floor Is Alive") |
| F22 | Kid-learning derivative | "Trail reader": kids time a (real, Earth, locally legal) garden snail over a 30 cm ruler and compute speed = distance ÷ time |
| F23 | Store derivative | "Forest Floor" time-lapse poster and a free classroom activity card (digital) |
| F24 | Earth pet / animal-care derivative | Classroom and home **terrarium care guide for locally legal gastropods and millipedes**. States that giant African land snails are **prohibited in the US** without a USDA permit, and that moving live snails across state lines can need a USDA APHIS PPQ 526 permit (EARTH-FACT; VERIFY, §18). |

### S02 · SORRVIRR (`THY-FAUNA-P001-02`), aerial predatory insect (insect layer; O₂-scaled)

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **SORRVIRR** (SOR-veer; "hunt-hum"). Working label "hum-hawker". PROPOSED. |
| F02 | Earth comparison | A hawker dragonfly (family Aeshnidae), scaled up. Reference only. |
| F03 | Size | Wingspan 17 cm (6.7 in); body 13 cm (5.1 in) |
| F04 | Mass | 2.8 g (0.099 oz) |
| F05 | Lifespan | Aquatic larva 1–2 local yr; flying adult ≈ 60 local days (65 Earth days) |
| F06 | Diet | Adult: biting flies, gnats, small moths, occasionally foraging S03 workers. Larva: aquatic invertebrates and fish-analogue fry (class OPEN). |
| F07 | Social behaviour | Males hold 20–40 m pond-edge patrol beats. Loose feeding swarms over herds in the wet season. |
| F08 | Reproduction | Females lay eggs into floating WL-9 stems. Larvae moult 10–12 times. Emerge at dawn T4–T5. |
| F09 | Movement | Flight to 10 m/s (22 mph); hovers; catches prey with a basket of legs |
| F10 | Migration / range | Part of the population moves with the first storm fronts (T3–T4) onto new Z2 pans, 20–80 km (12–50 mi). Otherwise within 2 km of breeding water. |
| F11 | Habitat | Z3 floodplain pools, Z2 pans; lowland only (E10 upland limit) |
| F12 | Predators | Fish-analogues (on larvae; class OPEN); S06 VASKRELL (rare); canopy raptor-analogue (class OPEN) |
| F13 | Prey | Biting flies, gnats, small moths, some S03 foragers |
| F14 | Ecological role | Controls biting flies around S10 herds and S09 wallows; aquatic–terrestrial energy link |
| F15 | Sleep | Rests torpid overnight on grass stems, head down, wings spread; warms by sun-basking at dawn |
| F16 | Communication | Visual (thorax colour, patrol flights); wing-clash chases at territory edges |
| F17 | Care needs if domesticated | Not domesticated. Not held in captivity. Study by field observation only. |
| F18 | Threats | Pools drying before emergence (failed rains); fire over WL-9 stands; wetland drainage (OPEN: depends on settlement canon) |
| F19 | Visual appearance | Metallic blue-green thorax; smoke-amber wing veins with a dark wing-edge spot; eyes meeting at the crown; abdomen banded slate and copper |
| F20 | Physical reason it can exist | E10: pO₂ 25.6 kPa → lowland ceiling 23.6 cm; 17 cm fits. Denser air (1.309 kg/m³) lowers flight power (E11 logic). Upland pO₂ 21.9 kPa gives a ceiling of ≈ 19.7 cm, so the species stays in the lowland. |
| F21 | Media / story | Slow-motion catch over a herd at dusk: "the guard nobody thanks" |
| F22 | Kid-learning derivative | "Why aren't bugs giant on Earth?": oxygen and breathing-tube length, using straws of different length to feel the effort |
| F23 | Store derivative | Wing-venation line-art print (fine-art); stencil set |
| F24 | Earth pet / animal-care derivative | **Backyard wildlife pond guide** (depth zones, native plants, no fish in dragonfly-breeding ponds, mosquito-safe design) as a service add-on in §15 |

### S03 · PLENNIT (`THY-FAUNA-P001-03`), eusocial pollinator (bee layer)

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **PLENNIT** (PLEN-it; "flower-tiny"). Working label "comb bee". PROPOSED. |
| F02 | Earth comparison | Honey bee (*Apis*). Reference only. |
| F03 | Size | Worker 16 mm (0.63 in); queen 22 mm (0.87 in) |
| F04 | Mass | Worker 140 mg (0.0049 oz) |
| F05 | Lifespan | Queen 3–4 local yr (2.8–3.7 Earth yr); worker 35 local days in the flowering season, up to 110 local days in the dearth |
| F06 | Diet | Nectar (concentrated 35–50%) and pollen from WL-1, WL-2, WL-4 and savanna forbs; stores a honey-analogue |
| F07 | Social behaviour | Eusocial colony of 8,000–25,000; one queen; workers divide tasks by age |
| F08 | Reproduction | Colony fission (swarming) in T4. Queen mates on flights in T4. Two brood peaks: T3–T6 (savanna) and T9–T12 (canopy). |
| F09 | Movement | Flight 7 m/s (16 mph); forage radius up to 3 km (1.9 mi) |
| F10 | Migration / range | No migration. Absconds (the whole colony leaves) when fire approaches or during a failed-rain dearth. |
| F11 | Habitat | Tree cavities in WL-1 and old WL-2 in Z4/Z3/Z2 |
| F12 | Predators | S07 DROVATH (raids comb for larvae and honey-analogue); S06 VASKRELL; S02 SORRVIRR (foragers) |
| F13 | Prey | None |
| F14 | Ecological role | Primary pollinator of WL-1 and WL-2 and most savanna forbs, so fruit for S06/S09 and pods for S08 depend on it |
| F15 | Sleep | Sleep-like night rest in workers (as documented in Earth honey bees; EARTH-FACT) |
| F16 | Communication | **Gravity-referenced vibration dance** on the vertical comb. Buzz duration encodes distance; dance angle to vertical encodes bearing relative to the star. Pheromones. |
| F17 | Care needs if domesticated | **PROPOSED semi-domestic (CD-25)**: log hives hung 2–4 m (6.6–13 ft) up, shaded; water within 500 m (1,640 ft) in the dry season; smoke-free, slow handling; harvest ≤ 1/3 of stores and never in the dearth (T1–T2); hive-health inspection method **OPEN** (pests and diseases UNKNOWN, not invented) |
| F18 | Threats | Fire (EC-1); loss of cavity trees; pathogen threats UNKNOWN |
| F19 | Visual appearance | Rust and charcoal bands; dense pale pile on the thorax; smoky translucent wings; pollen loads dusted orange from WL-2 |
| F20 | Physical reason it can exist | The flower-rich mosaic, with two out-of-phase flowering pulses (EC-5), feeds colonies all year. The comb is vertical, so gravity gives the dance a shared reference direction. With g = 8.80 the reference is still unambiguous. |
| F21 | Media / story | Macro close-up of the dance, with the angle drawn on screen, then the camera flies the encoded bearing to the tree |
| F22 | Kid-learning derivative | "Gravity dance": kids decode a dance angle into a compass bearing on a school-yard map |
| F23 | Store derivative | Dance-decoder protractor card (paper) |
| F24 | Earth pet / animal-care derivative | **Native-bee habitat and mason-bee house care** (tube cleaning, cocoon harvesting). Honey-bee keeping is referred to local rules: e.g. Maryland apiary registration with its Department of Agriculture (EARTH-FACT; VERIFY). |

### S04 · PLENNREN (`THY-FAUNA-P001-04`), migratory butterfly analogue

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **PLENNREN** (PLEN-ren; "flower-group traveller"). Working label "slate wanderer". PROPOSED. |
| F02 | Earth comparison | Monarch butterfly (*Danaus plexippus*): multigenerational migration and host-plant toxin sequestration. Reference only; colours deliberately different. |
| F03 | Size | Wingspan 11 cm (4.3 in) |
| F04 | Mass | 0.6 g (0.021 oz) |
| F05 | Lifespan | Breeding-generation adults ≈ 25 local days. The migratory "long generation" lives ≈ 7 twelfths (≈ 183 local days = 198 Earth days). |
| F06 | Diet | Larvae: WL-4 milky-sap forb only. Adults: nectar from long-tubed forbs, WL-3. |
| F07 | Social behaviour | Solitary when breeding. Communal roosting in dense clusters in Z5 groves during diapause. |
| F08 | Reproduction | Eggs laid singly on WL-4. Three breeding generations in T4–T8. The fourth generation emerges in T8 in reproductive diapause. |
| F09 | Movement | Flap-glide 4–5 m/s (9–11 mph); uses thermals on T9 afternoons |
| F10 | Migration / range | **Altitudinal migration, 60–90 km (37–56 mi)**: from Z2 up to the Z5 roost groves in T9, diapause T10–T2, back down in T3 to lay eggs as WL-4 sprouts (§11) |
| F11 | Habitat | Z2 (breeding), Z5 fire-sheltered groves in ravines (roost) |
| F12 | Predators | Few, because of sequestered toxins. S06 VASKRELL learns to eat the abdomen only. Spider-analogues (class OPEN). |
| F13 | Prey | None |
| F14 | Ecological role | Pollinator of long-tubed forbs; moves WL-4 pollen between patches; a spectacle species |
| F15 | Sleep | Nightly roost; seasonal diapause |
| F16 | Communication | Visual (UV-reflective wing bars, PROPOSED); male scent patches |
| F17 | Care needs if domesticated | Not domesticated. Captive rearing only for education under the §12.3 policy: host plant from the same zone, release within the same twelfth. |
| F18 | Threats | Fire in the roost groves (irreplaceable microclimate); loss of WL-4 |
| F19 | Visual appearance | Slate-blue wings with bone-white bars and a single copper eyespot on each hindwing; underside grey-brown, cryptic at roost |
| F20 | Physical reason it can exist | Denser air (1.309 kg/m³) lowers flight cost. Host chemistry (§6.7) gives chemical defence. Cool Z5 roosts (6–23 °C) let adults hold diapause on stored fat. |
| F21 | Media / story | A roost grove with hundreds of thousands of wings opening at first sun in T3 |
| F22 | Kid-learning derivative | Tagging and citizen-science game: estimate a population by mark–recapture (N ≈ M·C/R) |
| F23 | Store derivative | Migration-map poster (§11 map) |
| F24 | Earth pet / animal-care derivative | **Monarch waystation guide**: plant regionally native milkweed; notes that tropical milkweed planted in the southern US has been linked to year-round breeding and higher parasite loads (EARTH-FACT; VERIFY) |

### S05 · VIRRESK (`THY-FAUNA-P001-05`), hovering nectar vertebrate (hummingbird analogue)

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **VIRRESK** (VEER-esk; "hum-small"). Working label "hover-sipper". PROPOSED. |
| F02 | Earth comparison | A hummingbird (family Trochilidae). Reference only. Clade on EdereAirah **OPEN** ("feather-analogue plumage"). |
| F03 | Size | Length 11 cm (4.3 in); wingspan 12 cm (4.7 in); bill 3.5 cm (1.4 in) |
| F04 | Mass | 6.0 g (0.21 oz) |
| F05 | Lifespan | 5–8 local yr (4.7–7.5 Earth yr) |
| F06 | Diet | Nectar (≈ 85% of energy) from WL-3 and red-tube forbs; small flies and spider-analogues for protein |
| F07 | Social behaviour | Aggressive defence of flower patches; males display in leks |
| F08 | Reproduction | 2 eggs; cup nest bound with spider-silk-analogue; 2 clutches per local year (T5, T10) |
| F09 | Movement | Hover (E11), forward flight 12 m/s (27 mph), backward flight |
| F10 | Migration / range | **Altitudinal flowering tracker:** Z2 forb meadows T4–T8, Z4 canopy (WL-3) T9–T1, mixed T2–T3 (§11). Moves 30–60 km (19–37 mi). |
| F11 | Habitat | Z4 canopy edges, Z2 forb meadows, Z3 edges |
| F12 | Predators | Canopy raptor-analogue and arboreal constrictor-analogue (classes OPEN); S06 raids nests |
| F13 | Prey | Small flies, spider-analogues |
| F14 | Ecological role | Main pollinator of WL-3 (dry-season canopy flowering) |
| F15 | Sleep | **Nightly torpor**: body temperature drops by ~10–20 K to save energy (as in Earth hummingbirds, EARTH-FACT). Justified by the ~15 K night drop and the 26 h day (§6.3). |
| F16 | Communication | Wing-hum tone; tail-feather sonation in dive displays; sharp chip calls |
| F17 | Care needs if domesticated | Not domesticated. Rehabilitation only via 607 (§12.3): 20–25% sugar solution plus insect protein, flight-cage conditioning, release within its twelfth zone |
| F18 | Threats | Flowering–rain mismatch in failed years; fire in Z4 edges |
| F19 | Visual appearance | Bronze-green back; male gorget iridescent violet shifting to teal; female plain grey throat with white tail tips; straight black bill |
| F20 | Physical reason it can exist | E11: ideal hover power 0.0705 W (19% below Earth), metabolic 1.18 W, 0.26 g sugar per hovering hour. Supported by WL-3 dilute high-volume nectar. |
| F21 | Media / story | 1,000 fps footage at a WL-3 crown on a leafless dry-season morning |
| F22 | Kid-learning derivative | "Count the hum": kids film an Earth hummingbird with phone slow-motion and count wingbeats per second (observation only) |
| F23 | Store derivative | "Hover Power" card with the E11 worked numbers and a paper-rotor experiment |
| F24 | Earth pet / animal-care derivative | **Hummingbird feeder care guide**: 1 part white sugar to 4 parts water, no red dye, clean every 1–2 days in heat (common Audubon guidance; VERIFY). Earth hummingbirds are protected under the Migratory Bird Treaty Act: **never kept as pets**; injured birds go to licensed rehabilitators. |

### S06 · VASKRELL (`THY-FAUNA-P001-06`), arboreal primate analogue (monkey analogue)

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **VASKRELL** (VASK-rel; "canopy-chatterer"). Working label "canopy caller". PROPOSED. |
| F02 | Earth comparison | Guenon/vervet-type monkeys (family Cercopithecidae) for troop life and predator-specific alarm calls. Reference only. |
| F03 | Size | Head–body 55 cm (21.7 in); semi-prehensile tail 70 cm (27.6 in) |
| F04 | Mass | 7.5 kg (16.5 lb) males; 5.5 kg (12.1 lb) females |
| F05 | Lifespan | 24 local yr wild (22.4 Earth yr) |
| F06 | Diet | Fruit (WL-1 pulp, figs-analogue), flowers (WL-3), young leaves, insects, eggs, S03 larvae |
| F07 | Social behaviour | Multi-male, multi-female troops of 15–40; females stay in their birth troop; grooming networks |
| F08 | Reproduction | Single infant; gestation ≈ 150 local days (162 Earth days); interbirth ~2 local yr; births peak T5–T6 |
| F09 | Movement | Branch-running, leaping 3–4 m gaps (E12: 3.23 m at 5.5 m/s); occasional ground crossing |
| F10 | Migration / range | No migration. Home range 1.2 km² (0.46 mi²). Seasonal shift to fruiting WL-1 in T8–T11. |
| F11 | Habitat | Z3 gallery forest, Z4 lower canopy |
| F12 | Predators | Canopy raptor-analogue and constrictor-analogue (classes OPEN); S11 SORRHALD when on the ground |
| F13 | Prey | Insects, eggs, S01 (rare), S03 larvae |
| F14 | Ecological role | Disperser of mid-sized fruits; flower-feeding occasionally pollinates WL-3 |
| F15 | Sleep | ≈ 10 h at night; huddled groups on high branches over water (predator avoidance) |
| F16 | Communication | **Predator-specific alarm calls** (aerial / ground / climbing threat), as documented in Earth vervets (EARTH-FACT); grooming; face-ring flashes |
| F17 | Care needs if domesticated | **Explicitly NOT a companion species** (primate welfare policy, §12.3). Rehab/sanctuary standard: troop housing, never solitary; enclosure ≥ 3 m (9.8 ft) high with climbing; foraging enrichment ≥ 4 h of feeding effort per day |
| F18 | Threats | Gallery-forest fragmentation (fire, OPEN settlement effects); taking for pets (OPEN) |
| F19 | Visual appearance | Charcoal-grey fur; pale gold facial ring; long dark-tipped tail; cream chest; amber eyes |
| F20 | Physical reason it can exist | E12: 11.5% longer leaps than on Earth for the same muscle, so gaps in the discontinuous gallery canopy are crossable. Fruit supply spread across the year by the Z4/Z3 flowering phases. |
| F21 | Media / story | "Three Words for Danger": the troop's alarm dictionary, told as a nature thriller |
| F22 | Kid-learning derivative | Alarm-call game: three sounds, three hiding actions (up / down / freeze) |
| F23 | Store derivative | "Canopy Call" audio card (digital download) |
| F24 | Earth pet / animal-care derivative | **"Why monkeys are not pets" literacy page** (many US states restrict or ban private primate ownership; federal status VERIFY) plus **foraging enrichment for dogs, cats and parrots** adapted from troop foraging effort |

### S07 · DROVATH (`THY-FAUNA-P001-07`), ground-dwelling great-ape analogue (gorilla analogue)

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **DROVATH** (DROH-vath; "floor-walker"). Working label "herb walker". PROPOSED. |
| F02 | Earth comparison | Mountain gorilla (*Gorilla beringei beringei*) for diet and body plan. Reference only; social structure deliberately different. |
| F03 | Size | Standing display height 1.70 m (5 ft 7 in); fist-walking shoulder height 1.15 m (3 ft 9 in); arm span 2.3 m (7 ft 7 in) |
| F04 | Mass | Adult males 190 kg (419 lb); adult females 100 kg (220 lb) |
| F05 | Lifespan | 40 local yr (37.3 Earth yr) |
| F06 | Diet | WL-7 pith and leaves, bark, stems, WL-1 fruit in season, S03 comb raids. E7: 16.2 kg (35.8 lb) fresh plant per local day for a male. |
| F07 | Social behaviour | Groups of 6–20 **led by the oldest experienced adult of either sex** (PROPOSED; not a copy of gorilla male-dominance). Adolescents disperse. |
| F08 | Reproduction | Single infant; gestation ≈ 235 local days (255 Earth days); interbirth ~4 local yr |
| F09 | Movement | Fist-walking; climbs for fruit (lower g helps); day range ≈ 0.8 km (0.5 mi) |
| F10 | Migration / range | No migration. Home range ≈ 12 km² (4.6 mi²). Shifts to WL-1 fruiting stands in T8–T11. |
| F11 | Habitat | Z4 forest with herb-layer gaps; Z5 lower slopes |
| F12 | Predators | S11 SORRHALD takes juveniles only, rarely |
| F13 | Prey | None (insects incidental) |
| F14 | Ecological role | Gap "gardener" (keeps the WL-7 herb layer cropped); trail maker; disperser of WL-1 seeds; breaks open S03 nests, releasing cavity space |
| F15 | Sleep | Builds a fresh leaf nest each night on the ground or low in a tree; ≈ 12 h |
| F16 | Communication | **Throat-sac boom** at 40–80 Hz carrying through the forest (PROPOSED); close-range rumbles; chest-slap display |
| F17 | Care needs if domesticated | **Not domesticated.** Sanctuary standard only: family group; ≥ 2 ha (4.9 acres) forested enclosure per group; fresh browse daily; no public handling |
| F18 | Threats | Forest loss or fire in Z4; disease UNKNOWN (not invented); disturbance by settlements (OPEN) |
| F19 | Visual appearance | Deep umber hair over slate skin; pale silver forearm fringe in older adults of both sexes; broad brow; ochre-brown eyes |
| F20 | Physical reason it can exist | E6/E5: g 8.80 lowers limb stress ~10% vs Earth. E7: B = 173.6 W; FMR 347 W; 32.5 MJ per local day, met by 16.2 kg of WL-7 at ≈ 2 MJ/kg. WL-7 regrows from rhizome, so the food is renewable. |
| F21 | Media / story | "Who decides where we sleep": the oldest adult's route choice, followed across one day |
| F22 | Kid-learning derivative | "How much does a DROVATH eat?": kids weigh 16 kg of leafy vegetables (or a picture of it) against their own lunch |
| F23 | Store derivative | Illustrated family-group storybook (PDF, then print) |
| F24 | Earth pet / animal-care derivative | **Energy literacy for Earth pets**: the veterinary RER formula `RER = 70 × M^0.75 kcal/day` is the same Kleiber relation as E7. Taught as **education only**; feeding amounts are set with the pet's veterinarian (§15 boundary). |

### S08 · VELLSTRAN (`THY-FAUNA-P001-08`), tall browser (giraffe-like)

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **VELLSTRAN** (VEL-stran; "high-stretched"). Working label "high reacher". PROPOSED. |
| F02 | Earth comparison | Giraffe (*Giraffa*). Reference only; ossicones replaced by a brow crest. |
| F03 | Size | Males: head height 5.2 m (17.1 ft), shoulder 3.0 m (9.8 ft), heart height ≈ 2.1 m (6.9 ft), heart-to-head 2.2 m (7.2 ft) standing. Females: head height 4.4 m (14.4 ft). |
| F04 | Mass | Males 1,050 kg (2,315 lb); females 750 kg (1,653 lb) |
| F05 | Lifespan | 25 local yr (23.3 Earth yr) |
| F06 | Diet | WL-2 browse (18.3 kg DM per local day for a male, E7 with f_FMR 2.5, e = 8 MJ/kg); WL-1 leaves at Z3 edges; S05-visited flowers; sodium lick at Z5 x 188 |
| F07 | Social behaviour | Loose fission–fusion herds of 3–25; calf crèches |
| F08 | Reproduction | Single calf; gestation ≈ 420 local days (455 Earth days); calves born standing-drop from ≈ 1.9 m; births peak T3–T5 (browse flush) |
| F09 | Movement | Walk 1.4 m/s (3.1 mph); gallop to 52 km/h (32 mph) |
| F10 | Migration / range | Home range ≈ 120 km² (46 mi²); contracts to Z3 river edges in T10–T2; lick visits T11–T1 |
| F11 | Habitat | Z2 thorn savanna; Z3 edges |
| F12 | Predators | S11 SORRHALD (mainly calves); S12 scavenges |
| F13 | Prey | None |
| F14 | Ecological role | Top-browser: sets the WL-2 browse line at ≈ 5 m; disperses WL-2 seed pods |
| F15 | Sleep | Short bouts of 5–30 min, 1–2 h per local day in total, mostly standing (the giraffe pattern) |
| F16 | Communication | Low-frequency night hums (Earth giraffes are reported to hum at night, ~92 Hz; EARTH-FACT, Baotic et al. 2015; VERIFY); visual neck postures |
| F17 | Care needs if domesticated | Not domesticated. Refuge standard: feeders at 4–5 m (13–16 ft) (never ground bowls, which force repeated head-lowering), non-slip footing, herd of ≥ 3 |
| F18 | Threats | WL-2 loss to fire; fences or roads (OPEN: settlement canon); drowning at F1/F2 (rare) |
| F19 | Visual appearance | Pale sand hide with irregular slate-blue banding; single bony crest along the brow; dark tufted tail; long blue-grey tongue |
| F20 | Physical reason it can exist | **E9: MAP_heart = 244 mmHg (< 300 bound; h_max 3.0 m at g_E).** E6: limb stress ~10% below Earth. The WL-2 crown at 4.0–5.5 m is out of every other browser's reach, which is the niche. |
| F21 | Media / story | "Heart Height" episode (§13 EP-2) |
| F22 | Kid-learning derivative | **Heart-Height Straw Lab**: lift a water column in clear tubing and measure how the height changes the pressure needed (ΔP = ρ·g·h) |
| F23 | Store derivative | Heart-Height Straw Lab kit (§14 PRD-02) |
| F24 | Earth pet / animal-care derivative | **Feeding-posture awareness for large dogs**: a published study (Glickman et al. 2000, JAVMA) associated raised food bowls with higher bloat (GDV) risk in large and giant breeds. Owners are advised to **decide bowl height with their veterinarian** (EARTH-FACT; VERIFY). This is not a medical claim by THYLORA. |

### S09 · BRUSKOND (`THY-FAUNA-P001-09`), megaherbivore (elephant / large forest animal; viability checked)

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **BRUSKOND** (BRUSK-ond; "heavy-great"). Working label "forest heavy". PROPOSED. |
| F02 | Earth comparison | African forest elephant (*Loxodonta cyclotis*) for its forest-fruit dispersal role. Reference only; no trunk. |
| F03 | Size | Bulls: shoulder 3.3 m (10.8 ft), body length 6.0 m (19.7 ft). Cows: shoulder 2.8 m (9.2 ft). |
| F04 | Mass | Bulls 5,200 kg (11,464 lb); cows 3,100 kg (6,834 lb) |
| F05 | Lifespan | 60 local yr (55.9 Earth yr) |
| F06 | Diet | Mixed: WL-6 and WL-5 grass in the wet season; bark, browse and WL-1 fruit in the dry season. E7: 60.7 kg DM (133.8 lb) per local day for a bull. |
| F07 | Social behaviour | Matrilineal family groups of 8–20 led by the eldest cow; bulls solitary or in bachelor groups |
| F08 | Reproduction | Single calf; gestation ≈ 600 local days (650 Earth days); interbirth 4–5 local yr |
| F09 | Movement | Walk 1.5 m/s (3.4 mph); fast walk to 5 m/s (11 mph); **cannot gallop** (always one foot down), which keeps E6 φ low |
| F10 | Migration / range | Home range 300–800 km² (116–309 mi²); **wet season Z2 savanna (T4–T8) ↔ dry season Z3/Z4 forest edges (T10–T2)**; lick visits to Z5 |
| F11 | Habitat | Z2, Z3, Z4 |
| F12 | Predators | S11 SORRHALD on calves < 2 local yr; adults none |
| F13 | Prey | None |
| F14 | Ecological role | **Keystone engineer**: digs dry-season water in the Z3 sand bed (T10–T2) for all species; main disperser of WL-1 (EC-9); opens trails and fire breaks; fells young WL-2, holding the savanna–forest balance |
| F15 | Sleep | ≈ 2–4 h per local day, mostly standing, sometimes lying before dawn |
| F16 | Communication | Infrasonic rumbles 14–35 Hz (kilometre range); seismic foot-stamps; heat-flap postures |
| F17 | Care needs if domesticated | **Not domesticated. Recommended never to be domesticated** (welfare, and the 1700s estate rows carry no such animal). Refuge standard: family group, ≥ 10 km² range, mud wallow, shade, sand for digging. |
| F18 | Threats | Dry-season water failure; fire in the Z4 edge; human conflict (OPEN) |
| F19 | Visual appearance | Grey-brown wrinkled hide; **two large thin vascular heat flaps behind the head (≈ 1.1 m² / 11.8 ft² each)**; split prehensile upper lip 60 cm (24 in) long; flat spade-like lower incisors for digging (no tusks); mud-caked flanks |
| F20 | Physical reason it can exist | **E5 PASS** (5.2 t = 19–25% of the 20.8–27.7 t isometric ceiling at g_E). **E6 PASS** (SF 13.4 walking). **E7 PASS** (1.17% body mass/day intake). **E8**: q = 173 W/m² > 150 threshold, **solved by heat flaps + wallowing + forest shade in the dry season**. |
| F21 | Media / story | "The Diggers": a cow teaches a calf to open a sand well; then S08, S10 and S14's wild ancestor drink from it at night |
| F22 | Kid-learning derivative | "Big bodies stay hot": one large ice block vs the same mass as small cubes; which melts first, and why |
| F23 | Store derivative | Food-web poster anchored on BRUSKOND's water holes |
| F24 | Earth pet / animal-care derivative | **Heat-stress awareness for Earth pets** (dense-coated and flat-faced dogs overheat sooner): shade, water, walk timing. **Heatstroke is an emergency: go to a veterinarian.** Education only. |

### S10 · HARLREN (`THY-FAUNA-P001-10`), migratory herd grazer

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **HARLREN** (HARL-ren; "plain-group traveller"). Working label "plain runner". PROPOSED. |
| F02 | Earth comparison | Blue wildebeest (*Connochaetes taurinus*) for migration and synchronized calving. Reference only. |
| F03 | Size | Shoulder 1.3 m (4.3 ft); body length 2.1 m (6.9 ft) |
| F04 | Mass | Males 190 kg (419 lb); females 160 kg (353 lb) |
| F05 | Lifespan | 18 local yr (16.8 Earth yr) |
| F06 | Diet | WL-5 short grass on Z1 (wet); WL-6 regrowth and WL-9 on Z3 (dry). E7: 5.8 kg DM (12.8 lb) per local day (male, f_FMR 2.5, e = 7 MJ/kg). |
| F07 | Social behaviour | Herds of 50–5,000; migration aggregations up to ~200,000 (ESTIMATE for the biome's scale) |
| F08 | Reproduction | Single calf; gestation ≈ 230 local days (249 Earth days); **~80% of calves born within 3 weeks of T4 on Z1** (predator swamping); calves stand within minutes |
| F09 | Movement | Trot all day; gallop to 60 km/h (37 mph) |
| F10 | Migration / range | **~420 km (261 mi) annual loop** under the E17 rule: Z1 (T4–T8) → leave T9 → cross F1/F2 T9–T10 → north-bank Z3/Z2 (T10–T2) → return late T3 |
| F11 | Habitat | Z1, Z2, Z3 |
| F12 | Predators | S11 SORRHALD; river ambush reptile-analogue at F1/F2 (class OPEN); S12 scavenges |
| F13 | Prey | None |
| F14 | Ecological role | Dominant grazer; keeps Z1 grass short; nutrient transport; crossing drownings feed the river (EC-6) |
| F15 | Sleep | ≈ 4 h per local day in short bouts, with sentinels |
| F16 | Communication | Grunts; contagious herd movement; interdigital scent glands mark the migration trail |
| F17 | Care needs if domesticated | Not domesticated (wild herd). Refuge standard for orphaned calves: bottle-rearing with an age-matched companion, then soft release into a herd within 1 twelfth |
| F18 | Threats | Failed rains; blocked crossings or fences (OPEN); fire on dry-season range |
| F19 | Visual appearance | Tawny body with a dark dorsal stripe; pale belly; ridged, forward-curving horns in both sexes; dark face blaze |
| F20 | Physical reason it can exist | E6 gallop SF 3.9. The Z1 P/Ca soils (§6.6) support calf bone growth. E17 migration follows water and forage. |
| F21 | Media / story | "The Crossing" (§13 EP-1) |
| F22 | Kid-learning derivative | Migration board game: move by rainfall cards (the E17 rule made playable) |
| F23 | Store derivative | "Long-Water Loop" board game (QUEUED_WITH_DEPENDENCY: owner Lane D; dependency print supplier + store gate; release when supplier qualified; next action: request print quotes) and a free printable version (NOW, drafted from §11) |
| F24 | Earth pet / animal-care derivative | **Grazer-diet literacy for Earth rabbits and guinea pigs**: grazers need unlimited grass hay for gut and dental wear, as HARLREN needs silica grass (EARTH-FACT, standard small-animal husbandry guidance; VERIFY with a veterinarian). Education only. |

### S11 · SORRHALD (`THY-FAUNA-P001-11`), cooperative apex predator (lion analogue)

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **SORRHALD** (SOR-hald; "hunt-territory keeper"). Working label "ground holder". PROPOSED. |
| F02 | Earth comparison | Lion (*Panthera leo*) for pride hunting. Reference only; no mane; both sexes have cheek ruffs. |
| F03 | Size | Shoulder 1.1 m (3.6 ft); head–body 2.4 m (7.9 ft); tail 0.9 m (2.95 ft) |
| F04 | Mass | Males 165 kg (364 lb); females 120 kg (265 lb) |
| F05 | Lifespan | 14 local yr wild (13.0 Earth yr) |
| F06 | Diet | S10 HARLREN (main), S08 and S09 calves, S07 juveniles (rare), scavenged carcasses. E7: ≈ 6.1 kg (13.4 lb) meat per local day on average (390 W FMR, 6 MJ/kg), eaten in bouts. |
| F07 | Social behaviour | Prides of 4–14 (related females, 1–3 males). **Two strategies (PROPOSED):** territorial residents in Z3/Z2, and "follower" prides that track the migration. |
| F08 | Reproduction | Litters of 2–4; gestation ≈ 100 local days (108 Earth days); communal nursing |
| F09 | Movement | Stalk, then a short sprint to 65 km/h (40 mph) over ≤ 150 m (490 ft) |
| F10 | Migration / range | Residents: 60–150 km² (23–58 mi²). Followers: up to 400 km² (154 mi²) per twelfth, shifting with S10. |
| F11 | Habitat | Z1, Z2, Z3 |
| F12 | Predators | None as adults; cubs killed by rival prides |
| F13 | Prey | S10, S08/S09 calves, S07 juveniles, S06 (on the ground) |
| F14 | Ecological role | Top-down regulator; supplier of carcasses to S12 and M-5 |
| F15 | Sleep | 16–20 h per local day resting (Earth lion pattern) |
| F16 | Communication | A rising two-tone call audible to ~6 km (3.7 mi); scent-marking; tail-tip flags |
| F17 | Care needs if domesticated | **Never domesticated.** Refuge standard for injured animals: pride-mate housing if possible, a large enclosure, carcass feeding, release under 607 gates |
| F18 | Threats | Prey decline in failed years; conflict with herders (OPEN) |
| F19 | Visual appearance | Short dusky-olive coat with faint rosette "ghosting"; heavy forequarters; black ear backs with a white spot; pale cheek ruff |
| F20 | Physical reason it can exist | **E16: population ceiling 2,025, realistic 810–1,418.** E6 limb stress lower at g_E; sprint within limb safety. |
| F21 | Media / story | A follower pride at the fords in "The Crossing" |
| F22 | Kid-learning derivative | Food-web card game: remove one card and see what collapses |
| F23 | Store derivative | Food-web card game (§14 option; not in the first three) |
| F24 | Earth pet / animal-care derivative | **House-cat play-hunt routine**: stalk–chase–pounce–"kill"–eat, playing before meals (common feline-behaviour guidance; VERIFY). Education and enrichment, not treatment. |

### S12 · MURRETH (`THY-FAUNA-P001-12`), soaring scavenger

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **MURRETH** (MUR-eth; "clean-broad"). Alternative **MURRVETH** if the "murre" collision is judged too strong. Working label "broadwing cleaner". PROPOSED. |
| F02 | Earth comparison | Old World vulture (e.g. *Gyps*). Reference only. Clade OPEN. |
| F03 | Size | Wingspan 2.6 m (8.5 ft); wing area 1.00 m² (10.8 ft²); length 1.0 m (3.3 ft) |
| F04 | Mass | 8.5 kg (18.7 lb) |
| F05 | Lifespan | 30 local yr (28 Earth yr) |
| F06 | Diet | Carrion (soft tissue first), crossing drownings at F1/F2 |
| F07 | Social behaviour | Communal cliff roosts; loose foraging networks that watch each other descend |
| F08 | Reproduction | One egg per local year on Z5 cliff ledges; laid T9 (dry-season carcass peak); incubation ≈ 52 local days (56 Earth days); fledges T3 |
| F09 | Movement | Thermal soaring (E13: V_min 8.45 m/s, circle radius 21.9 m); 150 km (93 mi) per local day |
| F10 | Migration / range | Follows the S10 migration from Z5 roosts; foraging radius up to 120 km (75 mi) |
| F11 | Habitat | Z5 cliffs (nest and roost); Z1–Z3 (forage) |
| F12 | Predators | Adults none; egg predation by small climbing carnivores (class OPEN) |
| F13 | Prey | None (scavenger) |
| F14 | Ecological role | Rapid carcass removal; shortens the time carcasses persist on the landscape |
| F15 | Sleep | Nocturnal roost; sunning with spread wings at dawn |
| F16 | Communication | Postural displays; hisses; visual cueing from descending birds |
| F17 | Care needs if domesticated | Not domesticated. Rehab under 607: large flight aviary ≥ 30 m (98 ft) long, carcass diet, no imprinting |
| F18 | Threats | Poisoned or contaminated carcasses (OPEN: depends on settlement canon); power lines or turbines (OPEN) |
| F19 | Visual appearance | Bare slate-blue head; cream neck ruff; dark brown body; fingered wingtips in flight |
| F20 | Physical reason it can exist | E13: denser air and lower g give slower stall and tighter circles, so it can use narrower thermal cores. The dry-season T10–T2 thermals (§6.10) coincide with the carcass peak. |
| F21 | Media / story | "The Clean-Up Crew": a day-long carcass sequence from S11 to S12 to S01 to M-5 |
| F22 | Kid-learning derivative | Paper glider wing-loading experiment (weight ÷ wing area → how slowly can it fly) |
| F23 | Store derivative | Balsa/paper glider kit keyed to E13 (option) |
| F24 | Earth pet / animal-care derivative | **Wildlife-safe pet practices**: don't leave pet food outside, secure trash, dispose of pet waste properly |

### S13 · HOLVOND (`THY-FAUNA-P001-13`), baleen filter-feeding whale analogue

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **HOLVOND** (HOL-vond; "deep-water-great"). Working label "deep glider". PROPOSED. |
| F02 | Earth comparison | Fin whale / rorquals (family Balaenopteridae) for lunge feeding. Reference only. |
| F03 | Size | Length 21 m (68.9 ft); calf at birth 6.5 m (21.3 ft) |
| F04 | Mass | 38,000 kg (83,776 lb; 41.9 short tons) |
| F05 | Lifespan | 80 local yr (74.6 Earth yr) |
| F06 | Diet | Krill-analogue swarms at 60–120 m in Z7; small schooling fish-analogues (class OPEN) |
| F07 | Social behaviour | Solitary or pairs; loose feeding aggregations; strong mother–calf bond |
| F08 | Reproduction | One calf per 2–3 local yr; gestation ≈ 310 local days (336 Earth days); calving offshore T3–T5 in warm water outside the biome frame |
| F09 | Movement | Cruise 2.2 m/s (4.9 mph); bursts to 7 m/s (15.7 mph); lunge feeding; passive glide descent below 1.7 m (E14) |
| F10 | Migration / range | **In the bay/shelf T8–T1** (feeding on the plume + upwelling pulse, EC-8); transit T2 and T7; offshore calving T3–T6 |
| F11 | Habitat | Z7 shelf and bay mouth; enters the Z6 plume edge |
| F12 | Predators | Marine predator of calves (class OPEN) |
| F13 | Prey | Krill-analogue crustaceans; small schooling fish-analogues |
| F14 | Ecological role | **Whale pump**: feeds at depth and releases nutrients at the surface, boosting Z7 plankton (Earth analogue: Roman & McCarthy 2010; EARTH-FACT) |
| F15 | Sleep | Rest-logging at the surface in short bouts; half-brain sleep pattern PROPOSED (as in Earth cetaceans) |
| F16 | Communication | Patterned low calls 20–200 Hz carrying tens of kilometres |
| F17 | Care needs if domesticated | **Never domesticated.** Stranding response under 607: keep skin wet and shaded, keep blowhole clear, support the body upright, re-float on the rising tide, apply the release gates (§12.3, §13 EP-3) |
| F18 | Threats | Failed plume years (drought); ship strike and entanglement (OPEN: depends on whether shipping and fishing exist here) |
| F19 | Visual appearance | Dark slate back; pale mottled flanks; ventral throat pleats; long pectoral fins with a white leading edge; small hooked dorsal fin |
| F20 | Physical reason it can exist | **E14**: +1,639 N at the surface, −9,212 N at 50 m, so dives are cheap. Pressure gradient 10.3% below Earth. **E15**: ADL 23 min > 15 min needed. EC-8 food pulse. |
| F21 | Media / story | "The Return" (§13 EP-3), a stranded calf re-floated |
| F22 | Kid-learning derivative | **Cartesian diver**: squeeze a bottle and watch the "whale" sink as its air bubble compresses (Boyle + Archimedes = E14) |
| F23 | Store derivative | "Deep Glide" Cartesian diver kit (option) |
| F24 | Earth pet / animal-care derivative | **Home-aquarium water-quality routine** (ammonia/nitrite/nitrate testing, cycling, buoyancy-trouble signs to take to an aquatic veterinarian): a non-veterinary service line in §15 |

### S14 · THESKIT (`THY-FAUNA-P001-14`), domesticated household companion

| # | Field | Value |
|---|---|---|
| F01 | Native name candidate | **THESKIT** (THES-kit; "hearth-tiny"). Working label "hearth companion". PROPOSED (CD-26). |
| F02 | Earth comparison | A small dog or domestic cat for its household role, and a genet or small fox for body plan. Reference only. **Not** equated with the recovered `WORKING_DOG` row (CD-24/CD-26). |
| F03 | Size | Shoulder 40 cm (15.7 in); head–body 60 cm (23.6 in); tail 45 cm (17.7 in) |
| F04 | Mass | 9 kg (19.8 lb) |
| F05 | Lifespan | 15 local yr (14 Earth yr) |
| F06 | Diet | Omnivore: meat, eggs, cooked grains, fruit. Energy (education only): RER = 70 × 9^0.75 = 364 kcal per Earth day → 394 kcal per local day; maintenance ≈ 1.6 × RER ≈ 630 kcal per local day (ESTIMATE). Wild ancestor: insects, S01 slugs, fruit, small vertebrates. |
| F07 | Social behaviour | Bonds with its household; tolerant of other THESKIT; greets with a trill |
| F08 | Reproduction | Litters of 3–5; gestation ≈ 60 local days (65 Earth days); one litter per local year (T3) |
| F09 | Movement | Trot; agile climber; short sprints |
| F10 | Migration / range | Household plus 1–2 km (0.6–1.2 mi) roam if permitted; wild ancestor ~3 km² |
| F11 | Habitat | Settlements (**OPEN: which settlements**); wild ancestor at Z3/Z2 forest edges |
| F12 | Predators | S11 SORRHALD (at settlement edges); canopy raptor-analogue (on kits) |
| F13 | Prey | Pest rodents-analogue (class OPEN), insects, slugs |
| F14 | Ecological role | Commensal pest control; household alarm; companionship |
| F15 | Sleep | 12–14 h per local day, mostly in the long night |
| F16 | Communication | Trill–chirp repertoire; tail-flag signals; cheek-scent marking |
| F17 | **Care needs (domesticated)** | See the care-cycle template §12.1, filled for THESKIT in §12.1b: diet twice daily; ≥ 60 min activity plus 2 foraging-play sessions per local day; weekly grooming; dental checks; shelter 12–30 °C (54–86 °F); a companion-health tier (UNNAMED SLOT); parasite and disease control **method OPEN** (diseases UNKNOWN, not invented); retirement and end-of-life rule (CC-09) |
| F18 | Threats | Traffic (OPEN); disease exchange with the wild ancestor (UNKNOWN); overfeeding |
| F19 | Visual appearance | Soft russet-and-cream coat; no facial mask; large mobile ears; bushy tail with a dark tip; hazel eyes |
| F20 | Physical reason it can exist | Small endotherm (E7 B = 17.6 W; E8 q = 81 W/m², no heat problem); domestication plausible from a commensal forest-edge omnivore attracted to settlement food |
| F21 | Media / story | "A THESKIT's Day": the first candidate animal for Lane B's urban scenes, once cleared (§20 OD-06) |
| F22 | Kid-learning derivative | Pet-care responsibility chart: daily and weekly tasks with checkboxes |
| F23 | Store derivative | Earth companion-care routine planner (§14 PRD-03) |
| F24 | Earth pet / animal-care derivative | **Care-cycle planner for Earth dogs and cats** (feeding schedule set with the owner's vet, enrichment minutes, grooming, vet-visit reminders): the core of §15 |

---

## 10 · Food web (BIOME-P001)

Arrows mean "is eaten by" or "energy flows to". Trophic levels: L1 producers, L2 primary consumers, L3 secondary consumers, L4 apex. D = detrital loop.

```
L1  WL-5/WL-6 grass ──► S10 HARLREN ──────────────► S11 SORRHALD (L4)
    WL-2 browse ──────► S08 VELLSTRAN (calves) ────► S11
    WL-1 fruit/browse ► S09 BRUSKOND (calves) ─────► S11
    WL-7 giant herb ──► S07 DROVATH (juveniles) ───► S11 (rare)
    WL-1/WL-3 fruit, flowers ► S06 VASKRELL ───────► canopy raptor / constrictor (classes OPEN)
    WL-3 nectar ──────► S05 VIRRESK ───────────────► canopy raptor / constrictor (OPEN)
    WL-1/WL-2/WL-4 nectar+pollen ► S03 PLENNIT ────► S07, S06, S02
    WL-4 forb ────────► S04 PLENNREN larvae ───────► (chemically defended; S06 partial)
    WL-9 wetland ─────► biting flies ──────────────► S02 SORRVIRR ─► fish-analogues (larvae) (OPEN)
    M-7 phytoplankton ► krill-analogue ────────────► S13 HOLVOND ─► marine calf predator (OPEN)

D   carcasses of S10/S08/S09/S11 ─► S12 MURRETH ─► M-5 decomposers ─► soil N/P
    crossing drownings (EC-6) ─────► river food web + S12
    leaf litter, dung, fruit fall ─► S01 DROVESK + F-1 fungi ─► soil ─► WL-1…WL-9
    S13 surface faeces (whale pump) ─► M-7 phytoplankton (loop)
```

Keystone and linkage table:

| Link | If removed | Evidence type |
|---|---|---|
| S09 → WL-1 seed dispersal | WL-1 recruitment collapses (EC-9) → S06, S07 lose fruit | Earth-analogue pattern (megafaunal fruit) |
| S09 sand wells (dry season) | S08, S10, S14 ancestor lose dry-season water in Z3 | PROPOSED mechanism, Earth elephant analogue |
| S03 pollination | WL-1/WL-2 fruit and pod set fall | Earth-analogue pattern |
| S11 predation on S10 | S10 overgrazes Z1 in wet years; more crossing pile-ups | Earth-analogue (trophic cascade theory) |
| Plume + upwelling (EC-8) | S13 absent → whale pump loop broken | PROPOSED; Earth analogue |

---

## 11 · Deliverable 5: Migration calendar and map logic

### 11.1 · Rules (driven by the §6.4 rainfall, §6.5 river stage and §6.10 weather)

| Rule | Species | Rule statement | Driver |
|---|---|---|---|
| MR-1 | S10 HARLREN | E17: LEAVE Z1 when R₂₆(Z1) < 40 mm AND D_w > 8 km, or G < 400 kg DM/ha. Cross at F1/F2 only when river depth < 1.2 m. RETURN when R₂₆(Z1) ≥ 30 mm. | Rainfall, pans, river stage |
| MR-2 | S11 SORRHALD (followers) | Follow the S10 centroid when fewer than ~500 S10 remain within 10 km of the den (HEURISTIC: 50 × the pride's twelfth kill need). Kill need for a 7-animal pride = 7 × 6.1 kg × 26.2 local days = 1,119 kg meat per twelfth ÷ (0.6 edible × 190 kg = 114 kg per kill) ≈ **10 S10 kills per twelfth** (E7). | Prey |
| MR-3 | S12 MURRETH | Forage wherever carcass density is highest. Nest on Z5 only in T9–T3. | Carcasses, thermals |
| MR-4 | S09 BRUSKOND | Move to Z3/Z4 when Z2 surface water is gone (T10). Return to Z2 when savanna R₂₆ ≥ 60 mm (T4). | Water, heat (E8), forage |
| MR-5 | S08 VELLSTRAN | Contract to within 5 km of Z3 when Z2 WL-2 leaf is lost (T10–T2). Lick visits T11–T1. | Browse, sodium |
| MR-6 | S04 PLENNREN | The long generation emerges when savanna R₂₆ falls below 50 mm (T9) and flies upslope to Z5 roosts. It flies down when Z2 R₂₆ ≥ 40 mm (T3). | Rainfall, WL-4 |
| MR-7 | S05 VIRRESK | Occupy the zone with the highest open-flower density: Z2 in T4–T8, Z4 WL-3 in T9–T1 | Flowering (EC-5) |
| MR-8 | S03 PLENNIT | No migration; brood follows flowering; abscond if fire is within 1 km or stores are exhausted | Flowering, fire |
| MR-9 | S13 HOLVOND | Present in Z7 while krill-analogue density at 60–120 m exceeds the feeding threshold (T8–T1). Offshore otherwise. | Plume + upwelling |
| MR-10 | S02 SORRVIRR | Part of the population rides T3–T4 storm fronts to new pans | Storm fronts |
| MR-11 | S01 DROVESK | Aestivate when litter moisture drops (T11–T2) | Humidity |

### 11.2 · Calendar (T1–T12). Z = zone; state codes: CALV = calving, BR = breeding, TR = transit, DIA = diapause, AEST = aestivation

| Twelfth | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Season | Long dry | Long dry | First rains | Wet | Wet | Wet | Wet | Wet | Drying | Long dry | Long dry | Long dry |
| Savanna rain (mm) | 5 | 10 | 45 | 120 | 180 | 195 | 160 | 110 | 35 | 20 | 15 | 5 |
| River stage | Low | Low | Low | Rising | High | High | Peak | Falling | Falling (fords open) | Low | Low | Low |
| Fire risk | High | High | High (dry lightning) | Low | Low | Low | Low | Low | Moderate (dry lightning) | High | High | High |
| S10 HARLREN | Z3 N bank | Z3 N bank | TR → Z1 (late) | **Z1 CALV** | Z1 | Z1 | Z1 | Z1 | **LEAVE; cross F1/F2** | Z3/Z2 N | Z3/Z2 N | Z3/Z2 N |
| S11 followers | with S10 | with S10 | TR | Z1 edges (calf season) | Z1 | Z1 | Z1 | Z1 | **F1/F2 ambush** | Z3 N | Z3 N | Z3 N |
| S12 MURRETH | nest (chick) | nest | chick fledges | Z1 | Z1 | Z1 | Z1 | Z1/F | **F1/F2; lays egg** | Z3 + nest | Z3 + nest | Z3 + nest |
| S09 BRUSKOND | Z3/Z4 digging | Z3/Z4 digging | Z3/Z4 | → Z2 | Z2 | Z2 | Z2 | Z2 | Z2 → | Z3/Z4 digging | Z3/Z4 + lick | Z3/Z4 |
| S08 VELLSTRAN | Z3 + lick | Z3 | Z2 CALV | Z2 CALV | Z2 CALV | Z2 | Z2 | Z2 | Z2 | Z3 | Z3 + lick | Z3 + lick |
| S04 PLENNREN | Z5 DIA | Z5 DIA | TR ↓ Z2 | Z2 BR | Z2 BR | Z2 BR | Z2 BR | long gen emerges | **TR ↑ Z5** | Z5 DIA | Z5 DIA | Z5 DIA |
| S05 VIRRESK | Z4 WL-3 | mixed | mixed | Z2 | Z2 nest | Z2 | Z2 | Z2 | Z4 | Z4 nest | Z4 | Z4 |
| S03 PLENNIT | dearth (stores) | dearth | brood ↑ | **swarm** | brood | brood | moderate | moderate | canopy brood | canopy brood | canopy brood | canopy brood |
| S13 HOLVOND | Z7 | TR out | offshore CALV | offshore CALV | offshore CALV | offshore | TR in | **Z7 arrive** | Z7 | Z7 peak | Z7 | Z7 |
| S02 SORRVIRR | larvae | larvae | fronts TR | emerge | adults | adults | adults | adults | adults decline | larvae | larvae | larvae |
| S01 DROVESK | AEST | AEST | wakes | BR | active | active | active | active | active | active (drying) | AEST | AEST |
| S06 / S07 | resident | resident | resident | resident | S06 births | S06 births | resident | S06/S07 → WL-1 fruit | WL-1 | WL-1 | WL-1 | resident |
| S14 THESKIT | household | household | litters | household | … | … | … | … | … | … | … | … |

### 11.3 · Map logic (for an illustrated or app map)

- **Layers:** (1) zone polygons Z1–Z7 from the §6.0 grid; (2) river line with fords F1 (x 95) and F2 (x 110); (3) pans (points, active T4–T8); (4) Z5 lick (x 188) and roost groves; (5) species tracks as animated polylines keyed to T1–T12.
- **Track generation rule:** each species' position per twelfth comes from the §11.2 cell. Movement between cells is drawn along corridors: S10 via F1/F2 only; S09 along contour trails Z2↔Z4; S04 straight upslope; S13 along the shelf-break and then into the bay.
- **Data model:** `{species_id, twelfth, zone_code, state_code, rule_id, confidence: PROPOSED}`. It maps directly to the proposed `thylora_world_fauna_movement` rows in §22.

---

## 12 · Animal-care systems

### 12.1 · Care-cycle template (fills the recovered `care_cycle = OPEN` gap once identity is decided)

| Code | Field | Content required |
|---|---|---|
| CC-01 | Identity and count | Species ID; headcount (required: estate rows have null) |
| CC-02 | Diet and energy | Ration by E7 (B₀ · M^0.75 × f_FMR); feed source and chain (links to `thylora_food_provenance_chain`) |
| CC-03 | Water | Litres per local day; dry-season source |
| CC-04 | Housing and climate | Area per animal; temperature band; shade and shelter |
| CC-05 | Activity and enrichment | Minutes per local day; social grouping |
| CC-06 | Feet, hooves, coat, teeth | Interval (e.g. farrier interval for horses) |
| CC-07 | Health tier and provider | T0–T3 (see §12.2); **provider = UNNAMED SLOT** until canon |
| CC-08 | Breeding control | Policy; season |
| CC-09 | Retirement and end-of-life rule | Working-age limit; retirement placement; humane end-of-life authority (institution OPEN) |
| CC-10 | Records and audit | Log fields; who signs; review interval |

#### 12.1b · CC applied to S14 THESKIT (PROPOSED)

| Code | Value |
|---|---|
| CC-01 | Household animal; count per household OPEN |
| CC-02 | Two meals per local day; ≈ 630 kcal per local day at 9 kg (E7 derivation, ESTIMATE); fresh food stored < 1 local day |
| CC-03 | ≈ 0.5–0.6 L per local day (ESTIMATE, ~55–65 mL/kg Earth small-carnivore rule of thumb) |
| CC-04 | Indoor sleeping place; 12–30 °C (54–86 °F) |
| CC-05 | ≥ 60 min activity plus 2 foraging-play sessions per local day |
| CC-06 | Weekly brushing; claw check every twelfth; teeth check every twelfth |
| CC-07 | T0 household daily; T2 companion-health practitioner yearly (UNNAMED SLOT; institution OPEN) |
| CC-08 | Household breeding by registration only (PROPOSED) |
| CC-09 | Senior care from 11 local yr; end-of-life decisions by T2 practitioner with the household |
| CC-10 | Household care card, signed by T2 at the yearly visit |

#### 12.1c · Estate rows: what the template would hold **if** CD-24 = "Earth species" (conditional reference only, not written)

| Row | Conditional Earth reference (EARTH-FACT; VERIFY) |
|---|---|
| ANIMAL-HORSE-001 / RIDING-001 | Forage ≈ 1.5–2.5% of body weight per day; water ≈ 25–55 L per day; hoof trimming or shoeing every 6–8 weeks |
| ANIMAL-CLASS-CATTLE | Dairy cow water ≈ 70–150 L per day depending on milk yield |
| ANIMAL-CLASS-SHEEP | Shearing once a year |
| ANIMAL-CLASS-POULTRY | ≈ 0.25 m² of floor per bird in traditional housing (ESTIMATE, varies widely) |
| ANIMAL-CLASS-WORKING-DOG | RER = 70 × M^0.75 kcal/day × work factor |

If CD-24 = "native analogues", these references are discarded, and each estate class needs its own species card like §9.

### 12.2 · Care tiers (PROPOSED structure; no people named)

| Tier | Who (role only) | Scope |
|---|---|---|
| T0 | Household or stable hand (for estate rows, the recovered `responsible_role` codes: HH-1700-STABLE, HH-1700-PROVISIONER, HH-1700-CAPTAIN) | Daily feeding, water, observation |
| T1 | Trained animal-care worker | Enrichment, hoof and coat care, record keeping |
| T2 | Clinical animal-health practitioner (institution **OPEN**) | Diagnosis and treatment in-world |
| T3 | Wildlife Refuge & Return (607) keeper / habitat ecologist / release lead: **UNNAMED SLOTs** | Wild rescue, rehabilitation, release |

### 12.3 · Wildlife policy and link to `THY-TRANS-WILDLIFE-607` (not duplicated)

- **Policy (PROPOSED):** wild native species (S01–S13) are not kept as pets. Captivity is for rescue, rehabilitation, sanctuary or education only, and each case ends in a release decision run through 607's release-readiness gates.
- **Mapping of Lane A inputs to 607's four gates.** The equation and its authority stay in 607.

| Species | Health-gate inputs | Behaviour-gate inputs | Habitat-gate inputs (from §11) | Legal gate |
|---|---|---|---|---|
| S13 HOLVOND calf | Breathing rhythm regular; skin intact; holds upright | Orients to swell; completes voluntary dives | Z7 krill-analogue present → **only T8–T1**; ADL ≥ 15 min (E15) | EdereAirah wildlife-law authority **OPEN** |
| S05 VIRRESK | Weight ≥ 5.5 g; full plumage-analogue | Hovers ≥ 30 s; feeds unaided | Flowering zone per MR-7 in the release twelfth | OPEN |
| S12 MURRETH | Flight feathers-analogue complete | Soars ≥ 20 min in thermals | T10–T2 thermals; carcass supply | OPEN |
| S10 HARLREN orphan | Weight on curve | Joins a herd in a soft pen | Herd present in the zone (MR-1) | OPEN |
| S06, S07 | Troop- or group-specific | Accepted by a group | Home-range vacancy | OPEN |

---

## 13 · Deliverable 6: Three animal-media episode ideas

All cast are **UNNAMED SLOTs** from 607 (keeper, habitat ecologist, release lead). No new people are invented. Denise Carter (reporter, on file) was considered for EP-1 and **not assigned**: her world side and department are not established in the recovered state, so assigning her would create context she does not have.

### EP-1 · "The Crossing" (T9, fords F1/F2)

| Item | Content |
|---|---|
| Department | Wildlife Refuge & Return (607 working name) |
| Cast | Habitat ecologist (UNNAMED SLOT) on the far-bank ridge counting animals; keeper (UNNAMED SLOT) on a drowning-rescue standby boat (no intervention with predators) |
| Before the camera | 18 local days earlier, Z1 rain fell to 28 mm per twelfth and the pans dried; E17 fired and the herds moved to the river. The follower pride has shadowed them for 3 days. |
| Beats | (1) The herd piles up at the 4.5 m (14.8 ft) cut bank. (2) First animals jump; the crossing cascades. (3) An ambush at mid-river (class OPEN, shown only as a splash; no species invented on screen). (4) The pride takes a straggler on the far bank. (5) MURRETH descend within 40 min. (6) Nightfall: DROVESK and fungi begin the long clean-up (time-lapse coda). |
| Visible math | E17 on screen: "R₂₆ = 28 mm < 40 → LEAVE". Carcass-to-river nutrient caption (EC-6). |
| Earth bridge | Method: rule-based movement prediction from rainfall and water distance → Earth adapter: citizen-science rainfall and animal-sighting logs for schools |
| After | The ecologist logs the count into the fauna movement table (§11.3 model) |
| Formats | Short (60–90 s) + long (8–12 min) + still (VD-1) |
| Store / free | Free: printable migration game. Store: Field Atlas (PRD-01). |
| Follow-up | EP-4 candidate: "The Return to the Plains" (T3) |
| Cost | Illustrated/animatic 8–12 min ≈ $3,000–$9,000 freelance (ESTIMATE, basis: typical freelance motion-graphics rates; unverified) |

### EP-2 · "Heart Height" (T12, Z5 sodium lick at dawn)

| Item | Content |
|---|---|
| Cast | Keeper (UNNAMED SLOT) monitoring an older male VELLSTRAN with an old leg injury, from 80 m (262 ft) |
| Before the camera | The male walked 11 km (6.8 mi) up from Z3 overnight to reach the lick. This is his third lick visit this dry season. |
| Beats | The animal splays its forelegs to lower its head 5.2 m to the ground. On-screen line from heart to head: ΔP = 1,060 × 8.80 × 2.2 = 154 mmHg. The head-down pressure buffer is explained. Comparison: "on Earth this animal would need 262 mmHg at the heart; here 244." |
| Visible math | E9, fully labelled |
| Earth bridge | Method: hydrostatic reasoning → Earth adapter: school physics lab (PRD-02) + large-dog feeding-posture conversation with a vet (S08 F24) |
| Store / free | Free: worksheet. Store: Heart-Height Straw Lab (PRD-02). |
| Follow-up | "The Lick Map": sodium sources across the biome |
| Cost | ≈ $1,500–$5,000 (ESTIMATE, shorter format) |

### EP-3 · "The Return" (T10, Z6/Z7 bay mouth)

| Item | Content |
|---|---|
| Cast | Release lead, keeper, habitat ecologist (all UNNAMED SLOTs, 607) |
| Before the camera | A 7.5 m (24.6 ft) HOLVOND calf separated in a T9 storm; it stranded on the falling tide at dawn. The mother has been heard calling offshore since. |
| Beats | (1) Keep wet, shaded, upright. (2) Release-readiness gates checked on screen: health (breathing regular), behaviour (orients to swell), habitat (T10 is inside the T8–T1 feeding window, ADL 23 min), legal (**the authority's name is shown as "OPEN"**; the scene cannot resolve it). (3) Re-float on the rising tide (1.5 m range, CD-06). (4) Calf dives; buoyancy flips negative below ~1.7 m (E14). (5) A distant call answered. |
| Visible math | 607 gate product (referenced), E14, E15 |
| Earth bridge | Method: gated release decision → Earth adapter: stranding-response literacy (Earth strandings are handled by authorized stranding networks; the public should report and not intervene. EARTH-FACT; VERIFY for jurisdiction) |
| Store / free | Free: Cartesian-diver instructions. Store: "Deep Glide" kit (option). |
| Blocker | 607's legal gate authority is OPEN, so this episode cannot close its equation truthfully until named |
| Cost | ≈ $4,000–$12,000 (ESTIMATE; water scenes are costlier) |

---

## 14 · Deliverable 7: Three store products (QUEUED_WITH_DEPENDENCY)

Store-wide blockers (recovered): `THY-DS-CURRENT-STORE-20260910`, where the THYLORA `active_allowed = false` and the real-money checkout witness = 0. `THY-DS-MERCH-REWARDS`: POD supplier not selected. **No product below is live or claimed live.**

| | PRD-01 · Long-Water Mosaic Field Atlas | PRD-02 · Heart-Height Straw Lab | PRD-03 · Enrichment Rotation Cards + Care-Cycle Planner |
|---|---|---|---|
| Proposed SKU | THY-FA-P001-ATLAS-PDF | THY-KIT-P001-HEART | THY-EARTH-CARE-P001-DECK |
| What | 48-page digital atlas: biome map, 14 species in kid-safe card form, migration calendar, 5 physics boxes (E5, E9, E11, E14, E17) | Physics kit: 3 m (10 ft) clear tubing 6 mm (¼ in) ID, 60 mL syringe, printed scale strip, funnel, clips, 8-page guide, EP-2 link | 52-card enrichment deck (dogs and cats: foraging, scent, play-hunt, rest) + printable care-cycle planner (the CC template adapted for Earth pets) |
| Audience (Lane D nav) | I'M A PARENT / I'M A TEACHER / I'M A STUDENT | I'M A TEACHER / I'M A PARENT | I NEED HELP (pet owners) / I'M A PARENT |
| Unit cost | ≈ $0 marginal; platform + payment fees ≈ 8–13% (ESTIMATE) | BOM ≈ $7.20 + pick/pack/ship ≈ $4.00 = **$11.20 landed** (ESTIMATE, basis: typical US bulk component prices) | POD deck ≈ $6–8 + digital planner $0 → **≈ $9 landed** (ESTIMATE) |
| Price | $12 (ESTIMATE) | $26 (ESTIMATE) | $22 (ESTIMATE) |
| Gross margin | ≈ $10.50 (87%) | ≈ $14.80 (57%) before compliance testing | ≈ $13 (59%) |
| Compliance | Canon names must be approved, or the atlas is published as a "working names" edition with that label; IP rights clearance with the IP & Media Rights director role (Priya Nwosu is on file, **role fit only**; not assigned here) | **Children's product (US):** CPSIA third-party testing + Children's Product Certificate; small-parts warning if any part is choke-size (EARTH-FACT; VERIFY). Testing ≈ $300–$1,500 per product (ESTIMATE). | **No medical claims.** FTC truth-in-advertising. "Discuss feeding and health with your veterinarian" on every card that touches food or exercise. |
| Dependency | CD-09…CD-23 (names) or "working names" approval; Lane C `downloads`/`entitlements`; store release gate | Supplier selection (Lane D supplier bridge); CPSIA testing; store release gate | POD supplier; store release gate |
| State | QUEUED_WITH_DEPENDENCY | QUEUED_WITH_DEPENDENCY | QUEUED_WITH_DEPENDENCY |
| Owner / next action | Lane A drafts the atlas; next action: produce the atlas layout from §9 once OD-02 (visual) is chosen | Lane D qualifies a supplier; next action: request quotes for 3 m tubing and syringe | Lane A drafts the 52 cards; next action: vet-reviewer check of card text (Earth, licensed; external) |

Back-to-Buy (Lane D): any of these can carry a disclosed support share `s` under Lane D's `N = G − T − F − P − R`, `B = N × s`. It is not applied by default. Lane D owns that math.

---

## 15 · Deliverable 8: One Earth pet-care business lane

### 15.1 · The flow (World-First Law)

EdereAirah experience (the refuge care-cycle and tier system, §12) → method (the **Care-Cycle Card**: CC-01…CC-10 + energy literacy E7 + enrichment ethology) → **Earth context adapter** (US household dogs, cats, small animals and aquaria; non-veterinary) → Earth application (in-home care-routine service + kits) → Earth evidence (adherence and outcome measures, §15.7) → improved method → back to EdereAirah §12.

**EdereAirah is not asking Earth for help.** The world exports a method.

### 15.2 · Business definition (Earth, real)

**Working name:** "THYLORA Care-Cycle Service" (Earth; name subject to trademark search).
**Model:** single-operator, in-home, **non-veterinary** animal-care service in one US metro. The first market is OPEN (OD-04). Maryland is a plausible default because existing packets (`THY-TRANS-RIGHTS-607`, Scene 001) already bridge to Maryland. That is a Chairman decision, not assumed.

| Line | Service | Price (ESTIMATE; basis) |
|---|---|---|
| S-1 | In-home care-routine and enrichment audit (75 min on site + written Care-Cycle Card) | $95 (basis: priced between a trainer consult and a pet-sitter visit; unverified) |
| S-2 | Drop-in care visits, 30 min (feed per owner's written instructions, water, play, litter/yard, observation log) | $28 (basis: common US drop-in ranges ~$20–$35; unverified) |
| S-3 | Small-animal / terrarium / aquarium habitat setup and water-quality visit | $120 + materials |
| S-4 | Library and school workshops ("How Animals Work": uses the EdereAirah physics as a story frame) | $150 per session fee (ESTIMATE) |
| K-1 | Kits and cards (PRD-03) | $22 |

### 15.3 · Licensing and legal boundaries (honest)

| Topic | Position | Status |
|---|---|---|
| **Veterinary practice acts** | Every US state reserves diagnosis, prognosis, treatment, prescribing and surgery for licensed veterinarians (e.g. Maryland's Veterinary Practice Act under the State Board of Veterinary Medical Examiners). **THYLORA is not a veterinarian and does not diagnose, treat, prescribe, recommend doses, or sell "cures".** | EARTH-FACT; statute cite VERIFY per state |
| Giving owner-supplied, vet-prescribed medication during drop-ins | Only if state law permits a non-vet agent acting for the owner, with written owner instructions and the vet's label. Otherwise decline. | VERIFY per state |
| Pet sitting / in-home care | Generally no state license. General business registration required. Some counties or cities require permits. | VERIFY per county |
| Boarding / kennel (overnight care at operator's premises) | **Out of scope.** Often requires a county or state kennel license. | Not entered |
| Training | Unregulated in most states. Voluntary certification exists (e.g. CCPDT). | EARTH-FACT; VERIFY |
| Wildlife | Native wild birds are protected (Migratory Bird Treaty Act); wildlife rehabilitation needs state and federal permits. **The service never handles wildlife**; it refers to licensed rehabilitators. | EARTH-FACT |
| Live-animal sales | **None.** No breeding, no selling animals. | Policy |
| Product claims | FTC truth-in-advertising; no health claims | EARTH-FACT |
| Insurance | Pet-care liability + bonding (care, custody and control coverage) | Required by policy |
| Background check, pet first aid/CPR course | Required by policy | — |

### 15.4 · Referral protocol (hard stops)

Any of the following → **stop, call the owner, and direct them to their veterinarian or an emergency clinic.** The service never assesses these itself: breathing difficulty, collapse, seizure, suspected poisoning, bloat signs, heatstroke signs, bleeding, non-weight-bearing, not eating for more than 24 h, straining to urinate. Each is logged with the time and who was called.

### 15.5 · Start-up costs (ESTIMATE; basis in brackets)

| Item | Amount |
|---|---|
| LLC formation (state filing fee; Maryland Articles of Organization ≈ $100 [recollection; VERIFY]) | $100–$200 |
| Liability + bonding insurance, year 1 | $400–$700 [typical pet-sitter policies; unverified] |
| Pet first aid/CPR course | $25–$100 |
| Background check | $30–$60 |
| Booking/CRM software, 3 months | $90–$150 |
| Water-test kits and tools for S-3 | $150 |
| Initial kit inventory (PRD-03 × 40) | ≈ $360 |
| Brand/print/local marketing | $300 |
| **Total** | **≈ $1,455–$2,020** |

### 15.6 · Monthly unit economics (E18 worked example; all ESTIMATE)

| Line | Units/month | Price | Revenue |
|---|---|---|---|
| S-1 audits | 8 | $95 | $760 |
| S-2 drop-ins | 60 | $28 | $1,680 |
| S-3 setups | 4 | $120 | $480 |
| S-4 workshops | 2 | $150 | $300 |
| **Σ services** | | | **$3,220** |
| K-1 kits | 20 | $22 − $9 cost | **$260** contribution |

C_fixed = $295: insurance $45 + software $35 + phone $40 + marketing $100 + entity fees amortized $25 + certs/check amortized $10 + bookkeeping $40.
C_var = $571: mileage 592 mi × $0.70/mi = $414 (the rate is an ESTIMATE based on the IRS standard mileage rate order of magnitude; VERIFY the current rate) + supplies $60 + card fees 3% × $3,220 = $97.
**Π_m = $3,220 + $260 − $295 − $571 = $2,614 per month.** Hours ≈ 98 per month (visits 30 h + travel 20 h + audits 14 h + setups 12 h + workshops 6 h + admin 16 h) → **≈ $26.70 per hour** before self-employment tax and income tax.
**Go/no-go:** Π_m > 0 by month 4 **and** zero incidents without a logged referral.

### 15.7 · Earth evidence to collect (feeds the improved method)

| Metric | Definition | Target |
|---|---|---|
| Routine adherence | % of Care-Cycle Card tasks done by the owner in the 4 weeks after an audit (owner self-report + visit log) | ≥ 70% |
| Enrichment minutes | Minutes per day logged vs baseline | +20 min per day |
| Referrals | Hard-stop events → vet referrals made within 15 min | 100% |
| Incidents | Injuries or escapes in care | 0 |
| Repeat rate | Clients booking again within 60 days | ≥ 40% |

---

## 16 · Deliverable 9: Three visual directions (VISUAL LAW; no final visual generated)

The rule: no final visual until min(S, I, G, C) ≥ 4. The `THY-INTERWORLD-VISUAL-BARRIER-001` glaze is local, moving and translucent. It never covers animals' faces, evidence or text, and is never a full-frame blur.

### VD-1 · "The Crossing at F1": `VISUAL-001 B&W Cinematic Realism`

| Element | Identity / class | Location | Dimensions (metric / US) | History / state | Causal reason present | Geometry |
|---|---|---|---|---|---|---|
| River at F1 | Perennial river, falling stage | x 95 km | Width 85 m (279 ft); depth 1.0–1.4 m (3.3–4.6 ft) | T9, falling after the T7 peak | Fords open only T9–T3 | Flows left→right in frame |
| Cut bank | Alluvial bank | Near side | 4.5 m (14.8 ft) high | Undercut by the T7 flood | Creates the pile-up | Diagonal lower-left |
| HARLREN column | S10, ~3,000 visible | Near bank → water | Each 1.3 m (4.3 ft) at shoulder | Left Z1 18 local days ago (E17) | MR-1 | Line converging to the jump point |
| Follower pride | S11 × 7 | Far bank grass | 1.1 m (3.6 ft) shoulder; 60 m (197 ft) from the landing | Shadowed the herd 3 days | MR-2 | Hidden low right |
| MURRETH | S12 × 12 | Sky | 2.6 m (8.5 ft) span; circling at 150–300 m (490–980 ft) | Arrived with the thermals | MR-3 | Upper right |
| SORRVIRR | S02 swarm | Above the herd | 17 cm (6.7 in) span | Wet-season adults declining | Biting flies over the herd | Specular sparks |
| Glaze | Interworld barrier | Upper-left sky only | ~12% of the frame | Moving | Marks the other world | Never over animals |

Time: late afternoon, sun ~20° above the horizon, backlit dust. Camera (PROPOSED): 400 mm-equivalent from the far-bank ridge, 600 m (1,970 ft) away, 25 m (82 ft) elevated. Provenance: world-state first (E17 fired, then the herd moved, then the camera). Maker/manufacturer: N/A for living things; camera make OPEN.
**Vc:** S = 3 (species not yet approved), I = 4 (VISUAL-001 on file), G = 3 (geometry defined, not locked), C = 4 (causal chain defined) → Vc = 144; **min = 3 → BLOCKED** until CD-10/CD-19/CD-20 and a geometry lock.

### VD-2 · "Heart Height at the Lick": `VISUAL-002 Amber Glaze`

| Element | Identity | Location | Dimensions | History / state | Causal reason | Geometry |
|---|---|---|---|---|---|---|
| Older male VELLSTRAN | S08 | Z5 lick, x 188 | Head height 5.2 m (17.1 ft); heart-to-head 2.2 m (7.2 ft) | Old healed leg injury; 3rd visit this dry season | Sodium need (MR-5) | Profile, forelegs splayed, head lowered |
| Lick face | Sodium-rich outcrop | Z5 | 3 m (9.8 ft) wide, pale crust | Hollowed by tongues over years | §6.6 | Background left |
| INTERFRAME diagram | Authored overlay | Heart → head line | Labelled 2.2 m / 154 mmHg | — | E9 teaching | Thin line, never over the eye |
| Glaze | Barrier | Lower right | ~10% of the frame | Moving | Other world | Off-subject |

Time: dawn in T12, amber low sun (matches VISUAL-002). Camera: 200 mm-equivalent, 80 m (262 ft) away, at eye level with the animal's shoulder.
**Vc:** S 3, I 4, G 3, C 4 → **BLOCKED (min 3)**.

### VD-3 · "Dry-Season Crown": natural-colour field plate (**new standard needed**)

| Element | Identity | Location | Dimensions | History / state | Causal reason | Geometry |
|---|---|---|---|---|---|---|
| WL-3 crown | Leafless flowering tree | Z4, 1,300 m | 24 m (79 ft) tall; flowers 5 cm (2 in) red tubes | Dropped its leaves in T9 | EC-5 | Branch lattice |
| Male VIRRESK | S05 | At a flower | 11 cm (4.3 in); hovering | Territorial on this crown for 8 days | MR-7 | Centre right, wings blurred |
| PLENNIT | S03 × 3 | Nearby flowers | 16 mm (0.63 in) | Canopy brood peak | MR-8 | Foreground bokeh |

Time: mid-morning, T10. Camera: macro-telephoto from a canopy platform (platform existence OPEN).
**Vc:** S 3, I 2 (no natural-colour standard on file), G 3, C 4 → **BLOCKED (min 2)**. Needs a new visual standard, or reassignment to VISUAL-001/002.

---

## 17 · Deliverable 10: Money paths (COMMERCE LAW scan)

Rule: monetize the METHOD, OUTPUT, SERVICE or PRODUCT, never the beneficiary. Every non-NOW row has an owner, dependency, release condition and next action (NO NAKED LATER).

| # | Path | Concrete item | State | Owner | Dependency | Release condition | Next action | Revenue (ESTIMATE) |
|---|---|---|---|---|---|---|---|---|
| M-01 | Free help | Printable migration game; Care-Cycle Card (Earth pets) free version; hard-stop referral list | QUEUED_WITH_DEPENDENCY | Lane A | Card text reviewed by an Earth licensed vet (external) | Review sign-off | Draft the free card from §12.1 + §15.4 | $0 (trust, funnel) |
| M-02 | Public story | "The Crossing" narrative page | APPROVAL_REQUIRED | Chairman | CD-10…CD-23 | Species approved | Draft the page from EP-1 | — |
| M-03 | Short video | EP-1/2/3 60–90 s cuts | HOLD_FOR_EVIDENCE | Lane B / media | Vc min ≥ 4 | Visual lock | Geometry lock for VD-1 | Platform-dependent |
| M-04 | Long video | EP-1 8–12 min | HOLD_FOR_EVIDENCE | Media | Same + budget | Budget approval | Animatic script | Sponsorship-dependent |
| M-05 | Still image | VD-1/2/3 plates | HOLD_FOR_EVIDENCE | Media | Vc | min ≥ 4 | Choose a VD (OD-02) | Print sales (QUEUED behind visual lock + store gate) |
| M-06 | PDF/book | PRD-01 Field Atlas | QUEUED_WITH_DEPENDENCY | Lane A | Names or "working names" approval; store gate | Store `active_allowed = true` + checkout witness | Atlas layout | $12 × units |
| M-07 | Children's derivative | Kid-learning fields F22 × 14 as an activity book | QUEUED_WITH_DEPENDENCY | Lane A | Same as M-06 | Same | Pick 6 activities | Bundled |
| M-08 | Teacher derivative | Physics-of-animals unit (E5, E9, E11, E12, E14) with worked examples | QUEUED_WITH_DEPENDENCY | Lane A | Physics canon CD-01/02 | Approval | Lesson plan draft | $15–$40 per unit (ESTIMATE) |
| M-09 | Family derivative | Pet responsibility chart (S14 F22), Earth version | NOW (can draft) | Lane A | — | — | Draft chart | Free/bundle |
| M-10 | Business derivative | §15 Care-Cycle Service | APPROVAL_REQUIRED | Chairman | OD-04 | Market + operate/licence decision | Verify licensing for the chosen state | Π_m ≈ $2,614 per month (ESTIMATE) |
| M-11 | Institutional derivative | Library/school workshop program (S-4) | QUEUED_WITH_DEPENDENCY | Lane A | M-08 | Lesson plan ready | Draft a 45 min workshop | $150 per session |
| M-12 | Software/app function | Field-guide + migration-map view on the dashboard/app | QUEUED_WITH_DEPENDENCY | Lane C | API v1 frozen; fauna registry exists | v1.1 resource `fauna` | Propose v1.1 resource spec | Subscription feature |
| M-13 | Subscription | "Living Biome" monthly: one twelfth of the calendar per month (story + activity) | QUEUED_WITH_DEPENDENCY | Lane A + Lane D | Store gate; content | 3 months of content banked | Write T1–T3 content | $4–$8 per month (ESTIMATE) |
| M-14 | Licensing | Species designs and the physics-teaching set licensed to educational publishers | APPROVAL_REQUIRED | Chairman + IP & Media Rights role | Canon + trademark search | Clearance | Trademark search (L-05) | Deal-dependent |
| M-15 | Sponsorship | Earth conservation or education sponsor for EP series | APPROVAL_REQUIRED | Chairman | Episode chosen (OD-03) | Sponsor-policy check | Sponsor criteria list | Deal-dependent |
| M-16 | Merchandise | Plush / figures of S05, S08, S14 | QUEUED_WITH_DEPENDENCY | Lane D | POD supplier (THY-DS-MERCH-REWARDS) + CPSIA | Supplier qualified | Supplier desk review | $20–$35 per unit (ESTIMATE) |
| M-17 | Training | Care-Cycle method training for pet sitters | HOLD_FOR_EVIDENCE | Lane A | §15.7 evidence ≥ 3 months | Adherence ≥ 70% | Run the service first | $49–$149 per seat (ESTIMATE) |
| M-18 | Consulting/service | = M-10 | — | — | — | — | — | — |
| M-19 | Recurring support | Monthly drop-in plans (S-2) | APPROVAL_REQUIRED | Chairman | OD-04 | Same as M-10 | — | Part of Π_m |
| M-20 | Data/evidence product | **Aggregated, anonymized** care-adherence findings (never personal or pet-owner data sold) | HOLD_FOR_EVIDENCE | Lane A + Legal (privacy role) | Consent design; n ≥ 100 clients | Privacy review | Consent text draft | Report sales / grant use |
| M-21 | Store product | PRD-01/02/03 | QUEUED_WITH_DEPENDENCY | Lane D | §14 | §14 | §14 | §14 |
| M-22 | Earth partnership | Library systems, school districts, licensed wildlife rehabilitators (referral partners, not revenue from them) | APPROVAL_REQUIRED | Chairman | OD-04 | Market chosen | Partner list | Indirect |
| M-23 | EdereAirah derivative | In-world: the refuge's own public field guide, a world school curriculum, T2 care-tier institution | APPROVAL_REQUIRED | Chairman | CD-series | Canon | — | REE in-world (simulation only; never mixed with Earth money) |

---

## 18 · Deliverable 11: Evidence and unknowns

### 18.1 · Evidence used

| ID | Evidence | Type | Verified this session? |
|---|---|---|---|
| EV-01 | `00-RECOVERED-STATE.md` §3 (7 estate rows, 607 packet, 596 precedent, no physics canon) | Backend read by the production-executive session | Read from file: yes. Backend: not re-read by Lane A. |
| EV-02 | `SOURCE-DIRECTIVE.md` Lane A text | Chairman verbatim | Yes |
| EV-03 | Kleiber (1932, 1947): basal rate ≈ 70 kcal/day × M^0.75 | EARTH-FACT | No (training knowledge) |
| EV-04 | Biewener (1989) *Science* 245:45; (1990) *Science* 250:1097: limb posture, bone safety factors 2–4 | EARTH-FACT | No |
| EV-05 | Hargens et al. (1987) *Nature* 329:59: giraffe haemodynamics | EARTH-FACT | No |
| EV-06 | Harrison, Kaiser & VandenBrooks (2010) *Proc. R. Soc. B* 277:1937: O₂ and insect size | EARTH-FACT | No |
| EV-07 | Belcher et al. (2010) *PNAS* 107:22448: flammability vs atmospheric O₂ | EARTH-FACT | No |
| EV-08 | Ellington (1984) *Phil. Trans. R. Soc. B*: hovering aerodynamics | EARTH-FACT | No |
| EV-09 | Carbone & Gittleman (2002) *Science* 295:2273: prey supports carnivore biomass | EARTH-FACT | No |
| EV-10 | Roman & McCarthy (2010) *PLoS ONE* 5:e13255: whale pump | EARTH-FACT | No |
| EV-11 | Subalusky et al. (2017) *PNAS* 114:7647: wildebeest drownings and river nutrients | EARTH-FACT | No |
| EV-12 | Koch et al. (2004) *Nature* 428:851: limits to tree height | EARTH-FACT | No |
| EV-13 | Baotic, Sicks & Stoeger (2015) *BMC Res. Notes* 8:425: giraffe night humming | EARTH-FACT | No |
| EV-14 | Glickman et al. (2000) *JAVMA* 217:1492: bloat risk factors incl. raised bowls | EARTH-FACT | No |
| EV-15 | Seyfarth, Cheney & Marler (1980) *Science* 210:801: vervet predator-specific alarm calls | EARTH-FACT | No |
| EV-16 | Meeh (1879) surface-area relation | EARTH-FACT | No |
| EV-17 | US legal frame: state veterinary practice acts; MBTA; CPSIA; FTC; USDA APHIS snail rules | EARTH-FACT | No; every item needs a per-jurisdiction citation before publication |
| EV-18 | All arithmetic in E1–E19 | Computed in this file | Yes: re-computed by a Python script in this session; all key results agree within 0.3% (Kleiber quick-table rounding corrected) |

### 18.2 · Unknowns (not invented)

| ID | Unknown | Blocks |
|---|---|---|
| U-01 | Disease ecology of EdereAirah fauna (no pathogens, no diagnoses invented) | Care tier T2 content; F18 fields |
| U-02 | EdereAirah bone and tissue chemistry | E5/E6 assume Earth-like tissue |
| U-03 | Whether EdereAirah endotherms follow Kleiber scaling | E7, E15 |
| U-04 | Higher-clade structure (are there "birds", "mammals"?) | S05, S12 clade labels (feather-analogue) |
| U-05 | Settlement–wildlife interface (roads, fences, fishing, shipping) | Threat fields marked OPEN |
| U-06 | EdereAirah wildlife-law authority | 607's legal gate; EP-3 |
| U-07 | River ambush predator, canopy raptor, arboreal constrictor, marine calf predator | Food web completeness (4 classes carried as gaps) |
| U-08 | Local clock subdivision of the 26 h day | Time-of-day in scenes |
| U-09 | Biome hemisphere and location relative to Bell Crossing, the Maryland mirror, the royal estate | Transmission placement |
| U-10 | Edereaireum occurrence in this geology | Soil table |
| U-11 | Earth prices, insurance, filing fees, mileage rate | §15 (all ESTIMATE) |
| U-12 | Whether `thylora_living_world_records` or `OCEAN_SYSTEMS_AND_INFRASTRUCTURE` already hold ecology or ocean canon | Possible supersession of §6.5 |
| U-13 | Moon existence | Z6 tides (CD-06) |

---

## 19 · NO NAKED LATER register (every non-NOW item in this lane)

| ID | Item | State | Owner | Dependency | Release condition | Next action |
|---|---|---|---|---|---|---|
| L-01 | Read `thylora_living_world_records` (11 rows), LIVING_WORLD_ATLAS personnel, OCEAN_SYSTEMS_AND_INFRASTRUCTURE | QUEUED_WITH_DEPENDENCY | Backend-read session (production executive) | Supabase connector stable | Read completes | `select *` on those rows; diff against §6 |
| L-02 | Planetary physics adoption | APPROVAL_REQUIRED | Chairman VYC | — | CD-01…CD-07 decided | Present §4 table |
| L-03 | Species and name adoption | APPROVAL_REQUIRED | Chairman VYC | L-02 (g/atmosphere) | CD-10…CD-23 | Present §8.2 + §9 |
| L-04 | Estate animal identity | APPROVAL_REQUIRED | Chairman VYC | — | CD-24 | Then fill CC template per row |
| L-05 | Trademark and lexicon collision search for 14 names + service name | QUEUED_WITH_DEPENDENCY | Lane A (or Legal IP role) | Access to USPTO/WIPO search | Search logged | Run searches before any store use |
| L-06 | Independent arithmetic re-check of E1–E19 | EXECUTED for E1–E17 key results (script run 2026-09-28); E18 is simple sums | Lane A | — | Matched within 0.3% | Optional: store the script with the equation registry rows (N-07) |
| L-07 | Citation re-verification EV-03…EV-17 | QUEUED_WITH_DEPENDENCY | Research session with web access | Web access | Each citation confirmed or corrected | Fetch each source |
| L-08 | Backend write of §22 | APPROVAL_REQUIRED + QUEUED | Backend-write session | Chairman approval + column schemas read | Schemas read; approval | Read the column schemas of target tables |
| L-09 | Visual lock VD-1/2/3 | HOLD_FOR_EVIDENCE | Media lane | Species approval; geometry lock | min(S, I, G, C) ≥ 4 | OD-02 choice |
| L-10 | Store products | QUEUED_WITH_DEPENDENCY | Lane D | Store release gate; supplier; CPSIA | Gate passes | Supplier quotes |
| L-11 | Earth business launch | APPROVAL_REQUIRED | Chairman VYC | OD-04 | Market chosen; licensing verified | Per-state licensing check |
| L-12 | 607 legal-gate authority | APPROVAL_REQUIRED | Chairman VYC | Institution canon | Authority named | Add to 607 |
| L-13 | Four carried predator classes (U-07) | QUEUED_WITH_DEPENDENCY | Lane A | CD-10…CD-23 decided (to avoid multiplying unapproved species) | Roster approved | Draft 4 more species cards |
| L-14 | Lane B urban animal | APPROVAL_REQUIRED | Chairman VYC | CD-26 | THESKIT approved | Hand S14 card to Lane B |

---

## 20 · Chairman decisions

### 20.1 · PROPOSED canon decisions (27)

| ID | Decision | Lane A recommendation |
|---|---|---|
| CD-01 | Surface gravity 8.80 m/s² (R 6,100 km, M 4.906 × 10²⁴ kg) | Adopt |
| CD-02 | Atmosphere 111.5 kPa; O₂ 23.0%; CO₂ 500 ppm; Ar 0.93% | Adopt |
| CD-03 | Star: G-type, 5,650 K, 0.86 L☉, 0.95 M☉ | Adopt |
| CD-04 | Day length 26.0 h | Adopt |
| CD-05 | Orbit 0.938 AU; year 314 local days (340.5 Earth days); obliquity 21° | Adopt |
| CD-06 | One moon, ~1.5 m bay spring tides | Adopt (else Z6 is re-derived) |
| CD-07 | Production calendar: twelfths T1–T12, numbered only | Adopt for production; native month names OPEN |
| CD-08 | Biome BIOME-P001 "Long-Water Mosaic" as specified (location relative to known places OPEN) | Adopt |
| CD-09 | Fauna root lane (20 morphemes) into THY-WORLD-NAMING-LEXICON-001 | Adopt |
| CD-10 | S01 DROVESK | Adopt |
| CD-11 | S02 SORRVIRR | Adopt |
| CD-12 | S03 PLENNIT | Adopt pending trademark check |
| CD-13 | S04 PLENNREN | Adopt |
| CD-14 | S05 VIRRESK | Adopt |
| CD-15 | S06 VASKRELL | Adopt |
| CD-16 | S07 DROVATH | Adopt |
| CD-17 | S08 VELLSTRAN | Adopt |
| CD-18 | S09 BRUSKOND | Adopt |
| CD-19 | S10 HARLREN | Adopt |
| CD-20 | S11 SORRHALD | Adopt |
| CD-21 | S12 MURRETH (or MURRVETH) | Choose |
| CD-22 | S13 HOLVOND | Adopt |
| CD-23 | S14 THESKIT | Adopt |
| CD-24 | Estate animals: Earth species present on EdereAirah, or native analogues? | Chairman's call. No recommendation, because it defines the Earth/EdereAirah boundary. |
| CD-25 | PLENNIT kept in log hives (semi-domestic) | Adopt |
| CD-26 | THESKIT is a domesticated companion; its relation to ANIMAL-CLASS-WORKING-DOG (separate animal) | Adopt as a separate animal |
| CD-27 | Plant working-label set WL-1…WL-9 as the biome's flora (plant names stay OPEN for the plant naming lane) | Adopt |

### 20.2 · Operational decisions (6, not canon)

| ID | Decision | Recommendation |
|---|---|---|
| OD-01 | Wildlife Refuge & Return (607) owns this lane in-world | Yes |
| OD-02 | Visual direction first: VD-1, VD-2 or VD-3 | VD-2 (single subject; fewest geometry dependencies; uses VISUAL-002 on file) |
| OD-03 | First episode | EP-2 "Heart Height" (lowest cost; pairs with PRD-02; no legal-gate blocker, unlike EP-3) |
| OD-04 | Earth business: first market; operate directly vs license the method | Choose a market; start operate-direct for evidence |
| OD-05 | Store product order | PRD-01 (digital, no supplier) → PRD-03 → PRD-02 (CPSIA) |
| OD-06 | Clear S14 THESKIT as Lane B's first urban animal | After CD-26 |

---

## 21 · DEPARTMENT RETURN FORMAT

**1 · CURRENT TRUTH**
- Lane A has drafted a complete PROPOSED native animal-life system: planetary physics, one biome, 14 species, migration, care, media, store, an Earth business, visuals and money paths.
- **Nothing is canon.** Nothing was written to the backend. Nothing is live in the store. No visual was generated.
- The 7 recovered estate rows are unchanged.

**2 · WHAT WAS RECOVERED**
- 7 `thylora_estate_animal_groups` rows (all headcounts null; care, vet and retirement fields OPEN).
- `THY-TRANS-WILDLIFE-607` (DESIGN_ONLY; species and staff OPEN; release equation).
- The `THY-PLANT-NAME-CANDIDATES-596` naming precedent.
- The confirmed absence of any planetary physics canon.
- Lane B's dependency on Lane A for an urban animal.

**3 · WHAT WAS CREATED**
- The physics proposal (§4) and 19 equations to the MATH RULE (§5).
- BIOME-P001 (§6: 7 zones, 12 dimensions).
- Derivation layers (§7).
- The fauna root lane (§8).
- 14 species × 24 fields (§9).
- The food web (§10).
- 11 migration rules + a T1–T12 calendar + map logic (§11).
- A care-cycle template, care tiers and the 607 mapping (§12).
- 3 episodes (§13), 3 store products (§14), the Earth business (§15), 3 visual directions (§16), 23 money paths (§17).
- Evidence and unknowns (§18), a 14-item later register (§19), 27 + 6 decisions (§20), and the backend packet (§22).

**4 · NUMBERS / QUANTIFIED MOVEMENT**
- Species fields drafted: **336 / 336** (14 × 24). Minimum required: 288.
- Deliverables drafted: **11 / 11**.
- Equations with full MATH RULE blocks: **19 / 19**.
- Canon decisions made: **0 / 27**.
- Backend rows written: **0 / 38 proposed** (see §22 count).
- Visuals at min ≥ 4: **0 / 3**.
- Store products live: **0 / 3**.
- Key physics results:
  - Isometric land-mass ceiling ×1.385.
  - VELLSTRAN heart pressure 244 mmHg (bound 300).
  - BRUSKOND bone safety factor 13.4; intake 60.7 kg DM per local day.
  - Hover cost −19% vs Earth.
  - Insect size ceiling ×1.24.
  - HOLVOND dive limit 23 min.
  - SORRHALD population 810–1,418.
  - Earth business Π_m ≈ $2,614 per month (ESTIMATE).

**5 · FILES / ASSETS / RECORD IDs**
- File: `/home/user/Thylora/workrooms/WR-PROD-FLOOR-001/LANE-A-ANIMAL-LIFE.md` (this file).
- Proposed IDs:
  - `THY-PLANET-PHYS-P001`, `THY-BIOME-P001`, `THY-FAUNA-P001-01…14`, `THY-FAUNA-NAME-CANDIDATES-P001`, `THY-FAUNA-ROOTS-P001`.
  - Equations `THY-EQ-FAUNA-E01…E17`.
  - Products `THY-FA-P001-ATLAS-PDF`, `THY-KIT-P001-HEART`, `THY-EARTH-CARE-P001-DECK`.
- **None exist in the backend yet.**

**6 · WHAT IS STILL UNKNOWN**
U-01…U-13 (§18.2), chiefly:
- disease ecology;
- tissue chemistry and metabolic scaling on EdereAirah;
- the settlement interface;
- the wildlife-law authority;
- the biome's location;
- four predator classes;
- Earth prices and licensing specifics.

**7 · BLOCKERS**
- (a) Chairman canon decisions CD-01…CD-27.
- (b) Target-table column schemas not read (`VERIFY_BEFORE_APPLY`).
- (c) Store release gate (`active_allowed = false`, checkout witness 0).
- (d) POD supplier not selected.
- (e) 607 legal authority OPEN.
- (f) Lane A has no web access, so citations are unverified.

**8 · SAFE WORK ALREADY CONTINUING**
- **No background process is running.** This lane finished in one pass.
- Safe to run next without the Chairman: L-01 (read the unread ecology tables), L-05 (collision search), L-07 (citation verification), drafting PRD-01 and PRD-03 text, and the M-09 family chart. Each has an owner in §19. L-06 (arithmetic re-check) was executed in this session.

**9 · CHAIRMAN DECISIONS NEEDED**
- 27 canon decisions (§20.1) + 6 operational decisions (§20.2).
- Highest leverage: CD-01/CD-02 (every species depends on them) and CD-24 (the Earth/EdereAirah boundary).

**10 · NEXT 3 ACTIONS**
1. Chairman rules on CD-01…CD-07 (physics). One table, §4.
2. Backend-read session executes L-01 and reads column schemas for the §22 targets.
3. Lane A (or the IP & Media Rights role) runs L-05 (name collision search) and L-07 (citation verification), then finalizes §22 for import. L-06 arithmetic re-check is already done.

**11 · HELP VALUE**
- Free pet-care literacy with hard-stop vet referral (§15.4).
- A physics-of-animals curriculum.
- Wildlife-safety guidance (don't handle wildlife; report strandings).
- No medical claims anywhere.

**12 · EARTH VALUE**
- A method (Care-Cycle Card) exported from the world to Earth homes.
- Real Earth science taught through a consistent other world.
- Measurable Earth evidence (§15.7) that returns to improve the world method.

**13 · COMMERCE / MONEY PATH**
- 23 paths (§17).
- Nearest revenue: PRD-01 digital atlas (no supplier dependency) and the Earth service (Π_m ≈ $2,614 per month ESTIMATE, needs OD-04).
- The simulation currency REE is never mixed with Earth money.

**14 · MEDIA / STORY PATH**
- EP-1 "The Crossing", EP-2 "Heart Height" (recommended first), EP-3 "The Return".
- Every episode starts from world-state, uses no invented people, and puts real math on screen.

**15 · EDUCATION PATH**
- 14 kid-learning derivatives (F22).
- A teacher unit (M-08).
- Library workshops (S-4).
- Physics kits (PRD-02, Cartesian diver, glider).

**16 · SOFTWARE PATH**
- `fauna` and `fauna_movement` resources as API v1.1 (not in Lane C's minimum v1 cut).
- A dashboard migration-map widget driven by §11.3.
- A Care-Cycle planner (web app) for the Earth service.

**17 · STORE PATH**
PRD-01 → PRD-03 → PRD-02 (OD-05). All QUEUED behind the store release gate. Lane D navigation doors: I'M A PARENT, I'M A TEACHER, I'M A STUDENT, I NEED HELP.

**18 · RISKS**
- Canon drift if PROPOSED values are cited as canon: mitigated by tagging every value.
- Earth/EdereAirah merging (CD-24).
- Non-vet service scope creep into veterinary practice: mitigated by the §15.3 boundary and §15.4 hard stops.
- CPSIA cost on the kids' kit.
- Trademark collisions (PLENNIT/"Plenty", MURRETH/"murre").
- Unverified citations.
- Primate-as-pet misreading: an explicit "not a pet" line on S06/S07.

**19 · EVIDENCE**
EV-01…EV-18 (§18.1). Only EV-01, EV-02 and EV-18 (script re-check) were checked in this session. Everything tagged EARTH-FACT awaits L-07.

**20 · PERCENT COMPLETE (explicit denominator, E19)**

| Gate | Pass? | Evidence |
|---|---|---|
| G1 Existing records recovered | PASS | §2 (from the recovered-state read) |
| G2 Gap analysis | PASS | §3 |
| G3 One biome drafted, 12 dimensions | PASS | §6 |
| G4 ≥ 12 species × all 24 fields | PASS | §9 (336/336) |
| G5 Migration calendar and map logic | PASS | §11 |
| G6 Episodes, products, business, visuals, money drafted | PASS | §13–§17 |
| G7 Evidence and unknowns declared | PASS | §18 |
| G8 Chairman canon decisions made | FAIL | 0 / 27 |
| G9 Backend rows written and read back | FAIL | 0 / 38 |
| G10 A visual direction at min(S, I, G, C) ≥ 4 | FAIL | 0 / 3 |
| G11 A store product live behind a passed release gate | FAIL | 0 / 3 |
| G12 Earth facts, citations and licensing verified | FAIL | 0 / 15 EARTH-FACT items (EV-03…EV-17) |

**PC = 7 / 12 × 100% = 58.3%.** Every pass is a *drafting* pass. **Verified or approved completion is 0 / 5** (G8–G12).

---

## 22 · BACKEND CHANGE PACKET (not applied; for import by a backend-write session)

Rules for the applying session:
1. **READ FIRST**: read each target row and the column schema. The column mapping below is **VERIFY_BEFORE_APPLY** for every table, because Lane A read no schemas.
2. **Never overwrite** a recovered value. Estate patches are **append-only gap notes**.
3. **Write only after Chairman approval** where the truth class is PROPOSED.
4. **Read back** after each write and record the returned IDs.

| # | Table / registry target | Canonical ID | Proposed row / patch (logical fields) | Truth class | Evidence | Blocker | Next action |
|---|---|---|---|---|---|---|---|
| P-01 | `thylora_estate_animal_groups` | ANIMAL-HORSE-001 | APPEND gap note: "Lane A WR-PROD-FLOOR-001: species identity (Earth horse vs native analogue) = CD-24 OPEN; care_cycle template CC-01…CC-10 ready (§12.1); headcount/stable_count/farrier/feed_chain/retirement remain OPEN pending estate-size canon." **No value changes.** | GAP_NOTE | EV-01 | Column for notes unknown (VERIFY_BEFORE_APPLY); CD-24 | Read the schema; find a notes/gap column or use a linked gap table |
| P-02 | same | ANIMAL-HORSE-RIDING-001 | Same note + "remount_standard and escort_mount_allocation await CD-24 and security canon" | GAP_NOTE | EV-01 | same | same |
| P-03 | same | ANIMAL-CLASS-CATTLE | Same note + "whether_cattle_are_kept is a Chairman canon decision; not inferred" | GAP_NOTE | EV-01 | same | same |
| P-04 | same | ANIMAL-CLASS-SHEEP | Same pattern (wool_route OPEN) | GAP_NOTE | EV-01 | same | same |
| P-05 | same | ANIMAL-CLASS-PIG | Same pattern | GAP_NOTE | EV-01 | same | same |
| P-06 | same | ANIMAL-CLASS-POULTRY | Same pattern | GAP_NOTE | EV-01 | same | same |
| P-07 | same | ANIMAL-CLASS-WORKING-DOG | Same pattern + "THESKIT (THY-FAUNA-P001-14) is PROPOSED as a separate native companion; it does not replace this row (CD-26)" | GAP_NOTE | EV-01 | same | same |
| N-01 | `thylora_world_design_records` | THY-PLANET-PHYS-P001 | {title: "EdereAirah planetary physics (PROPOSED)", g: 8.80 m/s², R: 6,100 km, M: 4.906e24 kg, P0: 111.5 kPa, O2: 23.0 %, CO2: 500 ppm, star: G 5,650 K 0.86 Lsun 0.95 Msun, d: 0.938 AU, day: 26.0 h, year: 314 local d, obliquity: 21°, moon: 1 (PROPOSED), state: APPROVAL_REQUIRED, source: WR-PROD-FLOOR-001/LANE-A §4} | PROPOSED | §4, E1–E4 | CD-01…CD-07; schema VERIFY | Chairman ruling, then insert |
| N-02 | `thylora_world_design_records` (or `thylora_living_world_records` if L-01 shows it is the biome home) | THY-BIOME-P001 | {label: "Long-Water Mosaic" (working), zones Z1–Z7 with grid, rainfall table, temperature table, soils, constraints EC-1…EC-10, location: OPEN, state: APPROVAL_REQUIRED} | PROPOSED | §6 | CD-08; L-01 | Resolve the table after L-01 |
| N-03 | **NEW** `thylora_world_fauna_registry` (proposed name) | THY-FAUNA-P001-01 … -14 (14 rows) | Per row: {fauna_id, biome_id: THY-BIOME-P001, native_name_candidate, pronunciation, root_meaning, working_label, earth_reference, size_metric, size_us, mass_kg, mass_lb, lifespan_local_yr, diet, social, reproduction, movement, range, habitat_zones, predators, prey, role, sleep, communication, care_needs, threats, appearance, physical_basis_eq_refs, media, kid_derivative, store_derivative, earth_care_derivative, canon_state: PROPOSED, source_file} from §9 | PROPOSED | §9 | CD-10…CD-23; the table does not exist; DDL needs approval | Draft DDL; approval; create; insert; read back |
| N-04 | **NEW** `thylora_world_fauna_movement` (proposed) | THY-FAUNA-MOVE-P001-{species}-{T} | {fauna_id, twelfth (1–12), zone_code, state_code, rule_id (MR-1…MR-11), confidence: PROPOSED} from §11.2 | PROPOSED | §11 | N-03 first | Insert after N-03 |
| N-05 | Same table that holds `THY-PLANT-NAME-CANDIDATES-596` (table name not in the recovered state → VERIFY) | THY-FAUNA-NAME-CANDIDATES-P001 | {14 candidates + MURRVETH alternate, pronunciation, roots, collision flags, guards (596 guards + no Earth-language disguise), state: PROPOSED none canon} | PROPOSED | §8 | CD-09…CD-23; table unknown | Locate the 596 record's table |
| N-06 | `THY-WORLD-NAMING-LEXICON-001` (patch; table VERIFY) | THY-FAUNA-ROOTS-P001 | APPEND proposal: fauna root lane (20 morphemes, §8.1). Do not alter existing lanes. | PROPOSED | §8.1 | CD-09 | Read the lexicon record |
| N-07 | `thylora_math_equation_registry` (32 rows) | THY-EQ-FAUNA-E01 … E17 | Per equation: {name, class, equation text, symbols, units, domain, threshold, assumptions, failure, worked example}. **Check for existing duplicates first** (e.g. whether 607's release equation or Vc is already registered). E18/E19 are business/lane metrics and may be excluded. | PROPOSED (EARTH-FACT basis) | §5 | Duplicate check; schema | Query the registry for matching names |
| N-08 | `thylora_world_earth_transmission_packets` | THY-TRANS-WILDLIFE-607 | APPEND note: "Candidate species for first story: HOLVOND calf (EP-3) or VELLSTRAN (EP-2); gate-input mapping in LANE-A §12.3; staff remain UNNAMED SLOTs; legal gate authority OPEN." **Do not change** species OPEN or the equation. | GAP_NOTE / PROPOSED | §12.3 | OD-01 | Append after approval |
| N-09 | `products` / `thylora_store_shelves` | THY-FA-P001-ATLAS-PDF, THY-KIT-P001-HEART, THY-EARTH-CARE-P001-DECK | {title, price ESTIMATE, cost ESTIMATE, state: QUEUED_WITH_DEPENDENCY, active: false, dependency list from §14} | PROPOSED | §14 | Store release gate; supplier; CPSIA | Lane D reviews |
| N-10 | `thylora_workroom_registry` | WR-PROD-FLOOR-001 (lane A artifact) | APPEND artifact reference: path of this file; state DESIGN_COMPLETE_AWAITING_APPROVAL; PC 7/12 | DESIGN | This file | Registry schema VERIFY | Parent session registers |
| N-11 | `thylora_departments` (67 rows) | *Conditional:* Wildlife Refuge & Return department row | Only if L-01 shows no such department exists: {name: "Wildlife Refuge & Return" (working; EdereAirah name OPEN), state: chairman_review_required} | PROPOSED | 607 packet | OD-01; existence check | Query departments by name first |

**Row count for G9:** 7 patches (P-01…P-07) + N-01 + N-02 + 14 (N-03) + N-05 + N-06 + N-08 + 3 (N-09) + N-10 = **30 committed rows**, plus N-04 movement rows (proposed at 8 selected species-twelfth checkpoints for the first import: S10 T4/T9/T3, S13 T8/T1, S04 T9/T3, S09 T10) = **38 rows**. N-07 equation rows (17) and N-11 are counted separately once their duplicate and existence checks run.
