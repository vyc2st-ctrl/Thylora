#!/usr/bin/env bash
# Validate the FAMILY LINEAGE migration and the account seed against a throwaway
# local PostgreSQL database. Never touches the THYLORA backend.
#
#   sudo service postgresql start
#   db/family-lineage/validation/run.sh
set -uo pipefail
DB="${LINEAGE_VALIDATION_DB:-lineage_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
PSQL="psql -q -v ON_ERROR_STOP=1 -d $DB"
STUB="$ROOT/db/rae-link/validation/supabase_stub.sql"   # shared scaffold, not duplicated

psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB" >/dev/null 2>&1
$PSQL -f "$STUB" >/dev/null || { echo "stub failed"; exit 1; }
OWNER=$($PSQL -tA -c "insert into auth.users(email) values ('owner@example.invalid') returning id")

status=0
SEED=$(mktemp)
ACCOUNT="${LINEAGE_ACCOUNT:-$ROOT/family-lineage/fixtures/example-account.json}"
node "$ROOT/family-lineage/seed.mjs" "$ACCOUNT" > "$SEED" || { echo "seed generation failed"; exit 1; }
for pass in "first" "second (idempotency)"; do
  for f in "$HERE/../0001_lineage.sql" "$SEED"; do
    if out=$($PSQL -v owner="$OWNER" -f "$f" 2>&1); then echo "OK   $pass · $(basename "$f")"
    else echo "FAIL $pass · $(basename "$f")"; echo "$out" | head -6; status=1; fi
  done
done
rm -f "$SEED"

echo "== behavioural checks (ERROR lines under 'expect reject' are the passing result)"
psql -q -d "$DB" -f "$HERE/behaviour.sql" 2>&1 | grep -vE '^\s*$|^-+$|^\(1 row\)|set_config|^ *[0-9a-f-]{36}$'
exit $status
