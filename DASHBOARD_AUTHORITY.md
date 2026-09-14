# THYLORA Dashboard Authority

Current deployment authority is **not this repository**.

Authoritative runtime project: `thylora-public-world`

Authoritative deployment repository: `vyc2st-ctrl/thylora-executive-dashboard`

Backend: `thylora-dash` (`jvsdxhrfhtlgaknhjxlz`)

This `vyc2st-ctrl/Thylora` repository may contain development/history source, experiments, app assets, or material to be intentionally merged forward. It must not be treated as the deployment source of truth for the Chairman dashboard unless the Chairman explicitly changes authority.

Rule: changes intended for the live Chairman dashboard must be merged into `vyc2st-ctrl/thylora-executive-dashboard` and witnessed on `thylora-public-world` before they are called live.

---

## Pending merge-forward

**Dashboard R6 Chairman workspace** (`THY-DASH-R6-WORKSPACE-001`) — live readback,
margin notes, Pencil canvas, preview room, Prompt Coverage Ledger, Global Arrival
Matrix and Store Money-Distance.

- Source: `dashboard/r6/`, backend migration `db/dashboard/0001_r6_workspace.sql`,
  account in `workrooms/WR-DASH-R6-001.md`.
- Footprint on `dashboard-current-head.html`: two lines at the end of the body
  (one stylesheet, one module). 14 insertions, 0 deletions. No baseline
  capability is altered.
- **Not deployed. Not witnessed on iPad.** Under the rule above, it must be
  merged into `vyc2st-ctrl/thylora-executive-dashboard` and witnessed on
  `thylora-public-world` before any part of it is called live.

Note for whoever performs that merge: `dashboard-current-head.html` in this
repository carries release marker `THY-UI-20260823-0925-R5`, while the patch
workflows in `.github/workflows/` reference markers through
`THY-UI-20260824-1300-R8`. This snapshot is therefore behind the authoritative
head, which is a further reason the R6 lane must be applied to the authoritative
repository rather than deployed from here.
