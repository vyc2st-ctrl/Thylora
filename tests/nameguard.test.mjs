// NameGuard — repository side of THY-NAMEGUARD-EDEREAIRAH-001.
//
// The backend enforces the canonical planet spelling with a blocking trigger on
// authoritative tables. This test is the same lock for the source tree: no file
// tracked by git may reintroduce a non-canonical spelling.
//
// The forbidden literal is assembled from fragments so that this file does not
// itself contain the string it forbids.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const CANONICAL = 'Edere' + 'Airah';
const FORBIDDEN = /edere\s*ariah/i;

// Files that legitimately carry the canonical spelling are fine; this guard only
// rejects the drifted forms.
const SKIP_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.woff', '.woff2']);

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .filter((f) => ![...SKIP_EXTENSIONS].some((ext) => f.toLowerCase().endsWith(ext)));
}

test('no tracked file carries a non-canonical planet spelling', () => {
  const offenders = [];

  for (const file of trackedFiles()) {
    if (file === 'tests/nameguard.test.mjs') continue;

    let text;
    try {
      text = readFileSync(join(ROOT, file), 'utf8');
    } catch {
      continue; // unreadable or binary; nothing to check
    }

    text.split('\n').forEach((line, index) => {
      if (FORBIDDEN.test(line)) {
        offenders.push(`${file}:${index + 1}`);
      }
    });
  }

  assert.deepEqual(
    offenders,
    [],
    `Non-canonical planet spelling found. The canonical spelling is ${CANONICAL}. ` +
      `Offending locations: ${offenders.join(', ')}`,
  );
});

test('the canonical spelling is present in the source tree', () => {
  const found = trackedFiles().some((file) => {
    try {
      return readFileSync(join(ROOT, file), 'utf8').includes(CANONICAL);
    } catch {
      return false;
    }
  });

  assert.equal(found, true, `Expected at least one file to use the canonical spelling ${CANONICAL}.`);
});
