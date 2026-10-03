# THE WINDOW — Live from the Link

RAE Link flagship show · WR-RAELINK-001 · code: `rae-link/lib/countdown.js` · tests: `tests/countdown.test.mjs`

A daily live countdown from a **street-level glass studio downtown** — the crowd outside the window is part of the show. Not MTV, not TRL: ours. It plays **our people's Earth videos**, family history finds and world-channel premieres, voted by members.

## Name options (pick one; working title in **bold**)
**THE WINDOW** · Request Line · The Ten · Live from the Link · Glass House Live · Front Row Downtown

## Show clock (60 minutes)
| Time | Segment | What happens |
|---|---|---|
| :00 | Cold open at the glass | Hosts outside with the crowd; today's #1 teased |
| :03 | **The Ten** 10 → 6 | Member-voted countdown |
| :15 | **Earth Cam** | Our people's Earth videos — real creators, real places |
| :25 | **Roots Reel** | A Root House find: the record on screen, the family who found it, the archive credited |
| :33 | **The Ten** 5 → 2 | |
| :42 | **Tea Talk** | A guest at the glass; one question each from the Request Line |
| :50 | **World Premiere** | An EdereAriah world-channel piece, labelled as simulated world media |
| :55 | **The Ten** #1 + Request Line shout-outs | |

## Rules (enforced in code)
- Only **published, rights-cleared** works can chart (`eligible`). No exceptions for popularity.
- World works carry their **simulated-world label on air**.
- **5 votes per member per day, 1 per work per day.** Ties go to the work that got there first.
- Works **retire to the Hall** after 45 days on the countdown, so the chart keeps moving.
- Revenue from the show settles through the existing RAE Link ledger — creators see their share.

## What it needs to go live
1. RAE Link backend applied (held Chairman action, B1/B2 in WR-RAELINK-001).
2. A `rael_votes` table + daily countdown view (next migration, mirrors `countdown.js`).
3. Studio location, hosts, and a streaming provider choice (B3).
