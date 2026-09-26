// THYLORA · Gate Network — lane routes (WR-GATE-NETWORK-620)
//
// Each lane is an independent route instance. A gate code may appear in many
// routes; its receipt is per route. A HOLD on DOCTOR-TRANSMISSION's VISUAL
// receipt does not touch SECOND-GEAR-DETECTIVE's VISUAL receipt.
//
// `current_gate` is where the lane's work stands now. Which gates autonomy may
// pass on its own is computed from each gate's authority floor, never declared.

export const ROUTES = Object.freeze({
  'SECOND-GEAR-DETECTIVE': {
    realization: 'THY-REALIZE-SECOND-GEAR-DETECTIVE-001',
    artifact: 'products/second-gear-detective/photosynthesis-pilot.md',
    path: ['OBJECT', 'RIGHTS', 'PRODUCT', 'LEGAL', 'MONEY', 'STORE', 'PUBLICATION'],
    current_gate: 'OBJECT'
  },
  'SECOND-GEAR-TEACHER': {
    realization: 'THY-REALIZE-SECOND-GEAR-TEACHER-001',
    artifact: 'products/second-gear-teacher-pack/content-spec.md',
    path: ['OBJECT', 'RIGHTS', 'PRODUCT', 'LEGAL', 'MONEY', 'STORE', 'PUBLICATION'],
    current_gate: 'OBJECT'
  },
  'BUILD-YOUR-GATE': {
    realization: 'THY-REALIZE-GATE-BUILDER-KIDS-001',
    artifact: 'products/build-your-gate/activity-spec.md',
    path: ['OBJECT', 'RIGHTS', 'PRODUCT', 'LEGAL', 'MONEY', 'STORE', 'PUBLICATION'],
    current_gate: 'OBJECT'
  },
  'TALK-WHILE-WORKING': {
    realization: 'THY-REALIZE-TALK-WHILE-WORKING-001',
    artifact: 'products/talk-while-working/phase1-voice-workflow.md',
    path: ['PERSON', 'PRIVACY', 'LEGAL', 'PRODUCT', 'MONEY', 'STORE', 'PUBLICATION'],
    current_gate: 'PRIVACY'
  },
  'SCHOOL-ROOMS-VASHON-1986': {
    realization: 'THYLORA SCHOOL ROOMS pilot',
    artifact: 'school-rooms/vashon-class-of-1986/pilot-design.md',
    path: ['PERSON', 'PRIVACY', 'RIGHTS', 'LEGAL', 'PRODUCT', 'MONEY', 'STORE', 'PUBLICATION'],
    current_gate: 'PERSON'
  },
  'DOCTOR-TRANSMISSION': {
    realization: 'Doctor Transmission first post (separate lane)',
    artifact: 'lanes/doctor-transmission/LANE-STATUS.md',
    path: ['SCENE', 'PERSON', 'VISUAL', 'RIGHTS', 'LEGAL', 'PUBLICATION'],
    current_gate: 'SCENE'
  }
});
