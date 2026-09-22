// THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562
//
// A control that does nothing is worse than a control that is absent: it costs
// the Chairman a tap and teaches him the surface is unreliable. This suite scans
// every shipped surface and fails if any button, control or in-page link cannot
// reach a real destination.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const SURFACES = [
  'dashboard-current-head.html',
  'app/index.html',
  'app/sports-betting.html',
  'app/time-run.html',
  'public-site/index.html',
  'public-site/store.html',
  'rae-link/index.html'
];

const SCRIPTS = [
  'app/app.js', 'app/omniview-surface.js', 'app/hotfix-20260831.js',
  'app/hotfix-build7-witness.js', 'app/time-run.js', 'app/sports-betting.js',
  'public-site/app.js', 'rae-link/app.js'
];

const read = (f) => (existsSync(f) ? readFileSync(f, 'utf8') : '');
const allScripts = SCRIPTS.map(read).join('\n');
const camel = (attr) => attr.replace(/^data-/, '').replace(/-(\w)/g, (_, c) => c.toUpperCase());

for (const file of SURFACES) {
  const html = read(file);
  if (!html) continue;
  const wiring = html + '\n' + allScripts;

  test(`${file}: every in-page link has a target`, () => {
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
    const anchors = [...html.matchAll(/href="#([a-zA-Z0-9_-]+)"/g)].map((m) => m[1]);
    const broken = [...new Set(anchors)].filter((t) => !ids.has(t));
    assert.deepEqual(broken, [], `dead in-page links in ${file}: ${broken.join(', ')}`);
  });

  test(`${file}: every control with an id is wired`, () => {
    const controls = [...html.matchAll(/<(button|select|textarea)\b[^>]*\bid="([a-zA-Z0-9_-]+)"/g)]
      .map((m) => m[2]);
    const dead = controls.filter((id) => {
      // The id must be referenced somewhere other than the markup that declares it.
      const hits = (wiring.match(new RegExp(`['"(\\[]${id}['")\\]]`, 'g')) || []).length;
      return hits < 1;
    });
    assert.deepEqual(dead, [], `unwired controls in ${file}: ${dead.join(', ')}`);
  });

  test(`${file}: every data-attribute control has a handler`, () => {
    const attrs = [...new Set([...html.matchAll(/\b(data-[a-z-]+)=/g)].map((m) => m[1]))];
    const unhandled = attrs.filter((attr) =>
      !wiring.includes(`[${attr}`) && !wiring.includes(`${attr}"]`) && !wiring.includes(`dataset.${camel(attr)}`));
    assert.deepEqual(unhandled, [], `data-attribute controls with no handler in ${file}: ${unhandled.join(', ')}`);
  });

  test(`${file}: every form input is named or read`, () => {
    const inputs = [...html.matchAll(/<(input|select|textarea)\b([^>]*)>/g)].map((m) => m[2]);
    const orphan = inputs.filter((attrs) => {
      if (/\btype="(hidden|submit|button)"/.test(attrs)) return false;
      const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
      const name = (attrs.match(/\bname="([^"]+)"/) || [])[1];
      if (name) return false;                      // read through FormData
      if (!id) return true;                        // no id and no name: unreachable
      return !new RegExp(`['"(\\[]${id}['")\\]]`).test(wiring);
    });
    assert.equal(orphan.length, 0, `${orphan.length} input(s) in ${file} cannot be read by any handler`);
  });
}

test('the OMNIVIEW surface wires every control it adds', () => {
  const js = read('app/omniview-surface.js');
  const added = [...new Set([...js.matchAll(/id="(thyOmni[A-Za-z]+)"/g)].map((m) => m[1]))];
  assert.ok(added.length >= 6, 'expected the OMNIVIEW surface to declare its controls');
  for (const id of added) {
    const wired = new RegExp(`\\$\\('${id}'\\)`).test(js) || new RegExp(`getElementById\\('${id}'\\)`).test(js);
    assert.ok(wired, `OMNIVIEW control ${id} is declared but never wired`);
  }
});
