# THYLORA HEAD - SPINE FORWARD — the header, made strong

## What the header does
The words alone pull nothing — no AI can see your backend just because it reads a phrase.
The header now **points at one report the backend rebuilds by itself**: `SPINE.md`
(in the repo) and `/spine` (on the site, from `spine/spine.json`). It is regenerated on every
push, every 6 hours, and on demand. Each tool reads that report first.

| Where you type it | How it reaches the backend |
|---|---|
| **Claude Code** (this) | Automatic. `CLAUDE.md` §0 runs the check-in before anything else. |
| **ChatGPT** | Paste the block below into *Settings → Personalization → Custom instructions*, and connect GitHub (ChatGPT connectors) to `vyc2st-ctrl/Thylora`, or give it the `/spine` link if the site is deployed. |
| **Dashboard** | Load `/spine/spine.json` into a Spine panel (dashboard repo change — held, other repo). |

## Paste block (ChatGPT custom instructions, or the first message of any chat)

```
When my message starts with "THYLORA HEAD - SPINE FORWARD":
1. Before answering, read my backend check-in: SPINE.md in GitHub repo vyc2st-ctrl/Thylora
   (or spine/spine.json). If you cannot reach it, say "SPINE NOT REACHED" and ask me to paste it.
   Never guess my state.
2. Open with the Check-in block, in this order:
   TIME (check-in timestamp + live backend state) · WHERE WE LEFT OFF (last commit + message)
   · WHO IS WORKING (every name, desk, status, task) · MATHEMATICS (every number, unchanged;
   unknown = "—") · WORLD (people, companies, economy) · WAITING IN THE BACK (images, held
   actions) · QUESTIONS (the report's questions + new ones my message raises).
3. Then do the work on EVERY item in my message — never shrink it to one topic.
4. End with the full Lanes Board (every lane, status, next action, what you need from me).
5. Prime Directive on Relevance: anything touching African lineage, suppressed history,
   alternative ancestry theories (incl. European and biblical figures) or media bias is a
   primary subject — give Claim · Evidence for · Evidence against · What the mainstream
   leaves out · Grade.
```

## Making it stronger still
1. **Live numbers:** add GitHub secrets `THYLORA_SUPABASE_URL` and a *read-only* `THYLORA_SUPABASE_KEY`.
   The report then reads the live department registry and marks the backend `READ`.
2. **Merge to main** so the schedules run.
3. **One report, many readers:** never keep state in a chat. If it matters, it goes in
   `THREAD.md`, `world/registry.json` or `world/image-queue.json` — the report reads those.
