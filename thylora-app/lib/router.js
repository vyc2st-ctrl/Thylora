// THYLORA APP · routing + access guards
// Workroom: WR-THYAPP-001
//
// Routing is resolved here, as data, so it can be tested without a browser.
// The shell never decides access inline.
//
// Three outcomes, and the difference between the last two matters:
//
//   ALLOW     — draw the section.
//   SIGN_IN   — the section is public but personal (My Purchases, My Questions).
//               It is still drawn, with a sign-in prompt in place of the
//               personal rows. Redirecting here would hide a public surface.
//   BLOCK     — the Chairman workspace without Chairman authority. The section
//               is not drawn at all and the route falls back to Home, so an
//               unauthorized reader cannot even see its shape. The backend
//               refuses the same identity independently.

import { SECTIONS, SECTION_IDS, DEFAULT_SECTION, section, CHAIRMAN } from './registry.js';
import { chairmanAuthorization, memberAuthorization } from './identity.js';

export const OUTCOME = Object.freeze({ ALLOW: 'ALLOW', SIGN_IN: 'SIGN_IN', BLOCK: 'BLOCK' });

export function isKnownSection(id) {
  return SECTION_IDS.includes(id);
}

/** Read a section id out of a location hash, tolerating '#', '#/x' and ''. */
export function sectionFromHash(hash = '') {
  const raw = String(hash).replace(/^#\/?/, '').split('?')[0].trim();
  return raw || DEFAULT_SECTION;
}

/**
 * Resolve a requested section against a session.
 * Returns { sectionId, outcome, reason, message, requested, redirected, authorization }.
 */
export function resolveRoute(requested, session, now = Date.now()) {
  const wanted = isKnownSection(requested) ? requested : DEFAULT_SECTION;
  const target = section(wanted);

  if (target.access === CHAIRMAN) {
    const authorization = chairmanAuthorization(session, now);
    if (!authorization.authorized) {
      return {
        sectionId: DEFAULT_SECTION,
        outcome: OUTCOME.BLOCK,
        reason: authorization.reason,
        message: authorization.message,
        requested: wanted,
        redirected: true,
        authorization
      };
    }
    return {
      sectionId: wanted, outcome: OUTCOME.ALLOW, reason: null, message: null,
      requested: wanted, redirected: false, authorization
    };
  }

  if (target.requiresSession) {
    const member = memberAuthorization(session, now);
    if (!member.signedIn) {
      return {
        sectionId: wanted, outcome: OUTCOME.SIGN_IN, reason: member.reason, message: member.message,
        requested: wanted, redirected: false, authorization: member
      };
    }
    return {
      sectionId: wanted, outcome: OUTCOME.ALLOW, reason: null, message: null,
      requested: wanted, redirected: false, authorization: member
    };
  }

  return {
    sectionId: wanted,
    outcome: OUTCOME.ALLOW,
    reason: null,
    message: null,
    requested: wanted,
    redirected: wanted !== requested,
    authorization: null
  };
}

/** The nav the current session should actually see. */
export function visibleSections(session, now = Date.now()) {
  const chairman = chairmanAuthorization(session, now).authorized;
  return SECTIONS.filter(s => s.access !== CHAIRMAN || chairman);
}
