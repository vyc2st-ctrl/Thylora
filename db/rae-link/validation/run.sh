#!/usr/bin/env bash
# Validate the RAE Link migrations against a throwaway local PostgreSQL database.
# This never touches the THYLORA backend. It answers one question: do these
# migrations apply cleanly, idempotently, and do the rules actually reject what
# they claim to reject?
#
#   sudo service postgresql start
#   db/rae-link/validation/run.sh
set -uo pipefail
DB="${RAELINK_VALIDATION_DB:-raelink_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"
PSQL="psql -q -v ON_ERROR_STOP=1 -d $DB"

run() { cat "$1" | $PSQL 2>&1; }

echo "== resetting $DB"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB"       >/dev/null 2>&1
run "$HERE/supabase_stub.sql" >/dev/null || { echo "stub failed"; exit 1; }

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(run "$f")
    if echo "$out" | grep -q ERROR; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -A2 ERROR | head -6; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== behavioural checks (ERROR lines below are the passing result)"
cat "$HERE/behaviour.sql" | psql -q -d "$DB" 2>&1 | grep -E '^(==|ERROR|[a-z_]+=)'
exit $status
