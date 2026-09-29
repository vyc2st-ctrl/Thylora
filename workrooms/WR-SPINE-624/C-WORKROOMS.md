# C · Department Workroom Architecture

## Verdict: the existing schema supports persistent department workrooms. No new table was created.

| Workroom field (Chairman list) | Where it lives now |
|---|---|
| department name, purpose | `thylora_departments.name / purpose` (67 rows) |
| people / staff | `thylora_department_personnel` (132 rows) — counted per department by the view |
| authority | `thylora_workroom_registry.evidence->workroom_card->authority` |
| current projects | card `current_projects` (+ existing workrooms named) |
| current work queue | `thylora_workroom_task_registry` joined by `workroom_code` (view: `work_items`, `open_work_items`) |
| evidence, dependencies | `thylora_workroom_registry.evidence`, `current_blockers` |
| budget, payroll, assets, facilities | card fields — **UNKNOWN** for all 12: no department budget exists; `thylora_pay_periods` is not linked to departments |
| software, world location, Earth adapter | card fields |
| products/services, revenue routes, help routes, rights/privacy | card fields (+ `thylora_department_profiles` where a profile exists: 39 rows) |
| next executable work, restart point | `thylora_workroom_registry.restart_point` + card |
| last verified movement | `thylora_workroom_registry.updated_at` (view column `last_verified_movement`) |

The join is published as **`thylora_department_workroom_v1`** (migration `spine_624_workroom_view_and_word_coverage`,
file `db/spine-624/0001_…sql`). It is `security_invoker = true`, so row-level security on every underlying table still
applies to the reader; `anon` has no access.

## The 12 workrooms — desks inside existing departments, never new departments

| Requested | Workroom | Host department (existing) | Desk |
|---|---|---|---|
| Legal Root Chamber | `WR-DEPT-LEGAL-ROOT-624` | `DEPT-LEGAL-COMP-001` | Legal Root Chamber (+ liaison to the Law House) |
| Court / Justice Systems | `WR-DEPT-COURT-JUSTICE-624` | `DEPT-LEGAL-COMP-001` | Court Operations & Access Desk (PROPOSED) |
| World Ecology / Animal Life | `WR-DEPT-WORLD-ECOLOGY-624` | `LIVING_WORLD_ATLAS` | Animal Life + Care Network |
| Media / Broadcasting | `WR-DEPT-MEDIA-624` | `MEDIA_AND_BROADCASTING` | Broadcast + Business Paper (with WR-NEWS-001) |
| Commerce / Store | `WR-DEPT-COMMERCE-STORE-624` | `THY-DEPT-STORE-OPS-001` | Store Ops + Back to Buy |
| Kaelorps / Education | `WR-DEPT-KAELORPS-EDU-624` | `EDUCATION_AND_UNDERSTANDING` | Kaelorps sponsored schools |
| Archive / Library | `WR-DEPT-ARCHIVE-LIBRARY-624` | `ARCHIVE_AND_PROVENANCE` | Source custody + library |
| Systems / Dashboard / API | `WR-DEPT-SYSTEMS-API-624` | `SYSTEMS` | Dashboard + API v1 |
| Health / Food / Nutrition | `WR-DEPT-HEALTH-FOOD-624` | `FOOD_INGREDIENT_INVESTIGATION` | Recipe factory (+ WELLNESS_AND_DAILY_LIFE) |
| Design Engineering | `WR-DEPT-DESIGN-ENGINEERING-624` | `PRODUCT_DEVELOPMENT` | Design Engineering |
| Transportation / Infrastructure | `WR-DEPT-TRANSPORT-INFRA-624` | `OPERATIONS` | Transportation & Infrastructure |
| Community Help / Human Support | `WR-DEPT-COMMUNITY-HELP-624` | `CUSTOMER_HELP_AND_RESOLUTION` | Human support (+ Doubt Remover 607) |

Verified after write: 12 rows in the view, 12 of 12 cards carry every field.

## Defect found: two department codes fail the backend's own NameGuard

`thylora_name_guard_violates()` returns **true** for `EDEREARIAH_LAW_HOUSE` and `EDEREARIAH_NEWSROOM` — live department
codes carrying a non-canonical planet spelling. Every guarded table (workrooms, tasks, restart records, living-world
and world-design records) therefore refuses any row that names them. The Law House — whose recorded purpose covers
"courts" — cannot be referenced by code, which is one reason the Court desk sits under `DEPT-LEGAL-COMP-001` and the
Law House is referenced by its id `e225c39a-a0c5-4790-ab31-7366ed7a2f29`. Renaming a department code is a
Chairman-level change, so it is logged as `SP624-C-LAWHOUSE-CODE` (APPROVAL_REQUIRED) rather than changed.

## Staffing truth

Only 3 of the 12 host departments hold any personnel rows (`DEPT-LEGAL-COMP-001` 10, `FOOD_INGREDIENT_INVESTIGATION` 1,
Doubt Remover 1). The cards say so. No person was invented to fill them; the four court people are PROPOSED only.

## Restart point

`select * from thylora_department_workroom_v1 where workroom_code like 'WR-DEPT-%-624';` — each row is a workroom;
its open items are `select * from thylora_workroom_task_registry where task_code like 'SP624-%'`.
