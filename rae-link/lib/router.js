// RAE LINK · hash routing
// Workroom: WR-RAELINK-001
//
// `#channel/<slug>` and `#player/<asset id>` are real addresses a viewer can
// send to someone else, not app-internal state. Keeping the parser pure keeps it
// testable without a browser, and keeps the address bar honest about where the
// viewer actually is.

export const DEFAULT_VIEW = 'watch';
export const PARAM_VIEWS = Object.freeze(['channel', 'player']);

/** `#view` or `#view/param`. Extra segments stay in the param (slugs never have slashes; ids never do either). */
export function parseRoute(hash) {
  const raw = String(hash ?? '').replace(/^#/, '').trim();
  if (!raw) return { view: DEFAULT_VIEW, param: null };
  const [view, ...rest] = raw.split('/');
  const param = rest.join('/').trim();
  return { view: view || DEFAULT_VIEW, param: param || null };
}

export function buildHash(view, param = null) {
  const safeView = String(view || DEFAULT_VIEW);
  return param ? `#${safeView}/${String(param)}` : `#${safeView}`;
}

export function isParamView(view) {
  return PARAM_VIEWS.includes(view);
}

/** A param view without its param is not a route — send it back to the default. */
export function normalizeRoute(route, hasView = () => true) {
  if (!hasView(route.view)) return { view: DEFAULT_VIEW, param: null };
  if (isParamView(route.view) && !route.param) return { view: DEFAULT_VIEW, param: null };
  return route;
}
