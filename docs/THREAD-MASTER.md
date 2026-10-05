# THYLORA · THREAD MASTER

The running thread. Every session reads this first and updates it in the same
commit as its work. Status words: **DONE · BUILT · HELD · NEEDS FROM CHAIRMAN**.

_Last updated: 2026-10-03 · branch `claude/root-house-lineage`_

---

## 1 · Family lineage — The Root House · **BUILT**

Research building at `/lineage`. People first, then records.

- **Four lines, exact:** father's father · father's mother · mother's father ·
  mother's mother, numbered the standard genealogy way (Ahnentafel), down to
  great-grandparents, with parents on top.
- **47 real record sources** across US federal, Tennessee/Memphis/Shelby,
  Canada (Ontario, Nova Scotia, Québec), slavery and freedom records, the
  Atlantic, index sites and DNA. Each says who holds it, what years it covers,
  and what it actually gives you.
- **A research plan per person**, newest record first, with the DNA test that
  really follows that line (Y-DNA for father's father, mtDNA for mother's
  mother; father's mother and mother's father reached through the right relative).
- **Nine researchers on eight floors**, each a different silhouette (build,
  hair or hat, posture, tool); the tests fail if two look alike. They are world
  staff, labelled as such.
- **Credit Wall:** every finding names who found it, who remembered it, and the
  archive that holds it. Nothing goes on the wall uncredited.
- **The Canada Question** page: the great-grandmother claim, what history makes
  likely, the counterpoints, and the one census test that settles it.
- Saved on the device now; `db/lineage/0001_root_house.sql` is written and
  tested locally, **HELD** for Chairman apply to thylora-dash.

**NEEDS FROM CHAIRMAN:** the names. Any of them, even partial — your parents'
full names, grandparents' names or nicknames, towns, churches, dates, the
great-grandmother's first name. Nothing can be searched without at least one
name; the plan pages are ready to run the moment one is entered.

### The Canada great-grandmother — full breakdown

- **The claim:** your grandmother told your mother that your great-grandmother
  came from Canada and did not start in Memphis. Grade: ORAL, pending a record.
- **Most likely history:** Ontario (old Canada West) took in tens of thousands
  of freedom seekers before 1865, at Chatham, Buxton, Windsor, Amherstburg and
  St. Catharines. Many families moved back to the US after the war to rejoin
  relatives. A Canadian-born daughter or granddaughter later living in Memphis
  fits that pattern.
- **Also possible:** African Nova Scotian roots (Black Loyalists of 1783 in the
  Book of Negroes; Black Refugees of 1812–15), or a Montreal railway family.
- **Counterpoints:** "Canada" in family stories sometimes meant the North, or
  Detroit. The story may have shifted a generation. It may also be a
  non-African Canadian line. Records decide.
- **The fastest test:** the US census 1900–1940 gives her birthplace and both
  her parents' birthplaces. "Canada" in that column confirms the claim. The
  Canadian census and Ontario or Nova Scotia birth records then give you her
  parents.
- **Why the mainstream story misses this:** the usual telling of the Great
  Migration runs South to North. Families that went from Canada back to the
  South rarely appear in it, so a "Canada" story told in Memphis gets heard as a
  mistake when it can be exactly what happened.

## 2 · Family nights · **BUILT** → `docs/FAMILY-TEA-NIGHT.md`

*Tea Set Talk*, played with Grandma's tea set: you pour for the person on your
left; whoever has the pot talks; three rounds — Sweet (best part of the day),
Bitter (what was hard), Steep (what's still coming). The last round is the
*Grandmother's Cup*: a family-history question card, and the answer goes onto the
Root House Credit Wall with the name of the girl who asked. That makes Jordan,
Cali and Key the family's junior researchers. *Creature Feature* after tea:
*Frankenstein*, *Bride of Frankenstein*, *Dracula*, *The Conjuring 2*.

## 3 · Shows — THE WINDOW · **BUILT (format)** → `docs/SHOW-THE-WINDOW.md`

A daily countdown show in the style of *TRL*, from a glass studio over a
downtown Manhattan street, playing only Earth videos made by our own people. It
has five segments: the Countdown, First Play, Where You From? (wired to the Root
House), Grandma's Tea, and Who Got Paid (the RAE Link split, shown on screen).
**HELD:** music licensing provider; live-stream provider.

## 4 · Store · **IN REPO, CHECK LIVE**

`public-site/store.html` membership tiers: Free · $3.99 · $5.99 · $7.99 · $14.99 · Custom.
"Only cleared products receive purchase buttons." **HELD:** product clearance and
payment provider per the store's own "still being connected" list.

## 5 · Money · **BUILT, HELD AT PAYOUT**

RAE Link ledger (`rae-link/lib/ledger.js`, `db/rae-link/0005`): splits total
exactly 100%, rounding favors people over the house, no hidden percentage, and
nothing is marked paid without proof. **HELD:** creator payout provider (the
highest-cost decision), tax posture, legal agreements. See
`workrooms/WR-RAELINK-001.md` §4.

## 6 · Sportsbook + Chairman Casino (GAME-BET-001) · **IN REPO, GATED**

`app/sports-betting.html`. Hard gates for age and identity, Earth money, self
controls, integrity. **HELD:** licensing by jurisdiction before any real money.

## 7 · "My logic", "the new way", "undo logic" · **NEEDS FROM CHAIRMAN**

These were in earlier chat, and that chat does not carry into this session.
Nothing in the repository describes them. Paste them, or one line each, and they
go into this file so they never drop again.

## 8 · First post · **DRAFT**

> **The Root House is open.**
> My grandmother told my mother that my great-grandmother came out of Canada.
> She didn't start in Memphis. So we built a house to find her, and everyone
> else.
> Four lines: my father's father, my father's mother, my mother's father, my
> mother's mother. Nine desks. Every record we can reach: censuses, Freedmen's
> Bureau files, border crossings, church books, Canadian archives, DNA.
> Whoever finds a name gets their name on the wall next to it. That includes my
> girls, who ask one family question every night over their great-grandmother's
> tea set.
> We're reconstructing the people first. Then the story.

## 9 · Images · **NEEDS FROM CHAIRMAN**

The two pictures meant as the starting point for the research building did not
come through to this session; only text arrived. Send them again and the
building gets restyled to match. Until then, the building uses nine distinct
silhouettes, so no two researchers look like copies of one person.

## 10 · Why fixes kept "not staying fixed" · **DONE**

A chat starts every new session with an empty memory. The fix is
`CLAUDE.md` at the root of this repository, which loads automatically every
session. It holds these rules: do the work rather than describe it, cover every
lane in every reply, read and update this file, don't show a picture without
talking about it, grade every fact, follow the relevance directive, and credit
people.
