#!/usr/bin/env bash
# CONVEYOR · validation harness
# Applies the spine to a throwaway database TWICE (to prove idempotency), then
# runs the behavioural checks. Exit 0 means every rule the spine claims was
# exercised against a real database and held.
#
#   sudo service postgresql start
#   db/conveyor/validation/run.sh
set -euo pipefail

DB="${CONV_TEST_DB:-conv_validation}"
HERE="$(cd "$(dirname "$0")" && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp "$HERE/../0001_conveyor_spine.sql" "$HERE/behaviour.sql" "$HERE/../../rae-link/validation/supabase_stub.sql" "$STAGE/"
chmod 644 "$STAGE"/*.sql
chmod 755 "$STAGE"

run() { su postgres -c "psql -v ON_ERROR_STOP=1 -q -d $DB -f $1"; }

su postgres -c "dropdb --if-exists $DB; createdb $DB"
run "$STAGE/supabase_stub.sql"

echo "· applying spine (1/2)"
run "$STAGE/0001_conveyor_spine.sql"
echo "· applying spine (2/2, idempotency)"
run "$STAGE/0001_conveyor_spine.sql"

echo "· behavioural checks"
# One run only: the harness inserts a fixture with a unique canonical_id, so a
# second run would fail on that insert rather than on any rule under test.
OUT="$(su postgres -c "psql -v ON_ERROR_STOP=1 -q -d $DB -f $STAGE/behaviour.sql" 2>&1)"
echo "$OUT" | grep -E "NOT REJECTED|PASSED"
if echo "$OUT" | grep -q "NOT REJECTED"; then echo "FAILED: a rule did not reject what it claims to reject"; exit 1; fi
REJECTED=$(echo "$OUT" | grep -c "rejected as expected" || true)

su postgres -c "psql -tA -d $DB" <<'EOSQL'
select 'tables:      ' || count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname like 'conv\_%' and c.relkind='r';
select 'functions:   ' || count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'conv\_%';
select 'policies:    ' || count(*) from pg_policies where schemaname='public' and tablename like 'conv\_%';
select 'write policies: ' || count(*) from pg_policies where schemaname='public' and tablename like 'conv\_%' and cmd<>'SELECT';
select 'rls disabled: ' || count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname like 'conv\_%' and c.relkind='r' and not c.relrowsecurity;
select 'lanes seeded: ' || count(*) from conv_lanes;
select 'check constraints: ' || count(*) from pg_constraint con join pg_class c on c.oid=con.conrelid
  where c.relname like 'conv\_%' and con.contype='c';
EOSQL

echo "· expect-reject cases rejected: $REJECTED"
echo "CONVEYOR VALIDATION OK"
