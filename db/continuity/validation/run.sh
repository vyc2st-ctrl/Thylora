#!/usr/bin/env bash
# Validate the continuity watchdog migrations against a throwaway local database.
# This never touches the THYLORA backend. It answers three questions: do the
# migrations apply cleanly, are they idempotent, and do the rules actually hold
# what they claim to hold?
#
#   sudo service postgresql start
#   db/continuity/validation/run.sh
#
# Runs as the invoking user by default. If that user cannot reach the server and
# we are root with a postgres superuser available, it falls back to that.
set -uo pipefail
DB="${CONTINUITY_VALIDATION_DB:-continuity_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"

PSQL_BIN="psql"
if ! psql -q -c 'select 1' postgres >/dev/null 2>&1; then
  if [ "$(id -u)" = "0" ] && sudo -u postgres psql -q -c 'select 1' >/dev/null 2>&1; then
    PSQL_BIN="sudo -u postgres psql"
  fi
fi
PSQL="$PSQL_BIN -q -v ON_ERROR_STOP=1 -d $DB"

run() { cat "$1" | $PSQL 2>&1; }

echo "== resetting $DB"
$PSQL_BIN -q -c "drop database if exists $DB" >/dev/null 2>&1
$PSQL_BIN -q -c "create database $DB"         >/dev/null 2>&1
run "$HERE/../../rae-link/validation/supabase_stub.sql" >/dev/null || { echo "stub failed"; exit 1; }

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(run "$f")
    if echo "$out" | grep -q ERROR; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -B1 -A3 ERROR | head -12; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== behavioural checks (ERROR lines below are the passing result)"
cat "$HERE/behaviour.sql" | $PSQL_BIN -q -d "$DB" 2>&1 | grep -E '^(==|ERROR|NOTICE|[a-z_]+ *=)'

echo "== rollback: disarm then remove"
for f in "$MIGRATIONS"/rollback/disarm.sql "$MIGRATIONS"/rollback/remove.sql; do
  out=$(run "$f")
  if echo "$out" | grep -q ERROR; then
    echo "FAIL $(basename "$f")"; echo "$out" | grep -A3 ERROR | head -8; status=1
  else
    echo "OK   $(basename "$f")"
  fi
done

left=$($PSQL_BIN -tAq -d "$DB" -c "select count(*) from information_schema.tables where table_name like 'thy_%' or table_name = 'thy_controlling_facts'" 2>/dev/null)
echo "tables_left_after_remove = ${left:-?}"
[ "${left:-1}" = "0" ] || status=1

echo "== re-apply after remove (rollback is reversible)"
for f in "$MIGRATIONS"/0*.sql; do
  out=$(run "$f")
  if echo "$out" | grep -q ERROR; then
    echo "FAIL replay $(basename "$f")"; echo "$out" | grep -A3 ERROR | head -8; status=1
  else
    echo "OK   replay $(basename "$f")"
  fi
done

exit $status
