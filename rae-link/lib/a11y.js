// RAE LINK · accessibility hooks
// Workroom: WR-RAELINK-001
//
// Accessibility is wired into the flows rather than bolted on: state changes are
// announced, focus is managed when a view changes, dialogs trap and restore
// focus, and motion respects the viewer's setting.

let liveRegion = null;

/** Announce a state change to assistive technology. */
export function announce(message, { assertive = false } = {}) {
  if (typeof document === 'undefined') return;
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
  }
  liveRegion.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
  // Clearing first makes a repeated identical message announce again.
  liveRegion.textContent = '';
  globalThis.setTimeout(() => { liveRegion.textContent = String(message); }, 30);
}

export function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Move focus to a newly shown view without stealing it mid-typing. */
export function focusView(element) {
  if (!element || typeof document === 'undefined') return;
  const active = document.activeElement;
  if (active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) return;
  if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
  element.focus({ preventScroll: false });
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Trap focus inside a dialog and restore it on close. */
export function trapFocus(container) {
  if (!container || typeof document === 'undefined') return () => {};
  const previouslyFocused = document.activeElement;
  const nodes = () => [...container.querySelectorAll(FOCUSABLE)].filter(n => n.offsetParent !== null);
  nodes()[0]?.focus();

  const onKeyDown = event => {
    if (event.key !== 'Tab') return;
    const focusable = nodes();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  container.addEventListener('keydown', onKeyDown);
  return () => {
    container.removeEventListener('keydown', onKeyDown);
    previouslyFocused?.focus?.();
  };
}

/**
 * Describe a channel's class for a screen reader. The simulated/Earth
 * distinction must reach someone who cannot see the coloured tag.
 */
export function channelClassLabel(channel) {
  if (!channel) return '';
  return channel.world_status === 'WORLD_SIMULATED'
    ? `Simulated world media channel. ${channel.simulated_disclosure ?? 'Not an Earth person.'}`
    : 'Earth channel. A real person, business or organization.';
}

/** Progress announcements, throttled so an upload does not flood the queue. */
export function progressAnnouncer({ everyPercent = 25 } = {}) {
  let lastAnnounced = -1;
  return percent => {
    const step = Math.floor(Number(percent) / everyPercent) * everyPercent;
    if (step > lastAnnounced) {
      lastAnnounced = step;
      announce(`Upload ${step} percent complete.`);
    }
  };
}
