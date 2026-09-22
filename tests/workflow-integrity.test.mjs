// BLOCKED WORKFLOW CAUSE — GitHub reported "no jobs were run" on every push.
//
// The cause was not a job failure. Four workflow files embedded a Python raw
// string whose payload lines began at column 0. In YAML, a non-empty line that
// is less indented than the block scalar ENDS the block scalar, so the parser
// then tried to read `function workCard(...)` as a mapping key, the file failed
// to parse, and GitHub created a startup-failure run with no jobs in it.
//
// The fix is one level of indentation: GitHub strips the block scalar's common
// indent before running the script, so the emitted Python is byte-identical and
// only the YAML framing changed.
//
// This suite makes the breakage impossible to reintroduce without a red test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const DIR = '.github/workflows';
const files = readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f)).sort();

test('there are workflows to check', () => {
  assert.ok(files.length >= 6, `expected the THYLORA workflows, found ${files.length}`);
});

for (const file of files) {
  const text = readFileSync(`${DIR}/${file}`, 'utf8');
  const lines = text.split('\n');

  test(`${file}: no payload line sits at column 0 inside a step`, () => {
    // Everything after the `jobs:` key belongs to a job, a step, or a block
    // scalar. A non-empty, non-comment line at column 0 down there is the exact
    // shape that terminated the block scalar and broke the parse.
    const jobsAt = lines.findIndex((l) => /^jobs:\s*$/.test(l));
    assert.ok(jobsAt > -1, `${file} declares no jobs`);

    const offenders = [];
    for (let i = jobsAt + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line.trim()) continue;
      if (/^\s/.test(line)) continue;
      if (/^#/.test(line)) continue;      // a trailing comment is legal YAML
      offenders.push(`line ${i + 1}: ${line.slice(0, 60)}`);
    }
    assert.deepEqual(offenders, [],
      `${file} has ${offenders.length} column-0 line(s) inside a step, which ends the YAML block scalar:\n  `
      + offenders.join('\n  '));
  });

  test(`${file}: every embedded triple-quoted string is closed`, () => {
    // An unbalanced ''' silently swallows the rest of the script. Two forms
    // appear in these workflows: single-line x='''...''' assignments, and
    // multi-line blocks opened by a line ending in ''' and closed by a line
    // that is only '''.
    const delimiters = (text.match(/'''/g) || []).length;
    assert.equal(delimiters % 2, 0, `${file} has an odd number of ''' delimiters`);

    const openers = lines.filter((l) => /=\s*r?'''\s*$/.test(l)).length;
    const closers = lines.filter((l) => l.trim() === "'''").length;
    assert.equal(openers, closers,
      `${file} has ${openers} multi-line string opener(s) and ${closers} closing line(s)`);
  });

  test(`${file}: the file declares a job that can actually run`, () => {
    assert.match(text, /^jobs:$/m, `${file} declares no jobs`);
    assert.match(text, /^\s{2}[a-z0-9-]+:$/m, `${file} declares no named job`);
    assert.match(text, /runs-on:/, `${file} declares no runner`);
    assert.match(text, /steps:/, `${file} declares no steps`);
  });

  test(`${file}: block scalars are indented consistently`, () => {
    // Inside a `run: |` block, every non-empty line must be indented at least as
    // far as the first line of the block. This is the rule the broken files
    // violated, checked directly rather than inferred from a parse failure.
    for (let i = 0; i < lines.length; i += 1) {
      if (!/^\s*run:\s*\|\s*$/.test(lines[i])) continue;
      const blockIndent = (lines[i + 1] || '').match(/^\s*/)[0].length;
      assert.ok(blockIndent > 0, `${file}:${i + 2} block scalar opens at column 0`);
      for (let j = i + 1; j < lines.length; j += 1) {
        const line = lines[j];
        if (!line.trim()) continue;
        const indent = line.match(/^\s*/)[0].length;
        if (indent < blockIndent) {
          // The block ended. It may only end on a new YAML key, never on a
          // payload line that happens to be flush left.
          assert.match(line, /^\s*(-\s+\w|[a-z-]+:)|^#/,
            `${file}:${j + 1} ends a run block with a payload line, not a YAML key: ${line.slice(0, 60)}`);
          break;
        }
      }
    }
  });
}

test('the workflows that patch the dashboard still refuse to patch a foreign baseline', () => {
  // The patchers guard on a release marker before editing. If a parse fix ever
  // came with that guard removed, a workflow could overwrite an unrelated head.
  for (const file of files.filter((f) => f.startsWith('patch-dashboard'))) {
    const text = readFileSync(`${DIR}/${file}`, 'utf8');
    assert.match(text, /raise SystemExit|already present|refusing to patch/,
      `${file} edits the head with no baseline guard`);
  }
});
