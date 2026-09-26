# H · Engineering

## H1 · Service Cluster Engineering (`THY-IDEA-SERVICE-CLUSTER-ENGINEERING-001`)

**Rule:** when a primary service operation exposes adjacent wear areas, inspect them against an evidence list. **Don't replace good parts automatically.** Every replacement needs a finding.

```
primary operation ─► access state (what is now exposed) ─► cluster evidence list ─► measure/observe each item
                                                                  │
                           ┌──────────────────────────────────────┼─────────────────────────────┐
                           ▼                                      ▼                             ▼
                      WITHIN SPEC → record + leave           MARGINAL → record + predict    OUT OF SPEC → replace with finding
```

### Prototype cluster: oil service
| Exposed item | Evidence to collect | Replace only if |
|---|---|---|
| oil filter | always replaced (primary op) | — |
| drain plug + washer | thread condition, washer crush state | washer is single-use per maker spec, or threads are damaged |
| drain interface / pan | seep marks, pan flatness | active leak or deformation |
| drained oil | colour, metal flake (magnet), fuel smell, coolant milkiness | a finding triggers a *diagnosis*, not a parts swap |
| accessible belts / hoses | cracks per cm, glazing, soft spots | beyond wear criteria |
| underbody boots / bushings | tears, grease fling | torn |
| fluid levels (coolant, brake) | level + condition test | out of spec |

**Next-service prediction:** each MARGINAL item gets a predicted interval from its measurement and wear rate. The prediction travels with the vehicle record (Nahla's packet: *the maintenance record travels with the vehicle*).

**Receipt:** items inspected, measurement, verdict, replaced (with reason) or left (with reason). An item not inspected is listed as NOT_INSPECTED, never as OK.

## H2 · Layer-Shear / Peel-Glide: **candidate pattern, not validated**

**Observation (Chairman):** stacked cheese slices separated by interleaf sheets. The layers slide over each other under shear and peel apart cleanly under a low-angle pull, while the stack stays together under normal load.

**Candidate mechanism:** thin layers with a low-friction interleaf give low shear resistance and low peel force along a chosen plane, while normal compression and in-plane tension stay high. It's a designed weak plane.

| Candidate use | Hypothesis | First test | Pass / fail signal |
|---|---|---|---|
| Service panels | a panel skin that peels along a designed plane gives tool-free access without breaking clips | peel force vs angle on sample laminates | consistent peel force within ±15 %, no tearing of the base layer over N cycles |
| Wear skins | a sacrificial outer layer that shears off under abrasion protects the substrate and shows wear | abrasion rig; measure substrate loss | substrate loss lower than an unlayered control |
| Garments | a shear layer between the shell and the lining reduces friction and wear at pressure points | rub test on sleeve/heel analogues | fewer abrasion cycles to failure at the lining |
| Packaging | an interleaf lets single portions separate cleanly | peel test on stacked portions | clean single-portion separation rate |
| Mechanisms | layered shims as a controlled slip/fuse plane | shear-to-release under load | release within the design band, repeatable |

**Rule:** no use case is described as working, safe or better until its test runs and is recorded. Claims stay `HYPOTHESIS` in `thylora_world_infrastructure_blueprints`-style records until then. Food-contact and garment-contact interleaf materials also need material-safety evidence.
