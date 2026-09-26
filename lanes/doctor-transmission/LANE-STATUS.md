# DOCTOR TRANSMISSION · lane status

**Lane type:** separate first-post lane
**Route:** DOCTOR-TRANSMISSION: SCENE → PERSON → VISUAL → RIGHTS → LEGAL → PUBLICATION
**Current gate:** **SCENE: HOLD**

## Standing rule
**Do not render another doctor image until its measured scene contract passes the SCENE gate.**
No render was made in this workroom.

## Why it is held
- SCENE evidence floor = 1.0. A written, *measured* contract must exist before any render.
- This workroom did not find or receive the measured scene contract. Its location and content are **UNKNOWN**. It is not reconstructed or guessed here.
- A medical depiction triggers VISUAL **ESCALATE**, and a first post triggers PUBLICATION **ESCALATE**. Both need Chairman instruction even after SCENE passes.

## Isolation from other lanes (proven)
Gate receipts are per route instance. This lane's SCENE/VISUAL HOLD **cannot** lower X on any other route. See the test `a held Doctor Transmission scene does not block the product lanes` in `tests/gate-network.test.mjs`. The product, store, school and education lanes continue.

## Next safe action (autonomy may do)
- Locate the existing scene contract in the THYLORA sources, then attach it here with its measurements per clause.

## Needs Chairman
- The contract text, if it exists only outside this repository.
- The first-post decision.
