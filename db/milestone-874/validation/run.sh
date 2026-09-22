#!/usr/bin/env bash
# Validate the MILESTONE 874 migrations against a throwaway local PostgreSQL database.
# This never touches the THYLORA backend. It answers three questions:
#   1. do these migrations apply cleanly and idempotently?
#   2. does the floor refuse to store an unread number as zero?
#   3. does the comparison refuse while 874 is still in the future?
#
# The milestone reads the sequence ledger and the gate law, so both packs are
# applied first. That dependency is real and is not hidden.
#
#   sudo service postgresql start
#   db/milestone-874/validation/run.sh
set -uo pipefail
DB="${MILESTONE_VALIDATION_DB:-milestone_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"
PSQL="psql -q -v ON_ERROR_STOP=1 -d $DB"

run() { cat "$1" | $PSQL 2>&1; }

echo "== resetting $DB"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB"         >/dev/null 2>&1
run "$HERE/supabase_stub.sql" >/dev/null || { echo "stub failed"; exit 1; }

echo "== applying prerequisite packs (omniview ledger, gate law)"
for f in "$(dirname "$MIGRATIONS")"/omniview/0*.sql "$(dirname "$MIGRATIONS")"/gate-law/0*.sql; do
  out=$(run "$f")
  if echo "$out" | grep -q ERROR; then echo "FAIL prerequisite $(basename "$f")"; exit 1; fi
done
echo "OK   prerequisites applied"

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(run "$f")
    if echo "$out" | grep -q ERROR; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -B1 -A2 ERROR | head -8; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== behavioural checks (ERROR lines below are the passing result)"
cat "$HERE/behaviour.sql" | psql -q -d "$DB" 2>&1 | grep -E 'EXPECT-REJECT' | sed 's/^psql:[^ ]* //;s/^NOTICE:  //'

for proof in "$HERE"/proof_*.sql; do
  echo "== $(basename "$proof")"
  out=$(cat "$proof" | psql -q -v ON_ERROR_STOP=1 -d "$DB" 2>&1)
  echo "$out" | grep -E 'PROOF (PASS|FAIL)|^ERROR' | sed 's/^NOTICE:  //' || true
  if echo "$out" | grep -q '^ERROR'; then status=1; fi
  if echo "$out" | grep -q 'PROOF FAIL'; then status=1; fi
done

echo "== exit $status"
exit $status
