# Vehicle civilization — engineering findings in plain language

Every number in this document is engineering reasoning. None of it is test
evidence. Nothing here has been built, measured or crashed. Where a number is a
target rather than a measurement, it says so.

---

## The two formulas, explained once

### Wind

```
F = ½ · ρ · Cd · A · v²
```

Wind pushes with a force that depends on four things:

- **ρ (rho)** — how thick the air is. About 1.225 kilograms per cubic metre at
  sea level.
- **Cd** — how much the shape fights the air. A slab-sided van hit from the side
  is about 1.1.
- **A** — how big the face is that the wind is hitting.
- **v** — how fast the air is moving.

The speed is **squared**. That one detail governs everything. Double the wind
speed and the push goes up **four times**, not two. A 90 km/h gust does four
times the work of a 45 km/h gust on the same vehicle.

It also works in our favour. If a bridge barrier takes 30% off the wind speed,
it takes **51%** off the push on the vehicle, because 0.7 × 0.7 = 0.49. That is
the whole argument for porous wind barriers in one line.

### Grip

```
F_available = μ · N
```

The most grip the road can give you is how sticky it is (**μ**, mu) multiplied by
how hard the vehicle presses down (**N**, which is mass × gravity).

Two things follow, and both matter:

1. **That grip is a budget.** Braking, turning and accelerating all spend from
   the same account. Brake at the limit and turn at the same time, and you have
   overspent. The tire slides.
2. **Adding wheels does not add grip.** N is the weight of the vehicle. The
   weight does not change when you add wheels. This single sentence is the
   answer to the four-versus-six question.

---

## Four wheels or six?

**The instruction was: do not assume six wheels are safer. They are not.**

Neither grip nor rollover resistance depends on how many wheels a vehicle has.

- **Grip** is μ × N, and N is the weight. Six wheels, same weight, same grip.
- **Rollover** is governed by `SSF = t ÷ (2h)` — track width divided by twice the
  centre-of-gravity height. Wheel count does not appear in that equation either.

What actually makes the flagship van safe is that it is **wide and low**:

| | Flagship van | Typical SUV |
|---|---|---|
| Track width | 1,780 mm | ~1,620 mm |
| Centre of gravity height | 620 mm | ~720 mm |
| **Rollover number (SSF)** | **1.44** | **1.10 – 1.20** |

About **27% more rollover margin**, and none of it comes from wheel count.

A tandem rear axle would have:

- destroyed the flat low floor the brief requires,
- added ~180 kg of mass high in the rear, making the rollover number slightly
  *worse*,
- added two more tires that can fail,
- scrubbed in tight turns,
- and cost more to service for the life of the vehicle.

**Verdict: four wheels.** Six wheels are kept for one case only — the armored
derivative, where rear axle load passes **2,400 kg** and a single axle genuinely
runs out of tire and brake capacity. That is a real threshold, not a preference.

---

## Hydroplaning — the biggest number in the programme

Stopping distance from 100 km/h, flagship van:

| Surface | μ | Stopping distance |
|---|---|---|
| Dry asphalt | 0.9 | **44 m** |
| Wet asphalt | 0.7 | **56 m** |
| Standing water, hydroplaning | 0.1 | **393 m** |

**393 metres. Nine times the dry distance — and no steering either.**

Hydroplaning onset speed is roughly `V(km/h) ≈ 6.36 × √(pressure in kPa)`:

| Tire pressure | Hydroplanes at about |
|---|---|
| 200 kPa | 90 km/h |
| 240 kPa | 99 km/h |
| 300 kPa | 110 km/h |

Two widely believed things are **false**, and rejecting them changes the design:

- **Wider tires are not safer in rain.** Width is not in the equation. Contact
  pressure is.
- **A heavier vehicle does not resist hydroplaning.** It makes a bigger
  footprint at the same pressure, and hydroplanes at about the same speed.

Only three things work: **tire pressure**, **tread depth**, and **how deep the
water on the road is**. The vehicle owns the first two. The road owns the third —
which is why road engineering is inside this vehicle programme and not in some
other department's folder.

---

## What the road has to do

| Requirement | Target |
|---|---|
| Cross slope, normal | ≥ 2.0% |
| Cross slope, high-rainfall corridors | 2.5% |
| Max sheet-flow path before interception | 20–25 m |
| Surface texture (mean profile depth), high speed | ≥ 0.9 mm |
| Surface texture, absolute minimum | 0.7 mm |
| Grooving required on grades steeper than | 3% |
| Rut depth before intervention | 10 mm |

The rut limit is the one that gets skipped. A rut is a channel that holds water
exactly where the tire runs. It turns a well-drained road into a local
hydroplaning site while every other measurement still reads fine.

### Bridge wind barriers: porous, and tapered at the end

- Porosity **30–40%**, not solid.
- Height **≥ 2.5 m** for light vehicles, **4.0 m** for high-sided, subject to
  site wind measurement.
- **Taper the last 40–60 m.** Do not just stop the barrier.

A solid barrier can cut the average wind just as well and still be more
dangerous, because it ends in a **step** — sheltered to fully exposed in about
one vehicle length. That step is where crosswind incidents happen.

Two things that get forgotten and belong in the same decision: a barrier must
not block the deck drainage, and it must not cast a shade line that holds ice on
the carriageway after the rest of the deck has thawed.

---

## Crosswind: it is a steering problem, not a tipping problem

A 90 km/h gust on the side of the flagship van:

```
F = ½ × 1.225 × 1.1 × 8.5 × 25²  =  3,579 N  ≈  3.58 kN
```

That is about **12% of the vehicle's weight**, which sounds alarming. It is not:

- Overturning moment: 2,219 N·m
- Restoring moment: 26,629 N·m
- **Margin: 12 to 1.** This van does not blow over.

What it does is **yaw**. On a short blunt nose, the aerodynamic centre of
pressure sits *ahead* of the centre of gravity, so a gust turns the nose and the
driver has to catch it.

So the fixes must be directional, and two intuitive answers are wrong:

| Fix | Verdict |
|---|---|
| Rear side surface + rear vertical fence, to move the pressure centre back | **Primary fix** |
| Same-phase rear steering at speed | **Secondary fix** |
| Stability control tuned for gust rejection | **Third layer** |
| Make it narrower | **Rejected** — the side area *is* the interior the brief asks for |
| Make it heavier | **Rejected** — buys a little gust rejection, pays in brake heat, tire load and harm to whatever it hits |

---

## Rear steering: approved, on one condition

| | Turning circle | Crosswind | Failure |
|---|---|---|---|
| No rear steer | 12.9 m | — | none |
| Electronic centring only | 11.3 m | good | **jams wherever it was** |
| Mechanical centring + redundant sensing + independent lock | 11.3 m | good | fails to centre and locks |

Up to 5° opposite phase below 25 km/h; up to 1.5° same phase above 70 km/h.

**The whole decision is the failure mode.** A 3-tonne van permanently crabbing
at speed is a loss-of-control condition, not an inconvenience. Rear steer is
approved **conditionally**, and the condition is a proof of fail-to-centre that
does not exist yet.

## Active aero: prefer the solution whose broken state is boring

| Device | Worst failure | Verdict |
|---|---|---|
| Grille shutters | Stuck closed → overheating, detectable, derate | **Approve** |
| Ride height lowering above 100 km/h | Stuck low → kerb strikes. Stuck high → baseline vehicle | **Approve** |
| Active rear yaw device | Stuck deployed → permanent uncommanded steering input | **Defer** |
| Active front dam | Stuck deployed → low obstruction, front balance shift | **Reject** |

**Binding rule for all THYLORA vehicles: no active aerodynamic device may have a
failure state that increases yaw sensitivity.** Rear steering solves the
crosswind problem with a failure mode that can be engineered safe. The active
yaw device does not.

---

## Centre of gravity: the energy choice is a safety choice

```
h = Σ(mᵢ × hᵢ) ÷ Σ(mᵢ)        then        SSF = t ÷ (2h)
```

Flagship van:

| | Mass | Height |
|---|---|---|
| Body, interior, occupants | 2,570 kg | 0.68 m |
| Battery pack | 480 kg | 0.30 m |
| **Combined** | **3,050 kg** | **0.620 m** |

| Variant | CG height | SSF |
|---|---|---|
| Battery electric | 0.620 m | **1.44** |
| Hybrid (same body) | 0.700 m | **1.27** |

**This has not been written down anywhere in the canon before.** The energy
architecture is a rollover safety decision, not just a range decision. Two
versions of the same vehicle, same badge, meaningfully different rollover
margin.

The honest response is to **permit the hybrid and disclose the difference** —
not to quietly sell them as the same vehicle.

Hydrogen is held at research only for these three vehicles, and the reason is
**packaging, not the fuel**: high-pressure cylindrical tanks are fundamentally
hostile to the low flat floor that defines the flagship and the modular
platform. It should be revisited for heavy haul and logistics, where the low
floor is not a requirement and fast refuelling is worth more.

---

## Filters: the cabin filter is a safety item

Rule: **replace at twice the clean pressure drop, or at the stated limit,
whichever comes first.** Distance intervals are wrong in both directions — a
filter in a dusty place fills up far faster than the same filter somewhere clean.

| Filter | Clean | Replace at | Class |
|---|---|---|---|
| Cabin air | 60–90 Pa | 150–180 Pa | **Safety relevant** |
| Battery pack coolant | 8–12 kPa | 20–24 kPa | **Safety relevant** |
| Engine intake (hybrid only) | 1.0–1.5 kPa | 2.5 kPa | Reliability |
| HVAC recirculation | 40–60 Pa | 110 Pa | Comfort and health |

A clogged cabin filter cuts demist and defrost airflow. **A driver who cannot
clear the windscreen cannot see.** That makes it a visibility failure, not a
comfort inconvenience — and filing it under comfort is exactly why it gets
deferred in a busy service bay.

Access target: **cabin filter reachable in 2 minutes, no tools, no structural or
safety component removed.**

---

## Magnetic and inductive roads: research only, and barred from assumptions

The concept is real. The problem is that efficiency falls away fast with lateral
misalignment and air gap, cost per lane-kilometre is unresolved, and the road
itself freezes, cracks, ruts and has to be dug up.

**No vehicle programme may assume road-delivered power** in its range, duty cycle
or charging figures. A programme that quietly depends on it fails completely if
the road never gets built — and nobody can yet say whether it will be.

One hazard deserves recording plainly rather than as a footnote, because it is a
risk to people on foot: **a steel object lying on the road above an energised
coil heats up**, and someone may pick it up.

Conductive rail remains worth considering for the internal site mobility network,
where the route is fixed and the environment is controlled.

---

## Aviation: a separate gate, and it is needed now

**An aircraft cannot borrow a car crash test.** Evidence does not cross between
ground and air programmes in either direction.

Guardian Flight is currently recorded `ACTIVE_DESIGN` while simultaneously
holding blockers stating there is no aerodynamic validation, no certification
path and no prototype. That combination is exactly how an escort capability gets
talked about as though it exists.

The gate is binding:

- No flight performance, range, endurance or escort claim without an
  airworthiness basis.
- No imagery depicting a THYLORA aircraft in operation, in escort, or carrying
  people, while the programme stands where it does.
- In-flight structural support, replacement-wing load transfer and fuel transfer
  remain research only.
- Human priority is passengers and crew, ahead of airframe recovery and ahead of
  mission completion.

---

## The one thing the vehicle cannot fix by itself

The flagship van is **2,080 mm wide**, about **2,380 mm mirror to mirror**. The
rollover margin and the interior space both come from that width.

| Lane width | Assessment |
|---|---|
| 3.50 m | Comfortable — the assumed corridor standard |
| 3.30 m | Acceptable |
| Under 3.15 m | Genuinely tight with opposing traffic |

The direction to design roads around human comfort rather than forcing the
vehicle into old road assumptions is the correct instruction. This record is what
makes it **checkable**: the vehicle is authorised on the assumption that a 3.50 m
lane standard with a usable shoulder gets published and built.

If that standard is never adopted, the wide vehicle is not automatically unsafe —
but its operating envelope has to be **restated**, not assumed. That is a
Chairman decision, not an engineering one.
