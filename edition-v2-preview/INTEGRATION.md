# Integrating the Edition Preview panel into the Chairman dashboard

`DASHBOARD_AUTHORITY.md` in this repository is explicit: **this repository is not
the deployment source of truth for the Chairman dashboard.** The authoritative
deployment repository is `vyc2st-ctrl/thylora-executive-dashboard`, witnessed on
`thylora-public-world`.

So the panel is built here and promoted there. Promotion is a separate act and
requires Chairman authority. Nothing in this directory is live until it is done.

## Step 1 — backend first

Apply the migration. The panel is useless without it and says so honestly rather
than rendering an empty board.

1. Run `sql/0000_preflight_schema.sql` (read-only) and confirm the column names
   used by the `thylora_edf_preview_source` view at the top of `0001`.
2. Correct that view if the real names differ. It is the only place `0001`
   touches the EDF content tables.
3. Apply `sql/0001_edf_chairman_preview.sql`.

## Step 2 — copy one file

Copy `dashboard-panel/edition-preview.js` to `js/edition-preview.js` in
`vyc2st-ctrl/thylora-executive-dashboard`.

## Step 3 — two edits to `index.html`

**a. Mount the panel.** In the `Store Release` room (`index.html` line 87),
insert this article *before* the existing `data-panel="edf-release"` article.
Reading comes before approving, so the panel sits above it:

```html
<article class="r5-panel" style="grid-column:1/-1"><h3>Edition Preview <span class="sub" style="font-weight:400">· read the artifact before you decide · no publish path on this panel</span></h3><div data-panel="edition-preview"><div class="panel-state panel-state--loading"><p class="panel-state__title">Reading the Edition preview board…</p></div></div></article>
```

**b. Load the module.** In the script line (`index.html` line 94), add this tag
immediately *before* `js/edf-release-approval.js`:

```html
<script src="js/edition-preview.js"></script>
```

## Step 4 — one edit to `js/app.js`

`js/app.js` lines 92 and 94 each call every panel loader. Add
`window.thyloraLoadEditionPreview?.();` to both, next to
`window.thyloraLoadEdfRelease?.();`, so the panel refreshes with the rest.

## What must not be added

No publish call belongs on this panel. `thylora_edf_publish_v1` freezes release
metadata permanently and lives on **Complete the Release**, gated behind
`thylora_edf_validate_v1`. Keeping the irreversible act off the reading surface
is the separation this whole workstream exists to create.

## Baseline

`dashboard-baseline.json` requires that a new dashboard version preserve every
listed capability. This panel **adds** a capability and removes none. It does not
alter `Approvals`, `Products`, `Digital Product Passports`, `Orders`,
`Entitlements`, `Continuity` or any other baseline surface.
