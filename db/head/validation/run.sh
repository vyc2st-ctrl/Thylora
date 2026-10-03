#!/usr/bin/env bash
# Validate HEAD migration on a throwaway PostgreSQL database. Never touches the live backend.
set -uo pipefail
DB="${HEAD_VALIDATION_DB:-head_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
STUB="$HERE/../../rae-link/validation/supabase_stub.sql"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB" >/dev/null 2>&1
psql -q -v ON_ERROR_STOP=1 -d $DB -f "$STUB" >/dev/null || { echo "stub failed"; exit 1; }
for pass in first second; do
  if psql -q -v ON_ERROR_STOP=1 -d $DB -f "$HERE/../0001_head_spine_forward.sql" >/dev/null 2>&1; then echo "OK   apply ($pass pass)"; else echo "FAIL apply ($pass)"; exit 1; fi
done
out=$(psql -d $DB -f "$HERE/behaviour.sql" 2>&1)
rejects=$(echo "$out" | grep -c "ERROR")
echo "expect-reject cases rejected: $rejects / 8"
echo "$out" | grep FEE_CHECK
tables=$(psql -tA -d $DB -c "select count(*) from pg_tables where tablename like 'head_%'")
nolrs=$(psql -tA -d $DB -c "select count(*) from pg_tables where tablename like 'head_%' and not rowsecurity")
echo "head tables: $tables · without RLS: $nolrs"
[ "$rejects" -eq 8 ] && [ "$nolrs" -eq 0 ] && echo "exit 0" && exit 0
exit 1
