# SPINE 588 — the head read

**Work:** `THY-WORK-DASHBOARD-INTERACTION-CLOSEOUT-562`
**Status:** written and verified against PostgreSQL 16. **Not applied.**

The dashboard has to surface four things. Three already had a read. The fourth —
NEXT QUESTION — did not exist, because "the next question" lived in three places
at once: the next-better question on a topic, the open QYRIS frontier, and
whatever gate is currently blocking.

`thy_spine_next_question()` joins them and, more importantly, **orders** them:

1. **BLOCKED gates** — a question you cannot act on because a gate is shut is not
   the next question; the gate is.
2. **The open QYRIS frontier** — raised by a previous cycle and carried unresolved.
3. **The next-better question per topic.**

The surface does not get to choose which one to show.

`thy_spine_head()` returns all four surfaces in one read: TOPIC CONTEXT,
SEQUENCE LEDGER, CURRENT GATES, NEXT QUESTION — plus the 874 milestone state.

## Degrading honestly

Every join is guarded with `to_regclass`. A pack that is not applied is **named**
in `not_read` / `not_applied`, never silently treated as "nothing to report". An
empty queue says so in as many words: *either a finished spine or an unread one —
check not_read before believing it.*

## Verify

```
sudo service postgresql start
db/spine-588/validation/run.sh    # exit 0
```

`tests/spine-head.test.mjs` pins the ordering and the degradation from the
repository side, and also covers the client half in `app/omniview-surface.js`.
