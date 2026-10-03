# THYLORA Helper Access

**What it is:** a way to give family and partners (Jordyn, Cali, Key, and others)
their own assistant that sees only what we put in front of them and can only send
things in. It cannot change THYLORA and cannot see the back end.

## What a helper can and cannot do

| A helper CAN | A helper CANNOT |
|---|---|
| See the tasks, questions, info and forms placed in **their** scope | See anything outside their scope, or another helper's work |
| Send in answers, notes, requests and file links | Edit or delete anything, including what they sent |
| Read back what they sent and whether it was accepted | Approve their own input or change its review state |
| Talk to an assistant that knows only their scope | Get the assistant to reveal anything else, because it is never given anything else |

Every scope item needs a written `why_visible`, so access is never accidental.
A child helper always has a recorded guardian (`thy_helper_minor_guardian`).
Pausing a helper hides their scope and stops new inputs immediately.

## How the assistant stays inside the lines

The assistant is not trusted to keep secrets. It is **never given** the secrets.
Its server-side context is built only from rows this helper's own login can read
under these policies. That is the same rule as Phone Assistant V1 in the
deployment repo: *access does not equal authority; no private information outside
caller scope.*

## Evidence

`validation/run.sh` (run as a Postgres superuser against a throwaway database):
migration applies twice cleanly, and **13 of 13** checks behave as claimed:
minor without guardian refused; helper sees 1 own item and 0 of another
helper's inputs; own answer accepted; answering another helper's item refused;
posting as someone else refused; self-approval refused; edit refused; delete
refused; adding to own scope refused; paused helper sees 0 items and cannot submit.

## Not done (held)

- **Not applied** to `thylora-dash`. The backend refused connection from this
  session (403), and production DDL is a Chairman action.
- No helper screen yet. Next step: one page in `app/` with three panels:
  *My items*, *Send in*, *What I sent*.
- Assistant runtime (which model, where it runs, server-side key) not chosen.
