#!/usr/bin/env bash
# Validate WR-EXEC-FABRIC-680 DDL on a throwaway local PostgreSQL. Never touches the backend.
set -uo pipefail
DB="${FABRIC_VALIDATION_DB:-exec_fabric_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB" >/dev/null 2>&1
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$HERE/stub.sql" >/dev/null || { echo "stub failed"; exit 1; }
status=0
for pass in first "second (idempotency)"; do
  echo "== applying migration, $pass pass"
  out=$(psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$HERE/../0001_execution_fabric.sql" 2>&1)
  if echo "$out" | grep -q ERROR; then echo "FAIL"; echo "$out" | head -6; status=1; else echo "OK   0001_execution_fabric.sql"; fi
done
psql -d "$DB" -f "$HERE/behaviour.sql" 2>&1 | grep -vE '^\s*$'
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
exit $status
