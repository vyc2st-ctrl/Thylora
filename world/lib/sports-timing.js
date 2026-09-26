// THYLORA · Sports real-time sim · generic QB / RB / receiver / blocker timing
// Idea lane: THY-IDEA-SPORTS-REALTIME-SIM-001
// Synthetic players only. No named Earth athlete, team or league is modelled.
//
// Decision inputs per player: skill, position knowledge, adjacent-position
// knowledge, coaching, fatigue, confidence/anxiety, history, field state,
// physics, opponent, bounded chance. All in 0..1 unless stated.

import { rng, clampP } from './event-engine.js';

export const DT = 0.1; // seconds per step

export function synthPlayer(id, role, attrs = {}) {
  return {
    id, role, synthetic: true,
    skill: 0.6, position_knowledge: 0.6, adjacent_knowledge: 0.3, coaching: 0.5,
    fatigue: 0.1, confidence: 0.6, anxiety: 0.3, history: [],
    top_speed_mps: role === 'BLOCKER' ? 6.5 : 8.5, accel_mps2: role === 'BLOCKER' ? 3.5 : 5,
    ...attrs
  };
}

// Effective reading = what the player actually perceives and executes.
export function effective(p) {
  const base = 0.45 * p.skill + 0.25 * p.position_knowledge + 0.1 * p.adjacent_knowledge + 0.2 * p.coaching;
  const nerve = 1 + 0.15 * (p.confidence - p.anxiety);
  const tired = 1 - 0.35 * p.fatigue;
  return Math.max(0, Math.min(1, base * nerve * tired));
}

// Physics: distance covered after t seconds with constant accel to top speed,
// degraded by fatigue and field state (wet field reduces accel and top speed).
export function distanceAt(p, t, field) {
  const grip = field.wet ? 0.88 : 1;
  const vmax = p.top_speed_mps * (1 - 0.2 * p.fatigue) * grip;
  const a = p.accel_mps2 * grip;
  const tAccel = vmax / a;
  return t <= tAccel ? 0.5 * a * t * t : 0.5 * a * tAccel * tAccel + vmax * (t - tAccel);
}

// Blocker hold time against a rusher: pocket integrity window.
export function holdTime(blocker, rusher, rand) {
  const edge = effective(blocker) - effective(rusher) * 0.9;
  const noise = (rand() - 0.5) * 0.4; // bounded chance: +/-0.2 s
  return Math.max(1.2, 2.6 + 1.6 * edge + noise);
}

// Receiver separation at time t against a defender.
export function separationAt(rec, def, t, field) {
  const routeCraft = 1.2 * (effective(rec) - effective(def));
  return distanceAt(rec, t, field) - distanceAt(def, t, field) * 0.97 + routeCraft;
}

// One play: QB drops, reads receivers in progression, RB check-down, or sack.
export function runPlay({ qb, rb, receivers, defenders, blockers, rushers, field, seed }) {
  const rand = rng(seed);
  const pocket = Math.min(...blockers.map((b, i) => holdTime(b, rushers[i % rushers.length], rand)));
  const qbRead = effective(qb);
  const readTime = 0.9 - 0.4 * qbRead; // seconds per progression read
  const log = [{ t: 0, what: 'SNAP' }, { t: round(pocket), what: 'POCKET_BREAKS' }];
  let t = 1.1 - 0.2 * qbRead; // drop depth time
  for (let i = 0; i < receivers.length; i++) {
    t += readTime;
    if (t >= pocket) break;
    const sep = separationAt(receivers[i], defenders[i % defenders.length], t, field);
    log.push({ t: round(t), what: 'READ', target: receivers[i].id, separation_m: round(sep) });
    const throwWindow = sep > 1.0 + 1.5 * qb.anxiety - 0.8 * qb.confidence;
    if (throwWindow) {
      const pComplete = clampP(0.35 + 0.35 * effective(receivers[i]) + 0.1 * Math.min(sep, 3) - (field.wet ? 0.07 : 0));
      const roll = rand();
      const complete = roll < pComplete;
      log.push({ t: round(t + 0.35), what: complete ? 'COMPLETE' : 'INCOMPLETE', target: receivers[i].id, p: round(pComplete), roll: round(roll) });
      return { outcome: complete ? 'COMPLETE' : 'INCOMPLETE', target: receivers[i].id, pocket_s: round(pocket), log };
    }
  }
  // Check-down: RB leak depends on RB's adjacent (pass-pro vs route) knowledge.
  if (t < pocket + 0.3 && rb.adjacent_knowledge >= 0.4) {
    log.push({ t: round(Math.min(t, pocket)), what: 'CHECKDOWN', target: rb.id });
    return { outcome: 'CHECKDOWN', target: rb.id, pocket_s: round(pocket), log };
  }
  log.push({ t: round(pocket + 0.2), what: 'SACK' });
  return { outcome: 'SACK', target: null, pocket_s: round(pocket), log };
}

// History changes the player: outcome updates confidence/anxiety/fatigue.
export function applyOutcome(qb, result) {
  const d = { COMPLETE: [0.03, -0.02], INCOMPLETE: [-0.01, 0.01], CHECKDOWN: [0, 0], SACK: [-0.04, 0.04] }[result.outcome];
  return {
    ...qb,
    confidence: clamp01(qb.confidence + d[0]),
    anxiety: clamp01(qb.anxiety + d[1]),
    fatigue: clamp01(qb.fatigue + 0.01),
    history: [...qb.history, result.outcome]
  };
}

const round = n => Math.round(n * 100) / 100;
const clamp01 = n => Math.max(0, Math.min(1, n));
