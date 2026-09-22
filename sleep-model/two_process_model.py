"""Two-process model of sleep regulation (Borbely).

Sleep pressure is modelled as two independent processes:

* Process S - homeostatic sleep pressure. Rises toward a saturating ceiling
  while awake with time constant ``tau_wake``, decays toward zero during sleep
  with time constant ``tau_sleep``.
* Process C - the circadian oscillator. A sine of intrinsic period ``tau``
  (typically slightly longer than 24 h), positioned by ``phase``.

Sign convention: C here is the *wake-promoting* circadian drive, so the
combined sleep tendency subtracts it:

    sleep_tendency = S - circadian_weight * C

Higher sleep tendency means a stronger drive to sleep. With the default phase
the wake-promoting drive peaks in the late evening, which is why sleep tendency
dips before bedtime even though S is still climbing.

The sleep/wake schedule is prescribed (a fixed bed time and wake time), so this
is the descriptive form of the model: S and C explain how sleepy the schedule
leaves you, they do not decide when sleep starts. The threshold-driven variant,
where sleep onset and offset come from S crossing circadian-modulated upper and
lower thresholds, is a separate model and is not implemented here.

The core simulation is standard library only. matplotlib is imported lazily and
is needed only for ``--plot``.
"""

from __future__ import annotations

import argparse
import math
from dataclasses import dataclass, field
from typing import List

__all__ = [
    "ModelParams",
    "Simulation",
    "asleep_at",
    "circadian",
    "simulate",
]


@dataclass(frozen=True)
class ModelParams:
    """Parameters of the two-process model.

    Times are clock hours (0-24); time constants and periods are in hours.
    """

    # Process C
    tau: float = 24.2          # intrinsic circadian period
    phase: float = 17.0        # chronotype / phase, in clock hours
    amplitude: float = 1.0

    # Process S
    tau_wake: float = 16.0     # pressure builds while awake
    tau_sleep: float = 4.0     # pressure dissipates during sleep
    s_max: float = 1.0         # ceiling S rises toward
    s0: float = 0.3            # S at the start of the warm-up

    # Schedule
    wake_time: float = 7.0
    bed_time: float = 23.0

    # Combination
    circadian_weight: float = 0.35

    def __post_init__(self) -> None:
        if self.tau <= 0:
            raise ValueError("tau must be positive")
        if self.tau_wake <= 0 or self.tau_sleep <= 0:
            raise ValueError("tau_wake and tau_sleep must be positive")
        if self.s_max <= 0:
            raise ValueError("s_max must be positive")
        if not 0 <= self.wake_time < 24 or not 0 <= self.bed_time < 24:
            raise ValueError("wake_time and bed_time must be clock hours in [0, 24)")
        if self.wake_time == self.bed_time:
            raise ValueError("wake_time and bed_time must differ")


@dataclass
class Simulation:
    """Sampled model output. All lists share one index."""

    params: ModelParams
    t: List[float] = field(default_factory=list)            # hours since t=0
    circadian: List[float] = field(default_factory=list)    # process C
    homeostatic: List[float] = field(default_factory=list)  # process S
    sleep_tendency: List[float] = field(default_factory=list)
    asleep: List[bool] = field(default_factory=list)

    def sleep_windows(self) -> List[tuple]:
        """Return ``(start, end)`` hour pairs for the sampled sleep episodes."""
        windows: List[tuple] = []
        start = None
        for time, is_asleep in zip(self.t, self.asleep):
            if is_asleep and start is None:
                start = time
            elif not is_asleep and start is not None:
                windows.append((start, time))
                start = None
        if start is not None:
            windows.append((start, self.t[-1]))
        return windows


def asleep_at(clock_hour: float, wake_time: float, bed_time: float) -> bool:
    """True when ``clock_hour`` falls inside the sleep window."""
    clock_hour %= 24.0
    if bed_time > wake_time:  # overnight sleep, e.g. 23:00 -> 07:00
        return clock_hour >= bed_time or clock_hour < wake_time
    return bed_time <= clock_hour < wake_time  # daytime sleep, e.g. 09:00 -> 17:00


def circadian(t: float, params: ModelParams) -> float:
    """Process C at ``t`` hours."""
    return params.amplitude * math.sin(2.0 * math.pi * (t - params.phase) / params.tau)


def _step(s: float, dt: float, is_asleep: bool, params: ModelParams) -> float:
    """Advance S by ``dt`` hours.

    Both branches are the exact solution of the relaxation over an interval in
    which the sleep state does not change, so the step size only limits how
    precisely state transitions are located, not the accuracy in between.
    """
    if is_asleep:
        return s * math.exp(-dt / params.tau_sleep)
    return params.s_max - (params.s_max - s) * math.exp(-dt / params.tau_wake)


def simulate(
    hours: float = 48.0,
    step_minutes: float = 5.0,
    params: ModelParams | None = None,
    warmup_hours: float = 96.0,
) -> Simulation:
    """Run the model over ``[0, hours]``, sampled every ``step_minutes``.

    ``warmup_hours`` of simulation before t=0 lets the influence of ``s0`` decay
    so the returned window starts on the schedule's own rhythm rather than on an
    arbitrary initial condition. Each simulated day contracts the error in S by
    ``exp(-wake_hours / tau_wake - sleep_hours / tau_sleep)``, about a factor of
    20 for the defaults, so the four-day default leaves S at its steady cycle to
    within ~1e-5. Pass ``0`` to see the transient from ``s0`` instead.
    """
    params = params or ModelParams()
    if hours <= 0:
        raise ValueError("hours must be positive")
    if step_minutes <= 0:
        raise ValueError("step_minutes must be positive")
    if warmup_hours < 0:
        raise ValueError("warmup_hours must not be negative")

    dt = step_minutes / 60.0
    steps = int(round((hours + warmup_hours) / dt))
    t0 = -warmup_hours

    sim = Simulation(params=params)
    s = params.s0
    for i in range(steps + 1):
        t = t0 + i * dt
        if i > 0:
            # The sleep state is read at the midpoint of the interval just
            # traversed, which halves the error of locating a transition.
            s = _step(s, dt, asleep_at(t - dt / 2.0, params.wake_time, params.bed_time), params)
        if t < -1e-9:
            continue
        c = circadian(t, params)
        sim.t.append(t)
        sim.circadian.append(c)
        sim.homeostatic.append(s)
        sim.sleep_tendency.append(s - params.circadian_weight * c)
        sim.asleep.append(asleep_at(t, params.wake_time, params.bed_time))
    return sim


# --- output -----------------------------------------------------------------

# Categorical slots 1-3 of the validated default data-viz palette, light mode.
_SERIES = ("#2a78d6", "#eb6834", "#1baf7a")
_SURFACE = "#fcfcfb"
_INK = "#0b0b0b"
_INK_SECONDARY = "#52514e"
_GRID = "#e6e5e1"
_SHADE = "#f0efec"


def _clock(hour: float) -> str:
    """Format a clock hour as HH:MM."""
    minutes = int(round(hour % 24 * 60)) % (24 * 60)
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def plot(sim: Simulation, path: str | None = None, show: bool = False) -> None:
    """Render the three curves as a line chart."""
    import matplotlib

    if not show:
        matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(10, 5), dpi=160)
    fig.patch.set_facecolor(_SURFACE)
    ax.set_facecolor(_SURFACE)

    for start, end in sim.sleep_windows():
        ax.axvspan(start, end, color=_SHADE, lw=0, zorder=0)
    ax.axhline(0, color=_GRID, lw=1, zorder=1)

    series = (
        ("Circadian C", sim.circadian),
        ("Homeostatic S", sim.homeostatic),
        ("Sleep tendency", sim.sleep_tendency),
    )
    for (label, values), color in zip(series, _SERIES):
        ax.plot(sim.t, values, color=color, lw=2, solid_capstyle="round", label=label, zorder=3)
        # Direct labels carry ink colors; the line beside them carries identity.
        ax.annotate(
            label,
            xy=(sim.t[-1], values[-1]),
            xytext=(6, 0),
            textcoords="offset points",
            va="center",
            fontsize=9,
            color=_INK_SECONDARY,
            annotation_clip=False,
            zorder=4,
        )

    ax.set_xlim(sim.t[0], sim.t[-1])
    ticks = [h for h in range(int(sim.t[0]), int(sim.t[-1]) + 1) if h % 6 == 0]
    ax.set_xticks(ticks)
    ax.set_xticklabels([_clock(h) for h in ticks])
    ax.set_xlabel("Clock time", color=_INK_SECONDARY, fontsize=9)
    ax.set_ylabel("Relative level", color=_INK_SECONDARY, fontsize=9)
    ax.tick_params(colors=_INK_SECONDARY, labelsize=9, length=0)
    ax.grid(axis="y", color=_GRID, lw=0.8)
    ax.set_axisbelow(True)
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_color(_GRID)

    ax.set_title("Two-process model of sleep regulation", color=_INK, fontsize=13, loc="left", pad=22)
    p = sim.params
    ax.text(
        0.0,
        1.02,
        f"Shaded = asleep ({_clock(p.bed_time)}-{_clock(p.wake_time)}) · "
        f"tau={p.tau:g} h · phase={p.phase:g} h · weight={p.circadian_weight:g}",
        transform=ax.transAxes,
        color=_INK_SECONDARY,
        fontsize=9,
    )
    legend = ax.legend(loc="upper left", bbox_to_anchor=(0, -0.14), ncol=3, frameon=False, fontsize=9)
    for text in legend.get_texts():
        text.set_color(_INK_SECONDARY)

    fig.subplots_adjust(left=0.07, right=0.85, top=0.84, bottom=0.2)
    if path:
        fig.savefig(path, facecolor=_SURFACE)
    if show:
        plt.show()
    plt.close(fig)


def to_csv(sim: Simulation) -> str:
    """Return the simulation as CSV text."""
    lines = ["hour,clock_hour,asleep,circadian,homeostatic,sleep_tendency"]
    for t, c, s, tendency, is_asleep in zip(
        sim.t, sim.circadian, sim.homeostatic, sim.sleep_tendency, sim.asleep
    ):
        lines.append(
            f"{t:.4f},{t % 24:.4f},{int(is_asleep)},{c:.6f},{s:.6f},{tendency:.6f}"
        )
    return "\n".join(lines) + "\n"


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--hours", type=float, default=48.0, help="length of the simulated window (default 48)")
    parser.add_argument("--step-minutes", type=float, default=5.0, help="sampling interval (default 5)")
    parser.add_argument("--warmup-hours", type=float, default=96.0, help="unsampled hours before t=0 (default 96)")
    parser.add_argument("--tau", type=float, default=ModelParams.tau, help="intrinsic circadian period")
    parser.add_argument("--phase", type=float, default=ModelParams.phase, help="circadian phase in clock hours")
    parser.add_argument("--amplitude", type=float, default=ModelParams.amplitude)
    parser.add_argument("--tau-wake", type=float, default=ModelParams.tau_wake)
    parser.add_argument("--tau-sleep", type=float, default=ModelParams.tau_sleep)
    parser.add_argument("--s0", type=float, default=ModelParams.s0)
    parser.add_argument("--wake-time", type=float, default=ModelParams.wake_time)
    parser.add_argument("--bed-time", type=float, default=ModelParams.bed_time)
    parser.add_argument("--circadian-weight", type=float, default=ModelParams.circadian_weight)
    parser.add_argument("--plot", metavar="PATH", help="write the chart to PATH (PNG/SVG/PDF)")
    parser.add_argument("--show", action="store_true", help="open the chart in a window")
    parser.add_argument("--csv", metavar="PATH", help="write the samples to PATH ('-' for stdout)")
    args = parser.parse_args(argv)

    params = ModelParams(
        tau=args.tau,
        phase=args.phase,
        amplitude=args.amplitude,
        tau_wake=args.tau_wake,
        tau_sleep=args.tau_sleep,
        s0=args.s0,
        wake_time=args.wake_time,
        bed_time=args.bed_time,
        circadian_weight=args.circadian_weight,
    )
    sim = simulate(
        hours=args.hours,
        step_minutes=args.step_minutes,
        params=params,
        warmup_hours=args.warmup_hours,
    )

    if args.csv == "-":
        print(to_csv(sim), end="")
    elif args.csv:
        with open(args.csv, "w", encoding="utf-8") as handle:
            handle.write(to_csv(sim))
        print(f"wrote {args.csv}")

    if args.plot or args.show:
        plot(sim, path=args.plot, show=args.show)
        if args.plot:
            print(f"wrote {args.plot}")

    if not (args.csv or args.plot or args.show):
        peak = max(range(len(sim.t)), key=lambda i: sim.sleep_tendency[i])
        trough = min(range(len(sim.t)), key=lambda i: sim.sleep_tendency[i])
        print(f"samples: {len(sim.t)} over {sim.t[-1] - sim.t[0]:g} h")
        print(f"S range: {min(sim.homeostatic):.3f} - {max(sim.homeostatic):.3f}")
        print(
            "peak sleep tendency: "
            f"{sim.sleep_tendency[peak]:.3f} at {sim.t[peak] % 24:05.2f} clock hours"
        )
        print(
            "lowest sleep tendency: "
            f"{sim.sleep_tendency[trough]:.3f} at {sim.t[trough] % 24:05.2f} clock hours"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
