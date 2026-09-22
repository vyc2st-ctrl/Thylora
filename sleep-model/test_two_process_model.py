"""Tests for the two-process sleep model. Standard library only.

Run with:  python3 -m unittest discover -s sleep-model -t sleep-model
"""

import math
import unittest

from two_process_model import ModelParams, asleep_at, circadian, simulate, to_csv


class AsleepAtTest(unittest.TestCase):
    def test_overnight_window(self):
        for hour in (23.0, 23.5, 0.0, 3.0, 6.99):
            self.assertTrue(asleep_at(hour, wake_time=7.0, bed_time=23.0), hour)
        for hour in (7.0, 12.0, 22.99):
            self.assertFalse(asleep_at(hour, wake_time=7.0, bed_time=23.0), hour)

    def test_daytime_window(self):
        self.assertTrue(asleep_at(12.0, wake_time=17.0, bed_time=9.0))
        self.assertFalse(asleep_at(20.0, wake_time=17.0, bed_time=9.0))
        self.assertFalse(asleep_at(3.0, wake_time=17.0, bed_time=9.0))

    def test_wraps_negative_and_large_hours(self):
        self.assertTrue(asleep_at(-1.0, wake_time=7.0, bed_time=23.0))
        self.assertTrue(asleep_at(48.0, wake_time=7.0, bed_time=23.0))


class CircadianTest(unittest.TestCase):
    def test_period_is_tau(self):
        params = ModelParams(tau=24.2)
        for t in (0.0, 5.5, 31.0):
            self.assertAlmostEqual(circadian(t, params), circadian(t + params.tau, params), places=9)

    def test_peaks_a_quarter_period_after_phase(self):
        params = ModelParams(tau=24.2, phase=17.0, amplitude=1.0)
        self.assertAlmostEqual(circadian(params.phase + params.tau / 4, params), 1.0, places=9)
        self.assertAlmostEqual(circadian(params.phase, params), 0.0, places=9)

    def test_amplitude_scales(self):
        params = ModelParams(amplitude=2.5)
        self.assertAlmostEqual(max(circadian(t / 10, params) for t in range(500)), 2.5, places=3)


class HomeostaticTest(unittest.TestCase):
    def test_stays_within_bounds(self):
        sim = simulate(hours=72.0, step_minutes=1.0)
        self.assertGreater(min(sim.homeostatic), 0.0)
        self.assertLess(max(sim.homeostatic), sim.params.s_max)

    def test_rises_while_awake_and_falls_while_asleep(self):
        sim = simulate(hours=24.0, step_minutes=5.0)
        rising = falling = 0
        for i in range(1, len(sim.t)):
            delta = sim.homeostatic[i] - sim.homeostatic[i - 1]
            # Attribute the step to the state at the midpoint, as the model does.
            if asleep_at(sim.t[i] - 1 / 24, sim.params.wake_time, sim.params.bed_time):
                self.assertLess(delta, 0.0)
                falling += 1
            else:
                self.assertGreater(delta, 0.0)
                rising += 1
        self.assertGreater(rising, 0)
        self.assertGreater(falling, 0)

    def test_matches_analytic_solution_over_a_wake_episode(self):
        params = ModelParams()
        sim = simulate(hours=24.0, step_minutes=1.0, params=params)
        by_hour = dict(zip((round(t, 6) for t in sim.t), sim.homeostatic))
        s_wake = by_hour[round(params.wake_time, 6)]
        elapsed = 8.0
        expected = params.s_max - (params.s_max - s_wake) * math.exp(-elapsed / params.tau_wake)
        self.assertAlmostEqual(by_hour[round(params.wake_time + elapsed, 6)], expected, places=6)

    def test_peaks_at_bedtime_and_troughs_at_wake_time(self):
        sim = simulate(hours=24.0, step_minutes=1.0)
        peak = max(range(len(sim.t)), key=lambda i: sim.homeostatic[i])
        trough = min(range(len(sim.t)), key=lambda i: sim.homeostatic[i])
        self.assertAlmostEqual(sim.t[peak] % 24, sim.params.bed_time, delta=0.05)
        self.assertAlmostEqual(sim.t[trough] % 24, sim.params.wake_time, delta=0.05)

    def test_step_size_barely_changes_the_trajectory(self):
        coarse = simulate(hours=48.0, step_minutes=15.0)
        fine = simulate(hours=48.0, step_minutes=1.0)
        fine_by_hour = dict(zip((round(t, 6) for t in fine.t), fine.homeostatic))
        for t, s in zip(coarse.t, coarse.homeostatic):
            self.assertAlmostEqual(s, fine_by_hour[round(t, 6)], delta=2e-3)


class WarmupTest(unittest.TestCase):
    def test_warmup_removes_the_initial_condition(self):
        low = simulate(hours=24.0, params=ModelParams(s0=0.05))
        high = simulate(hours=24.0, params=ModelParams(s0=0.95))
        for a, b in zip(low.homeostatic, high.homeostatic):
            self.assertAlmostEqual(a, b, places=4)

    def test_without_warmup_the_run_starts_at_s0(self):
        sim = simulate(hours=24.0, warmup_hours=0.0, params=ModelParams(s0=0.42))
        self.assertAlmostEqual(sim.homeostatic[0], 0.42, places=9)

    def test_schedule_repeats_every_24_hours_after_warmup(self):
        sim = simulate(hours=48.0, step_minutes=5.0)
        by_time = dict(zip((round(t, 6) for t in sim.t), sim.homeostatic))
        for t in (7.0, 12.0, 23.0):
            self.assertAlmostEqual(by_time[round(t, 6)], by_time[round(t + 24, 6)], places=4)


class CombinationTest(unittest.TestCase):
    def test_sleep_tendency_subtracts_the_weighted_circadian_drive(self):
        sim = simulate(hours=24.0)
        weight = sim.params.circadian_weight
        for c, s, tendency in zip(sim.circadian, sim.homeostatic, sim.sleep_tendency):
            self.assertAlmostEqual(tendency, s - weight * c, places=12)

    def test_zero_weight_leaves_only_process_s(self):
        sim = simulate(hours=24.0, params=ModelParams(circadian_weight=0.0))
        self.assertEqual(sim.sleep_tendency, sim.homeostatic)


class ShapeAndOutputTest(unittest.TestCase):
    def test_sample_count_and_span(self):
        sim = simulate(hours=48.0, step_minutes=5.0)
        self.assertEqual(len(sim.t), 48 * 12 + 1)
        self.assertAlmostEqual(sim.t[0], 0.0, places=9)
        self.assertAlmostEqual(sim.t[-1], 48.0, places=9)
        self.assertEqual(len(sim.circadian), len(sim.t))
        self.assertEqual(len(sim.asleep), len(sim.t))

    def test_sleep_windows(self):
        windows = simulate(hours=48.0, step_minutes=5.0).sleep_windows()
        self.assertEqual(len(windows), 3)  # 00:00-07:00, 23:00-07:00, 23:00-00:00
        self.assertAlmostEqual(windows[1][0] % 24, 23.0, delta=0.09)
        self.assertAlmostEqual(windows[1][1] % 24, 7.0, delta=0.09)

    def test_csv_header_and_row_count(self):
        sim = simulate(hours=6.0, step_minutes=30.0)
        rows = to_csv(sim).strip().split("\n")
        self.assertEqual(rows[0], "hour,clock_hour,asleep,circadian,homeostatic,sleep_tendency")
        self.assertEqual(len(rows), len(sim.t) + 1)

    def test_rejects_bad_parameters(self):
        for kwargs in ({"tau": 0.0}, {"tau_sleep": -1.0}, {"wake_time": 25.0}, {"bed_time": 7.0}):
            with self.assertRaises(ValueError):
                ModelParams(**kwargs)
        with self.assertRaises(ValueError):
            simulate(hours=0.0)
        with self.assertRaises(ValueError):
            simulate(step_minutes=0.0)


if __name__ == "__main__":
    unittest.main()
