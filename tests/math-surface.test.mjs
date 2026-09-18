// THYLORA · the surfaces
//
// The hard rule for this lane is that the mathematics appears on the
// learner-facing and story-facing surface, not only in backend logic. These
// tests check the surface files themselves, because a model that is only in a
// module is exactly the failure this lane was opened to correct.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const surface = join(here, '..', 'math-surface');
const read = file => readFileSync(join(surface, file), 'utf8');

const PAGES = ['index.html', 'teacher.html', 'family.html'];

test('every surface page carries the equation itself', () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.match(html, /P_solve\s*=\s*L\s*×\s*M\s*×\s*S|<span class="factor L">L<\/span>/,
      `${page} does not show the equation to the person reading it`);
  }
});

test('the learner page names all three layers as questions a child can answer', () => {
  const html = read('index.html');
  assert.match(html, /Do I understand the sentence\?/);
  assert.match(html, /Do I understand what is happening to the numbers\?|Do I understand the mathematical relationship\?/);
  assert.match(html, /Can I do the working\?|Can I solve it\?/);
});

test('the learner page states the hard rule in its own words', () => {
  const html = read('index.html');
  assert.match(html, /If L = 0/);
  assert.match(html, /do <strong>not<\/strong> conclude that the learner lacks the mathematics/i);
});

test('the learner page carries all four isolations as separate steps', () => {
  const html = read('index.html');
  assert.match(html, /id="stepL"/);
  assert.match(html, /id="stepM"/);
  assert.match(html, /id="stepS"/);
  assert.match(html, /id="stepX"/);
  assert.match(html, /1 · The sentence/);
  assert.match(html, /2 · The relationship/);
  assert.match(html, /3 · The working/);
  assert.match(html, /4 · Say it back/);
});

test('the relationship step supplies the quantities and the solve step carries no story', () => {
  const html = read('index.html');
  assert.match(html, /Numbers supplied · nothing is worked out/);
  assert.match(html, /No story · no words/);
});

test('an unmeasured layer is shown as a question mark, never as a zero', () => {
  const html = read('index.html');
  assert.match(html, /L = \?/);
  assert.match(html, /never turns into a zero/i);
});

test('the family page refuses the sentence a family is most often given', () => {
  const html = read('family.html');
  assert.match(html, /They lack the mathematics/);
  assert.match(html, /how was that measured with the reading taken out/i);
  assert.match(html, /respectively/i);
});

test('the family page explains why the layers are multiplied, not added', () => {
  const html = read('family.html');
  assert.match(html, /multiplied rather than added/i);
});

test('the teacher page carries the admissibility rule and the refusal', () => {
  const html = read('teacher.html');
  assert.match(html, /in isolation/i);
  assert.match(html, /not isolated if/i);
  assert.match(html, /blank is not zero/i);
  assert.match(html, /refuse/i);
});

test('the teacher page offers the lift question, not only the score', () => {
  const js = read('teacher.js');
  assert.match(js, /liftRanking/);
  assert.match(js, /already at its ceiling/);
});

test('no surface page claims a diagnosis', () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.ok(
      !/\bdiagnos(e|is|ed)\b/i.test(html) || /not a diagnostic instrument|a diagnosis, or a prediction/i.test(html),
      `${page} uses diagnostic language without refusing the claim`
    );
  }
});

test('every module a page loads exists on disk', () => {
  for (const page of [...PAGES]) {
    const html = read(page);
    for (const match of html.matchAll(/<script type="module" src="\.\/([^"]+)"/g)) {
      assert.ok(existsSync(join(surface, match[1])), `${page} loads ${match[1]}, which does not exist`);
    }
    for (const match of html.matchAll(/<link rel="stylesheet" href="\.\/([^"]+)"/g)) {
      assert.ok(existsSync(join(surface, match[1])), `${page} loads ${match[1]}, which does not exist`);
    }
  }
});

test('every import in every surface module resolves to a real file', () => {
  for (const file of ['app.js', 'teacher.js', 'family.js', 'lib/cards.js', 'lib/backend.js', 'lib/store.js']) {
    const source = read(file);
    for (const match of source.matchAll(/from '(\.[^']+)'/g)) {
      const target = resolve(join(surface, dirname(file)), match[1]);
      assert.ok(existsSync(target), `${file} imports ${match[1]}, which does not exist`);
    }
  }
});

test('no surface module imports node built-ins, which would break in a browser', () => {
  for (const file of ['app.js', 'teacher.js', 'family.js', 'lib/understanding.js', 'lib/language.js', 'lib/examples.js', 'lib/cards.js', 'lib/continuity.js', 'lib/persistence.js', 'lib/store.js', 'lib/backend.js']) {
    const source = read(file);
    assert.ok(!/from 'node:/.test(source), `${file} imports a node built-in and cannot run on the surface`);
  }
});

test('the filesystem adapter is kept out of the surface bundle', () => {
  assert.match(read('lib/persistence-fs.js'), /from 'node:fs'/);
  for (const file of ['app.js', 'teacher.js', 'family.js']) {
    assert.ok(!read(file).includes('persistence-fs'), `${file} pulls the filesystem adapter into the browser`);
  }
});

test('the surfaces load no external script, font or image', () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.ok(!/src="https?:/.test(html), `${page} loads an external script`);
    assert.ok(!/<img/i.test(html), `${page} carries an image; none was produced in this delta`);
    assert.ok(!/fonts\.googleapis|cdn\./i.test(html), `${page} loads an external resource`);
  }
});

test('the manifest points at the learner surface and carries no icon that does not exist', () => {
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.start_url, './index.html');
  assert.ok(!manifest.icons, 'the manifest declares icons; no imagery was produced in this delta');
});
