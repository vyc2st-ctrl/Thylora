#!/usr/bin/env bash
# Validate the Root House migrations on a throwaway local PostgreSQL. Never touches the backend.
set -uo pipefail
DB="${LINEAGE_VALIDATION_DB:-lineage_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB" >/dev/null 2>&1
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$HERE/../../rae-link/validation/supabase_stub.sql" >/dev/null || { echo "stub failed"; exit 1; }
status=0
for pass in first "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f" 2>&1)
    if echo "$out" | grep -q ERROR; then echo "FAIL $(basename "$f")"; echo "$out" | grep -A2 ERROR | head -6; status=1; else echo "OK   $(basename "$f")"; fi
  done
done
echo "== behavioural checks (ERROR lines below are the passing result)"
psql -q -At -d "$DB" -f "$HERE/behaviour.sql" 2>&1 | grep -E '^(==|ERROR|psql.*ERROR|[a-z_0-9]+=)' | sed 's/^psql:[^E]*//'
exit $status
