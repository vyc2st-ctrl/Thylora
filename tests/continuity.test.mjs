// THYLORA · backend continuity tests
// Workroom: WR-THYAPP-001
//
// This is the guard against the failure mode the THYLORA lanes are most at
// risk from: a new surface quietly standing up its own backend, its own
// storefront or its own Chairman spine, and drifting away from the canonical
// one. It scans the whole repository rather than trusting any single file.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BACKEND_PROJECT, SUPABASE_URL, SUPABASE_KEY, SESSION_KEY }
  from '../lib/thylora-backend.js';
import { backendContract, SECTIONS, SERVICES, section, heldByThisLane, heldByOtherLanes, PROVISIONERS }
  from '../thylora-app/lib/registry.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SKIP_DIRS = new Set(['.git', 'node_modules', '.vercel']);
const TEXT = new Set(['.js', '.mjs', '.cjs', '.json', '.html', '.css', '.sql', '.md', '.webmanifest', '.sh', '.yml', '.yaml']);

function walk(dir = ROOT, found = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, found);
    else if (TEXT.has(extname(entry))) found.push(full);
  }
  return found;
}

const FILES = walk().map(path => ({ path: relative(ROOT, path), text: readFileSync(path, 'utf8') }));

test('the repository scan actually found the source', () => {
  assert.ok(FILES.length > 20, `only ${FILES.length} files scanned`);
  assert.ok(FILES.some(f => f.path === 'thylora-app/app.js'));
  assert.ok(FILES.some(f => f.path === 'app/app.js'));
});

/* --------------------------------------------------------- ONE backend only */
test('every Supabase reference in the repository points at the one canonical project', () => {
  const refs = new Map();
  for (const file of FILES) {
    for (const match of file.text.matchAll(/https:\/\/([a-z0-9]{16,})\.supabase\.co/g)) {
      if (!refs.has(match[1])) refs.set(match[1], []);
      refs.get(match[1]).push(file.path);
    }
  }
  assert.deepEqual([...refs.keys()], [BACKEND_PROJECT],
    `expected only ${BACKEND_PROJECT}, found: ${JSON.stringify([...refs.entries()])}`);
  assert.equal(SUPABASE_URL, `https://${BACKEND_PROJECT}.supabase.co`);
});

test('any file that declares the backend constants declares the canonical values', () => {
  // app/app.js is a witnessed classic script that carries its own copy. It is
  // allowed to, but it may not drift: if these ever disagree, one surface is
  // talking to a different backend or holding a different session.
  const declarers = FILES.filter(f => /(?:const|let|var)\s+SUPABASE_URL\s*=/.test(f.text));
  assert.ok(declarers.length >= 1);
  for (const file of declarers) {
    const url = file.text.match(/SUPABASE_URL\s*=\s*'([^']+)'/)?.[1];
    assert.equal(url, SUPABASE_URL, `${file.path} declares a different backend URL`);
    const key = file.text.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)?.[1];
    if (key) assert.equal(key, SUPABASE_KEY, `${file.path} declares a different publishable key`);
  }
});

test('one sign-in covers every surface: the session key never varies', () => {
  const declarers = FILES.filter(f => /SESSION_KEY\s*=\s*'/.test(f.text));
  assert.ok(declarers.length >= 2, 'expected the member app and the canonical client to both name it');
  for (const file of declarers) {
    const key = file.text.match(/SESSION_KEY\s*=\s*'([^']+)'/)[1];
    assert.equal(key, SESSION_KEY, `${file.path} uses a different session key, which would split sign-in`);
  }
});

test('the new shell imports the canonical client instead of redeclaring it', () => {
  const shell = FILES.filter(f => f.path.startsWith('thylora-app/'));
  assert.ok(shell.length >= 7);
  for (const file of shell) {
    if (file.path.endsWith('sw.js')) continue; // caches the file by path, does not declare constants
    assert.ok(!/(?:const|let|var)\s+SUPABASE_(?:URL|KEY)\s*=/.test(file.text),
      `${file.path} declares its own backend constants`);
    assert.ok(!/(?:const|let|var)\s+SESSION_KEY\s*=/.test(file.text),
      `${file.path} declares its own session key`);
  }
  const app = FILES.find(f => f.path === 'thylora-app/app.js');
  assert.match(app.text, /from '\.\.\/lib\/thylora-backend\.js'/);
});

test('RAE Link now shares the canonical client rather than holding a second copy', () => {
  const backend = FILES.find(f => f.path === 'rae-link/lib/backend.js');
  assert.match(backend.text, /from '\.\.\/\.\.\/lib\/thylora-backend\.js'/);
  assert.ok(!/(?:const|let|var)\s+SUPABASE_URL\s*=/.test(backend.text));
  // Everything the RAE Link surface imports must still be available.
  const surface = FILES.find(f => f.path === 'rae-link/app.js');
  const imported = surface.text.match(/import \{([^}]+)\}\s*\n?\s*from '\.\/lib\/backend\.js'/)[1]
    .split(',').map(s => s.trim()).filter(Boolean);
  for (const name of imported) {
    assert.match(backend.text, new RegExp(`\\b${name}\\b`), `rae-link/lib/backend.js no longer provides ${name}`);
  }
});

/* ------------------------------------------ the shell touches only what it declares */
test('every backend path the shell calls is declared in its registry', () => {
  const declared = new Set(backendContract().map(o => o.name));
  const shell = FILES.filter(f => f.path.startsWith('thylora-app/') && f.path.endsWith('.js'));
  for (const file of shell) {
    for (const match of file.text.matchAll(/\/rest\/v1\/([a-z_0-9]+)/g)) {
      const name = match[1];
      if (name === 'rpc') continue;
      assert.ok(declared.has(name), `${file.path} calls ${name}, which the registry does not declare`);
    }
  }
});

/* ---------------------------------------------- Ask Ersatz is not duplicated */
test('Ask Ersatz routes through the same storefront service, not a second one', () => {
  assert.equal(section('ask-ersatz').service, 'STOREFRONT');
  assert.equal(section('store').service, 'STOREFRONT');
  assert.equal(section('my-purchases').service, 'STOREFRONT');
  assert.equal(section('my-questions').service, 'STOREFRONT');
  // The storefront service names the existing commerce objects; the shell adds
  // no parallel product/order/entitlement store of its own.
  assert.equal(SERVICES.STOREFRONT.products, 'products');
  assert.equal(SERVICES.STOREFRONT.orders, 'orders');
  assert.equal(SERVICES.STOREFRONT.entitlements, 'entitlements');
});

test('there is exactly one question-submission path and one checkout path', () => {
  const contract = backendContract();
  const questionPaths = contract.filter(o => o.kind === 'rpc' && /question/i.test(o.name));
  assert.deepEqual(questionPaths.map(o => o.name), ['submit_ersatz_question_v1']);

  const checkoutPaths = contract.filter(o => o.kind === 'rpc' && /checkout|purchase|buy/i.test(o.name));
  assert.deepEqual(checkoutPaths.map(o => o.name), ['begin_storefront_checkout_v1']);

  // And only one question table, shared by Ask Ersatz and My Questions.
  const questionTables = contract.filter(o => o.kind === 'table' && /question/i.test(o.name));
  assert.equal(questionTables.length, 1);
  assert.deepEqual(questionTables[0].sections.sort(), ['ask-ersatz', 'my-questions']);
});

test('the migrations add no second storefront', () => {
  const sql = FILES.filter(f => f.path.startsWith('db/thylora-app/') && f.path.endsWith('.sql'));
  assert.ok(sql.length === 5, `expected 5 migrations, found ${sql.length}`);
  const created = sql.flatMap(f =>
    [...f.text.matchAll(/create\s+table\s+if\s+not\s+exists\s+([a-z_0-9]+)/gi)].map(m => m[1].toLowerCase()));
  for (const reserved of ['products', 'orders', 'entitlements', 'digital_product_passports', 'thylora_departments']) {
    assert.ok(!created.includes(reserved), `a migration creates ${reserved}, which already exists canonically`);
  }
  // Order revenue is read through a view, never copied into this lane.
  assert.ok(sql.some(f => /create\s+or\s+replace\s+view\s+thy_order_arrivals/i.test(f.text)));
});

/* ------------------------------ the Chairman spine is reused, not re-invented */
test('the Chairman command spine is the canonical existing RPC', () => {
  assert.equal(SERVICES.CHAIRMAN_COMMAND.submit, 'submit_thylora_chairman_command_v1');
  const declared = backendContract().find(o => o.name === 'submit_thylora_chairman_command_v1');
  assert.equal(declared.status, 'EXISTING', 'the command spine must be reused, not declared as new');

  // The authoritative dashboard calls the same RPC. If these ever diverge, the
  // mobile shell and the dashboard are routing Chairman commands differently.
  const dashboard = FILES.find(f => f.path === 'dashboard-current-head.html');
  assert.match(dashboard.text, /submit_thylora_chairman_command_v1/);

  // No migration in this lane redefines it.
  const sql = FILES.filter(f => f.path.startsWith('db/thylora-app/'));
  for (const file of sql) {
    assert.ok(!/function\s+submit_thylora_chairman_command_v1/i.test(file.text),
      `${file.path} redefines the canonical command spine`);
  }
});

test('the shell adds no competing dashboard and leaves deployment authority alone', () => {
  const added = FILES.filter(f =>
    f.path.startsWith('thylora-app/') && /dashboard/i.test(f.path));
  assert.deepEqual(added, [], 'the mobile lane must not add a dashboard surface');

  // The authority document must still name the other repository as the source
  // of truth for the Chairman dashboard.
  const authority = FILES.find(f => f.path === 'DASHBOARD_AUTHORITY.md');
  assert.match(authority.text, /thylora-executive-dashboard/);
  assert.match(authority.text, new RegExp(BACKEND_PROJECT));
});

/* ------------------------------------------------ honest degradation posture */
test('held objects are marked held, and existing ones are not claimed as new', () => {
  const contract = backendContract();
  const existing = contract.filter(o => o.status === 'EXISTING').map(o => o.name).sort();
  assert.deepEqual(existing, [
    'digital_product_passports', 'entitlements', 'orders', 'products',
    'public_get_site_metrics', 'submit_thylora_chairman_command_v1',
    'submit_thylora_review_gate_decision_v1', 'thylora-ai-router',
    'thylora_approval_queue_safe_v1', 'thylora_departments',
    'thylora_edf_publish_v1', 'thylora_edf_release_board_v1',
    'thylora_margin_note_add_v1', 'thylora_margin_queue_v1',
    'thylora_user_roles'
  ]);
  // Every object names a real provisioning lane.
  for (const object of contract) {
    assert.ok(PROVISIONERS.includes(object.provisionedBy),
      `${object.name} claims unknown provisioner ${object.provisionedBy}`);
  }

  // Everything this lane holds must have a migration that creates it...
  const sql = FILES.filter(f => f.path.startsWith('db/thylora-app/') && f.path.endsWith('.sql'))
    .map(f => f.text).join('\n');
  for (const object of heldByThisLane()) {
    assert.match(sql, new RegExp(object.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      `${object.name} is declared HELD by this lane but no migration creates it`);
  }

  // ...and nothing another lane owns may be created here, or two lanes would
  // race to define the same object.
  for (const object of heldByOtherLanes()) {
    // Anchor on the object NAME immediately after the create clause. Reading
    // another lane's table (this lane's continuity view joins
    // rael_media_assets) is correct reuse; creating one is the drift.
    const creates = new RegExp(
      `create\\s+table(?:\\s+if\\s+not\\s+exists)?\\s+${object.name}\\b` +
      `|create\\s+or\\s+replace\\s+(?:view|function)\\s+${object.name}\\b`, 'i');
    assert.ok(!creates.test(sql),
      `${object.name} belongs to the ${object.provisionedBy} lane but db/thylora-app creates it`);
  }
  assert.deepEqual(heldByOtherLanes().map(o => `${o.name}:${o.provisionedBy}`).sort(), [
    'begin_storefront_checkout_v1:COMMERCE',
    'rael_channels:RAE_LINK',
    'rael_media_assets:RAE_LINK',
    'rael_media_renditions:RAE_LINK',
    'rael_provenance_events:RAE_LINK',
    'rael_rights_records:RAE_LINK'
  ]);
});

test('the shell resolves the Chairman from the canonical role table', () => {
  // The dashboard resolves the Chairman from thylora_user_roles. If the shell
  // read only the JWT claim it would refuse an identity the backend accepts,
  // locking the Chairman out of his own workspace.
  const identity = FILES.find(f => f.path === 'thylora-app/lib/identity.js');
  assert.match(identity.text, /thylora_user_roles/);
  // And user_metadata is still ignored.
  assert.match(identity.text, /user_metadata`? is (?:editable|ignored)/);

  const app = FILES.find(f => f.path === 'thylora-app/app.js');
  assert.match(app.text, /resolveChairmanRole/);
  // Resolved before the first route decision, or a deep link would bounce.
  assert.match(app.text, /await resolveChairmanRole\(\);\s*\nauthUI\(\);/);
  // And cleared on sign-out, so a role cannot outlive its session.
  assert.match(app.text, /signOut\(\);\s*\n\s*clearResolvedRole\(\);/);
});

test('the corrected migrations define no second Chairman gate', () => {
  const sql = FILES.filter(f => f.path.startsWith('db/thylora-app/') && f.path.endsWith('.sql'));
  for (const file of sql) {
    // A second gate is the most dangerous drift: two gates can disagree and the
    // weaker one wins.
    assert.ok(!/create\s+or\s+replace\s+function\s+thy_is_chairman/i.test(file.text),
      `${file.path} defines its own Chairman gate`);
    assert.ok(!/create\s+table[^;]*\bthy_approvals\b/i.test(file.text),
      `${file.path} creates a second approval store`);
    assert.ok(!/create\s+table[^;]*\bthy_margin_notes\b/i.test(file.text),
      `${file.path} creates a second margin store`);
  }
  // Every policy uses the canonical gate.
  const rls = FILES.find(f => f.path === 'db/thylora-app/0004_rls_policies.sql');
  assert.ok(/thylora_is_chairman\(\)/.test(rls.text));
  assert.ok(!/[^a-z_]thy_is_chairman\(\)/.test(rls.text));
  // And the lane refuses to apply if the canonical gate is absent.
  const chairmanSql = FILES.find(f => f.path === 'db/thylora-app/0003_chairman_workspace.sql');
  assert.match(chairmanSql.text, /THY-CONTINUITY/);
  assert.match(chairmanSql.text, /to_regprocedure\('public\.thylora_is_chairman\(\)'\)/);
});

test('no credential is stored anywhere in the media studio lane', () => {
  // Provider credentials remain server-side in the Edge Function. A column or
  // a stored value here would be a credential on the client's side of the line.
  const lane = FILES.filter(f =>
    f.path.startsWith('db/thylora-app/') || f.path.startsWith('thylora-app/'));
  for (const file of lane) {
    // Strip comments before scanning, so the prohibition notes themselves pass.
    const code = file.text
      .replace(/^\s*--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    for (const forbidden of [
      /\bpassword\b\s+text/i,
      /\bapi_key\b/i,
      /\bprovider_secret\b/i,
      /\bsecret_key\b/i,
      /\bbearer\s+sk-/i
    ]) {
      assert.ok(!forbidden.test(code), `${file.path} appears to hold a credential (${forbidden})`);
    }
  }
});

test('the media studio migration enforces the no-claim rule in the database', () => {
  const sql = FILES.find(f => f.path === 'db/thylora-app/0005_media_studio.sql');
  assert.ok(sql, 'the media studio migration is missing');
  // The UI rule must have a floor under it, so no other writer can mark a job
  // reviewable without provider evidence.
  assert.match(sql.text, /thy_job_no_claim_without_provider_asset/);
  assert.match(sql.text, /SUCCEEDED/);
  // A failure must carry a reason, and a queued job must name its output.
  assert.match(sql.text, /thy_job_failure_explained/);
  assert.match(sql.text, /thy_job_queued_names_output/);
  // Markup is vectors and must not be empty.
  assert.match(sql.text, /thy_markup_not_empty/);
  assert.match(sql.text, /thy_markup_pencil_subset/);
});

test('the shell never renders an absent table as an empty feed', () => {
  const app = FILES.find(f => f.path === 'thylora-app/app.js');
  // Every failed read is routed through reportFailure, which distinguishes
  // "not provisioned yet" from "unreachable" from a real error.
  assert.match(app.text, /not provisioned yet/);
  assert.match(app.text, /Backend unreachable/);
  assert.ok(app.text.split('reportFailure').length - 1 >= 8,
    'most section loaders should report failure honestly');
});

test('every section in the registry has a loader and a matching DOM section', () => {
  const app = FILES.find(f => f.path === 'thylora-app/app.js');
  const html = FILES.find(f => f.path === 'thylora-app/index.html');
  for (const s of SECTIONS) {
    assert.ok(html.text.includes(`id="${s.id}"`), `index.html has no section for ${s.id}`);
    assert.ok(new RegExp(`['"]?${s.id}['"]?\\s*:`).test(app.text) || s.id === 'home',
      `app.js has no loader entry for ${s.id}`);
  }
  // Account is the shell's own surface, outside the registry.
  assert.ok(html.text.includes('id="account"'));
});
