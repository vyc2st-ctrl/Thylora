#!/usr/bin/env bash
# Validate the visual-gate migrations against a throwaway local PostgreSQL database.
# This never touches the THYLORA backend. It answers: do these migrations apply
# cleanly and idempotently, and does the gate actually refuse what it claims to?
#
#   sudo service postgresql start
#   db/visual-gate/validation/run.sh
set -uo pipefail
DB="${VISUAL_GATE_VALIDATION_DB:-visualgate_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"
PSQL="psql -q -v ON_ERROR_STOP=1 -d $DB"

echo "== resetting $DB"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB"         >/dev/null 2>&1
cat "$HERE/stub.sql" | $PSQL >/dev/null || { echo "stub failed"; exit 1; }

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(cat "$f" | $PSQL 2>&1)
    if echo "$out" | grep -q ERROR; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -B1 -A2 ERROR | head -8; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== behavioural checks (ERROR lines below are the passing result)"
cat "$HERE/behaviour.sql" | psql -q -t -A -d "$DB" 2>&1 | grep -E "^(==|ERROR|[a-z_]+ = )"
exit $status
