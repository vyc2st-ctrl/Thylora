# Two-process sleep model

A parameterised implementation of Borbély's two-process model of sleep
regulation, plus a chart and a CSV export.

- `two_process_model.py` — the model, a CLI, the plot and the CSV writer.
- `test_two_process_model.py` — tests (standard library only).

The simulation core has no third-party dependencies. `matplotlib` is imported
lazily and is only needed for `--plot` / `--show`.

## The model

**Process S — homeostatic sleep pressure.** Rises toward the ceiling `s_max`
while awake with time constant `tau_wake`, decays toward zero while asleep with
time constant `tau_sleep`. Each step uses the exact solution of the relaxation,

    awake:  S ← s_max − (s_max − S)·exp(−Δt / tau_wake)
    asleep: S ← S·exp(−Δt / tau_sleep)

so the step size limits only how precisely a bed-time/wake-time transition is
located, not the accuracy between transitions.

**Process C — the circadian oscillator.**

    C(t) = amplitude · sin(2π (t − phase) / tau)

`tau` is the *intrinsic* period (24.2 h by default), which is deliberately not
24 h: against a fixed 24 h schedule the oscillator drifts by ~0.2 h per day, so
a multi-day run does not repeat exactly.

**Combination.** C is the *wake-promoting* drive here, so it is subtracted:

    sleep_tendency = S − circadian_weight · C

Higher sleep tendency means a stronger drive to sleep.

The sleep/wake schedule is prescribed (`bed_time`, `wake_time`). This is the
descriptive form of the model: S and C say how sleepy a given schedule leaves
you; they do not decide when sleep starts. The threshold-driven variant — sleep
onset and offset from S crossing circadian-modulated upper and lower thresholds
— is a different model and is not implemented here.

## Usage

```bash
# summary of a 48 h run with the default parameters
python3 sleep-model/two_process_model.py

# chart and data
python3 sleep-model/two_process_model.py --plot sleep.png --csv sleep.csv

# a later chronotype on a shifted schedule, sampled every minute
python3 sleep-model/two_process_model.py \
    --phase 20 --bed-time 1 --wake-time 9 --step-minutes 1 --plot owl.png
```

`--help` lists every parameter. As a library:

```python
from two_process_model import ModelParams, simulate, plot

sim = simulate(hours=72, step_minutes=5, params=ModelParams(tau=24.6, phase=15))
plot(sim, path="72h.png")
print(max(sim.sleep_tendency), sim.sleep_windows())
```

`simulate()` returns a `Simulation` with aligned lists `t`, `circadian`,
`homeostatic`, `sleep_tendency` and `asleep`, plus `sleep_windows()`.

## Tests

```bash
python3 -m unittest discover -s sleep-model -t sleep-model
# or: npm run test:sleep-model
```

The tests cover the sleep-window predicate (overnight, daytime and wrapped
hours), the circadian period/phase/amplitude, S against the analytic solution,
its bounds and its peak at bed time and trough at wake time, step-size
insensitivity, warm-up convergence, the combination rule, and the CSV shape.

## Notes on the parameters

**Warm-up.** By default the run is preceded by 96 unsampled hours so the output
starts on the schedule's own rhythm instead of on the arbitrary `s0`. One
simulated day shrinks an error in S by about a factor of 20 for the default time
constants, so a single day of warm-up still leaves a visible transient — hence
four. Pass `--warmup-hours 0` to watch the transient from `s0` decay.

**Phase and the shape of the combined curve.** With the default `phase = 17`,
C peaks near 23:00 — the wake-promoting drive is highest at bed time — so sleep
tendency peaks around midday and is lowest around 02:00. That is the arithmetic
of those numbers, not a bug, but it is the opposite of the usual physiological
picture. For the conventional shape (an evening wake-maintenance zone and
peak sleepiness in the early-morning hours) put C's peak in the late afternoon:
its maximum is at `phase + tau/4`, so `--phase 11` peaks near 17:00 and troughs
near 05:00.

**S never approaches 1.** With `tau_wake` equal to the 16 h of wake time, S
recovers only ~63% of the gap to `s_max` each day and cycles between roughly
0.09 and 0.67. Shorten `tau_wake` or lengthen the waking day to push it higher.

## Chart

Three-series line chart, one y-axis. Colors are slots 1–3 of the validated
categorical palette (blue `#2a78d6`, orange `#eb6834`, aqua `#1baf7a`), which
clear the all-pairs colorblind and normal-vision separation gates; aqua sits
below 3:1 against the light surface, so every series is also directly labelled
at the right edge and the CSV export serves as the table view. Sleep episodes
are shaded, the grid and axes stay recessive, and labels wear ink colors rather
than series colors.
