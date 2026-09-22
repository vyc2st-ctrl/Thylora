#!/usr/bin/env node
/* Inject app/omniview-surface.js into the standalone hosts.
 *
 * dashboard-current-head.html is a single self-contained file — it must stay
 * portable so it can be merged into vyc2st-ctrl/thylora-executive-dashboard
 * without dragging a file tree behind it. So the surface is INLINED there and
 * loaded by <script src> in the app, from the same single source file.
 *
 *   node tools/inject-omniview.mjs          # write the injection
 *   node tools/inject-omniview.mjs --check  # fail if any host is out of date
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'app/omniview-surface.js';
const OPEN = '<script id="thy-omniview-script">';
const CLOSE = '</script>';
const TAG = '<script src="./omniview-surface.js" id="thy-omniview-script"></script>';

const source = readFileSync(SOURCE, 'utf8');
if (source.includes('</script')) {
  console.error(`${SOURCE} contains a closing script tag and cannot be inlined.`);
  process.exit(2);
}

const inlineBlock = `${OPEN}\n${source}${CLOSE}\n`;

function replaceInline(html, block) {
  const start = html.indexOf(OPEN);
  if (start === -1) return html.replace(/\n*<\/body>/, `\n\n${block}\n</body>`);
  const end = html.indexOf(CLOSE, start) + CLOSE.length;
  return html.slice(0, start) + block.trimEnd() + html.slice(end);
}

function replaceTag(html, tag) {
  // Drop any previous copy first, so re-running never stacks the tag.
  const stripped = html.replace(/\n*<script[^>]*id="thy-omniview-script"[^>]*><\/script>/g, '');
  return stripped.replace(/\n*<\/body>/, `\n\n${tag}\n</body>`);
}

const hosts = [
  { file: 'dashboard-current-head.html', block: inlineBlock, mode: 'inline' },
  { file: 'app/index.html', block: TAG, mode: 'tag' }
];

const check = process.argv.includes('--check');
let dirty = 0;

for (const host of hosts) {
  const before = readFileSync(host.file, 'utf8');
  const after = host.mode === 'inline'
    ? replaceInline(before, host.block)
    : replaceTag(before, host.block);
  if (before === after) {
    console.log(`up to date  ${host.file} (${host.mode})`);
    continue;
  }
  dirty += 1;
  if (check) {
    console.error(`OUT OF DATE ${host.file} — run: node tools/inject-omniview.mjs`);
  } else {
    writeFileSync(host.file, after);
    console.log(`injected    ${host.file} (${host.mode})`);
  }
}

if (check && dirty) process.exit(1);
