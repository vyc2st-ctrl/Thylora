# THE EDEREAIRAH WAREHOUSE — Q355
Built 2026-09-10. Continuity: THY-Q-20260910-WAREHOUSE-UX-355.

The instruction was to stop expanding the backend and move into the changing
EdereAirah warehouse and marketplace UX, with all privacy gates preserved. This is
that surface. It is a front door, not a product grid.

## WHERE IT IS

`https://thylora-warehouse.vercel.app` — new Vercel project `thylora-warehouse`.
Repo: `surfaces/warehouse/index.html` + `surfaces/warehouse/vercel.json`.

Live fetch (request 17288): **200**, 20,893 bytes,
md5 `c763b90cb61999cb194546ce7d185073`. The repo file is 20,893 bytes,
md5 `c763b90cb61999cb194546ce7d185073`. Identical.

It needs no sign-in, so putting it on a new origin costs nobody a re-login.

## THE FIVE DOORS, AND WHAT EACH ONE HONESTLY IS

The doors are the ones named: EXPLORE, CREATE, LEARN, BRING SOMETHING BACK,
BUILD WITH US. Every door states its own condition **before** the customer walks
through it, because the failure mode of a marketplace like this one is walking
somebody into a door that does not open.

| door | state on the page | why that is the true state |
|---|---|---|
| 1 EXPLORE | **OPEN** | goes to the itemised floor at `thylora-store.vercel.app`, which is live |
| 2 CREATE | **BUILT · NOTHING OPEN** | the submit path is finished and tested; eight wares behind it have authorized prices and none is open, because no turnaround has been agreed |
| 3 LEARN | **NOT BUILT** | no world reference is published. No lesson, guide, course or reading room exists |
| 4 BRING SOMETHING BACK | **NOT BUILT** | specifications exist; manufacturing does not, and no Earth maker is contracted |
| 5 BUILD WITH US | **NOT BUILT** | no application, no seller onboarding, no partner programme |

Each closed door carries a `WOULD OPEN WHEN:` line naming the condition, so a shut
door is a statement rather than a shrug. One of five is open, and the header says so
in the first paragraph rather than at the bottom.

Door 4 is read as the door you leave through carrying something — the keepable object
lane, which is where VLEGH and the physical wares live. If the Chairman meant it as
returns, or as bringing Earth material *in*, say so and it moves; nothing else on the
page depends on that reading.

## WHAT ACTUALLY CHANGES, AND WHAT NEVER DOES

The floor holds fourteen things. **The one purchasable item is pinned and never
rotates out.** The other thirteen rotate position daily, computed from the date with
no network call and no server.

The page states the limit of that plainly: rotation moves *position only*. It never
changes whether something is open, and every one of the thirteen is closed to orders
on every day. A warehouse that appeared to restock while nothing had changed would be
decoration pretending to be substance, so the mechanism is named on the page instead
of being hidden behind it.

Verified by running the page's own script: 13 entries, rotation index computed to
position 11 of 13 today, and the rotation note printed the matching sentence.

## EVERY ITEM CARRIES ITS TRUE STATE

Each of the thirteen rotating rows carries the reason it is closed, not a generic
label. MirrorWardrobe says 0 houses and 0 looks are published, so a buyer would be
choosing from an empty rail. The three services say their prices are proposed and not
authorized. The two QYRIS entries say there is no runtime and nothing is priced until
it runs. The four elevated wares say publication consent cannot be given at all.

## THE SIX RELATIONSHIP STATES

All six are on the page — ErsatzV owned, Authorized Earth Maker, Selected seller,
Sponsored, Supported, Listed with no endorsement — each with what it means and who
holds it. **One is held: ErsatzV owned, all fourteen items.** The other five say
plainly that nobody holds them.

The rule is stated as a rule and not as a disclaimer: *listed is not sponsored, sold
is not endorsed, and a maker is not an Authorized Earth Maker.* The exact authorized
maker language is on the live bytes, verified by string match:
`Authorized Earth Maker of an EdereAirah ErsatzV Brand Ware`.

## VLEGH IS NOT A TRADING CARD

The page carries its own section saying so. A VLEGH is an EdereAirah object carrying
provenance and world identity, origin and where in EdereAirah that place is, creator
and edition and the maker of that particular one, its story and its relationships to
other objects and houses and people, its authenticity held as a record that can be
read back, a deeper digital record that outlives the physical piece, and a physical
geometry, material and visual language of its own. Earth trading cards are named as a
reference for collecting behaviour and nothing else.

And it ends where it has to: none of that is manufactured, a specification is not an
object, and when a VLEGH can be held it will be behind door four with the maker's name
on it.

## PRIVACY GATES — PRESERVED AND STATED, NOT SOFTENED

The page carries them as gates rather than preferences: private by default;
publication consent asked every time with no as the default, and **no yes available at
all** where a child or a pregnancy may appear; guardian consent given by the guardian
themselves; your material stays yours; deletion is real and the system refuses to
report a deletion complete unless storage is verified empty; and no public route
exists for customer imagery, because none was built.

That last one is the strongest form available and is stated as such: not a policy
against publishing, an absence of anywhere to publish to.

## HOW IT WAS VERIFIED

- **Live bytes**: request 17288, 200, md5 identical to the repo file.
- **Content**: five doors present, door 4 named, VLEGH section present with
  "Not a trading card", exact maker language present, `ARIAH` absent, deletion gate
  present — all matched against the live response body, not the local file.
- **Rendering**: rendered in Chromium from the local file. The two-column door grid,
  the pinned purchasable item, the thirteen script-injected rows and the counted
  footer all render as intended.
- **Phone width**: measured at a true 390px layout viewport —
  `documentElement.scrollWidth = 390`, `overflows = false`, widest right edge 390.
  The store-front surface measured the same. Neither page scrolls sideways.

One correction worth recording: a first screenshot appeared to show the page clipped
at the right edge, and I read that as horizontal overflow. It was not. A control page
proved Chromium's `--window-size=390` lays out at its 500px floor and merely crops the
image to 390, so the clipping was in the screenshot and not in the page. The 390px
measurement above is the real one, taken inside an iframe at that exact width.

## REACHABLE FROM WHERE A BUYER ACTUALLY LANDS

A front door nobody can find is not a front door.

- `/pages/your-order` on the Shopify store now carries a "The front door" section
  linking the warehouse. Page updated 2026-09-10T12:37:28Z; live probe 17293
  returned **200** with the warehouse link in the served HTML.
- The shelf now carries a line in its header pointing at the warehouse as the front
  door. Redeployed and verified: request 17292, **200**, 30,955 bytes,
  md5 `8aaa844ad50d1bc043367e3e775108df`, identical to the repo file, warehouse link
  present.

## MONEY GATES — STILL UNMOVED

| gate | state |
|---|---|
| CHECKOUT | **NOT PROVEN** |
| PAYMENT | **UNPROVEN — REAL MONEY NOT YET CAPTURED**, 0 capture witnesses |
| REACCESS | **0** |
| SUBMIT USED | **0** |

The warehouse footer publishes those four as failing rows on the customer-facing page
itself. Nothing in this surface moves them, and no ware was activated to build it.

## WHAT THIS SURFACE DOES NOT YET DO

- No search, no filtering and no categories. Fourteen items do not need them; a
  catalog of hundreds will, and that is the honest reason it is absent rather than a
  claim that it is finished.
- No imagery anywhere. There is no artwork to show, and placeholder imagery on a
  warehouse floor would be exactly the kind of decoration this page refuses.
- The floor list is written into the page rather than read from the store at request
  time. A static page cannot query Shopify; the counts in the footer were read live
  from the store at 2026-09-10T12:33Z and the timestamp says so, which is the honest
  version of a static snapshot.
- Doors 3, 4 and 5 have no content behind them because none exists. They were not
  filled with plausible-sounding placeholders.
