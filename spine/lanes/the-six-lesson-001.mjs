// THE SIX — first Earth-math → EdereAirah-understanding classroom lesson.
// Shape matches ue_concepts (thylora-dash) plus the classroom plan around it.

const EARTH_YEAR_DAYS = 365.2422;   // mean tropical year, rounded to 4 dp
const EDEREAIRAH_ORBIT_DAYS = 507;  // Earth-read days per orbit — canon candidate

export const lesson = {
  lesson_code: 'THE-SIX-L001',
  audience: 'THE SIX — classroom',
  concept: {
    concept_code: 'UE-C-YEAR-RATIO-001',
    title: 'A year is one trip around a star, so ages convert by ratio',
    subject_code: 'MATHEMATICS',
    band_min: 'UE-BAND-03',
    band_max: 'UE-BAND-06',
    what_it_is: 'A year is not a fixed number of days everywhere. It is the time one world takes to go once around its star. To turn Earth years into EdereAirah years, count the days you have lived, then divide by the number of days in one EdereAirah orbit.',
    why_it_matters: 'It shows that a unit is an agreement about what to count. The same stretch of life can be ten years in one place and about seven in another, and neither number is wrong. The same idea sits behind currency exchange, map scales and recipe scaling.',
    how_we_know: 'Earth: astronomers measure the mean tropical year at about 365.2422 days. EdereAirah: the Chairman-supplied proof sheets preserved in thylora-dash give an orbit of 507 Earth-read days; that value is a canon candidate, not yet locked.',
    what_remains_unknown: 'Whether an EdereAirah day is the same length as an Earth day, and what EdereAirah calls its seasons and months. Until native day mathematics are recovered, the lesson counts in Earth-read days.',
    what_connects_to_it: ['UE-C-RATIO (proportional reasoning)', 'MONEY: exchange rates', 'MAPS: scale', 'THY-IDEA-TIME-CANON-RESTORE-003', 'THY-IDEA-TIME-CANON-V2-001'],
    common_misunderstanding: 'Thinking you get younger on EdereAirah. You do not: the time lived is the same; only the size of the unit you count it in changes.',
    test_question: 'Amara is 12 Earth years old. About how many EdereAirah years is that, to one decimal place?',
    real_world_application: 'Converting between units that measure the same thing: miles and kilometres, dollars and euros, Earth years and EdereAirah years.',
    teach_back_challenge: 'Explain to a younger child, with two different-sized cups and a jug of water, why the same water is "more cups" in the small cup and "fewer cups" in the big cup — then say which cup is the Earth year.',
    evidence_refs: [
      { ref: 'THY-IDEA-TIME-CANON-RESTORE-003', kind: 'backend_idea', note: '507 Earth-read-day orbit, SOURCE_PRESERVED, DESIGN_ACTIVE' },
      { ref: 'Mean tropical year ≈ 365.2422 days', kind: 'earth_astronomy', note: 'standard astronomical value; bind to earth_record_sources before release' },
    ],
    truth_state: 'SUPPORTED',
    contested_positions: [{ position: 'Orbit length 507 Earth-read days', state: 'CANON_CANDIDATE', unlock: 'Chairman locks time canon unit layer' }],
    safety_class: 'GENERAL',
  },
  candidate_disclosed_to_students: true,
  world_parameters: [
    { name: 'edereairah_orbit_days', value: EDEREAIRAH_ORBIT_DAYS, unit: 'Earth-read days', canon_state: 'CANON_CANDIDATE', source: 'THY-IDEA-TIME-CANON-RESTORE-003' },
  ],
  earth_facts: [
    { fact: 'Mean tropical year ≈ 365.2422 days', source: 'Standard astronomical constant (bind to earth_record_sources before release)' },
  ],
  worked_examples: [
    { prompt: '10 Earth years in EdereAirah years', compute: () => (10 * EARTH_YEAR_DAYS) / EDEREAIRAH_ORBIT_DAYS, expected: 7.2040, tolerance: 0.0001 },
    { prompt: '12 Earth years in EdereAirah years (test question)', compute: () => (12 * EARTH_YEAR_DAYS) / EDEREAIRAH_ORBIT_DAYS, expected: 8.6448, tolerance: 0.0001 },
    { prompt: 'One EdereAirah year in Earth years', compute: () => EDEREAIRAH_ORBIT_DAYS / EARTH_YEAR_DAYS, expected: 1.3881, tolerance: 0.0001 },
  ],
  classroom: [
    { stage: 'WARM_UP', minutes: 5, activity: 'Everyone says their age in Earth years. Question on the board: "Would your age be the same number on another world?"' },
    { stage: 'OBSERVE', minutes: 5, activity: 'Two circles drawn to scale: Earth\'s trip and EdereAirah\'s longer trip. Count tick marks (days) around each.' },
    { stage: 'MODEL', minutes: 10, activity: 'Teacher works 10 Earth years → days lived (3,652.4) → divide by 507 → 7.2 EdereAirah years. Say every unit aloud.' },
    { stage: 'PRACTICE', minutes: 10, activity: 'Each child converts their own age, then a parent\'s age. Check: EdereAirah number is always smaller. Why?' },
    { stage: 'TRANSFER', minutes: 10, activity: 'Same method, new world: a made-up planet with a 200-day year. Is your age bigger or smaller there? Then: 5 dollars at 2 coins per dollar.' },
    { stage: 'TEACH_BACK', minutes: 5, activity: 'Cups-and-jug teach-back. Record one sentence per child in understanding_records.' },
  ],
  understanding_rubric: {
    K: 'Knows a year = one orbit and states both day counts',
    E: 'Can explain why dividing is the right operation',
    C: 'Connects it to another unit change (money, maps, recipes)',
    X: 'Transfers to an unseen world with a different orbit',
    T: 'Teaches it back so a younger child can repeat it',
    zero_rule: true,
  },
  open_questions: [
    'Chairman: lock 507 Earth-read days as the orbit, or keep as candidate for this lesson?',
    'Is an EdereAirah day the same length as an Earth day?',
    'Which of THE SIX receive this lesson first, and who teaches it (guardian identity model is still undecided)?',
  ],
};
