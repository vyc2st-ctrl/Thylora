#!/usr/bin/env bash
# Validate the THYLORA Persons migrations against a throwaway local PostgreSQL
# database. This never touches the THYLORA backend. It answers one question: do
# these migrations apply cleanly, idempotently, and do the rules actually reject
# what they claim to reject?
#
#   sudo service postgresql start
#   db/persons/validation/run.sh
set -uo pipefail
DB="${THYP_VALIDATION_DB:-thyp_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"
ADMIN="${THYP_ADMIN_DB:-postgres}"
PSQL="psql -q -v ON_ERROR_STOP=1 -d $DB"
STUB="${THYP_STUB:-$(dirname "$MIGRATIONS")/rae-link/validation/supabase_stub.sql}"

run() { cat "$1" | $PSQL 2>&1; }

echo "== resetting $DB"
psql -q -d "$ADMIN" -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -d "$ADMIN" -c "create database $DB"       >/dev/null 2>&1
run "$STUB" >/dev/null || { echo "stub failed"; exit 1; }

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(run "$f")
    if echo "$out" | grep -q ERROR; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -A3 ERROR | head -8; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== object counts"
psql -q -t -d "$DB" -c "
select '   tables            ' || count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r'
   and (c.relname like 'thyp\_%' or c.relname like 'studio\_%' or c.relname like 'thylora\_person\_%')
union all select '   rls policies      ' || count(*) from pg_policies where schemaname='public'
union all select '   functions         ' || count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'thyp\_%'
union all select '   check constraints  ' || count(*) from pg_constraint where contype='c' and connamespace='public'::regnamespace
union all select '   registered people  ' || count(*) from thylora_person_identity
union all select '   crowd people       ' || count(*) from thyp_crowd_persons
union all select '   cleared snapshots  ' || count(*) from studio_scene_character_snapshots where gate_verdict='CLEARED'
union all select '   schedule blocks    ' || count(*) from thyp_schedule_blocks
order by 1;"

echo "== behavioural checks (ERROR lines below are the passing result)"
cat "$HERE/behaviour.sql" | psql -q -d "$DB" 2>&1 \
  | grep -vE '^(DETAIL|CONTEXT|HINT|LINE|QUERY|STATEMENT|\s*\^)' \
  | grep -vE '^(INSERT|UPDATE|DELETE|CREATE|DO|BEGIN|COMMIT|SET)[0-9 ]*$' \
  | grep -vE '^$'
exit $status
