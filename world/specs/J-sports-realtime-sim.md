# J · Sports real-time sim: generic QB / RB / receiver / blocker timing

Idea `THY-IDEA-SPORTS-REALTIME-SIM-001` · code `world/lib/sports-timing.js` · **synthetic players only** (every player carries `synthetic: true`; no named athlete, team or league).

## Decision inputs (all per player)
skill · position knowledge · adjacent-position knowledge · coaching · fatigue · confidence · anxiety · history · field state · physics · opponent · bounded chance

`effective(p) = (0.45·skill + 0.25·position + 0.10·adjacent + 0.20·coaching) × (1 + 0.15·(confidence − anxiety)) × (1 − 0.35·fatigue)`

The weights are **first-cut and uncalibrated**. They are there so the structure can be tested, not as a claim about real football.

## One play
```
SNAP
 ├─ pocket window = min over blockers of holdTime(blocker vs rusher)       (bounded noise ±0.2 s, floor 1.2 s)
 ├─ QB drop time  = 1.1 − 0.2·effective(QB)
 ├─ progression: each read costs 0.9 − 0.4·effective(QB) seconds
 │     separation(receiver vs defender, t) from kinematics (accel → top speed, fatigue, wet field) + route craft
 │     throw if separation > 1.0 + 1.5·anxiety − 0.8·confidence   (anxious QBs need more open receivers)
 │     completion p = clamp(0.35 + 0.35·effective(WR) + 0.1·min(sep,3) − wet penalty)  → seeded roll
 ├─ no throw before the pocket breaks → check-down to RB only if RB adjacent_knowledge ≥ 0.4
 └─ otherwise SACK
applyOutcome: history grows; confidence/anxiety/fatigue shift (a sack costs confidence, a completion adds it)
```
Same inputs and seed → same play (tested). A wet field reduces distance covered (tested).

## Next
1. Add a defender reaction model (zone vs man) using defenders' position/adjacent knowledge.
2. Add RB run-path timing against blockers (a hole-open window).
3. Calibrate the weights against **public aggregate** timing data (e.g. league-wide time-to-throw distributions) before any claim of realism.
4. Named-athlete integration stays out of scope until rights and consent exist.
