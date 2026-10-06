#!/usr/bin/env bash
# Validate WR-OPP-COLLAB-675 order custody DDL on a throwaway local PostgreSQL. Never touches the backend.
set -uo pipefail
DB="${OPP_VALIDATION_DB:-opp_collab_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
PSQL="${PSQL:-psql}"
$PSQL -q -c "drop database if exists $DB" >/dev/null 2>&1
$PSQL -q -c "create database $DB" >/dev/null 2>&1
status=0
for pass in first "second (idempotency)"; do
  echo "== applying migration, $pass pass"
  out=$($PSQL -q -v ON_ERROR_STOP=1 -d "$DB" -f "$HERE/../0001_order_custody.sql" 2>&1)
  if echo "$out" | grep -q ERROR; then echo "FAIL"; echo "$out" | head -6; status=1; else echo "OK   0001_order_custody.sql"; fi
done
$PSQL -d "$DB" -f "$HERE/behaviour.sql" 2>&1
$PSQL -q -c "drop database if exists $DB" >/dev/null 2>&1
exit $status
