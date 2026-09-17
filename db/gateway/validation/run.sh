#!/usr/bin/env bash
# Validate the gateway migrations against a throwaway local PostgreSQL database.
# This never touches the THYLORA backend. It answers: do these apply cleanly and
# idempotently, and does the gateway actually refuse what it claims to refuse?
#
#   sudo service postgresql start
#   db/gateway/validation/run.sh
set -uo pipefail
# Connect as a superuser. On a stock Debian/Ubuntu cluster that is peer auth as
# the postgres OS user; override with GATEWAY_PSQL if your setup differs.
PSQL_BIN="${GATEWAY_PSQL:-sudo -u postgres psql}"
DB="${GATEWAY_VALIDATION_DB:-thylora_gateway_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"
PSQL="$PSQL_BIN -q -v ON_ERROR_STOP=1 -d $DB"

run() { cat "$1" | $PSQL 2>&1; }

echo "== resetting $DB"
$PSQL_BIN -q -c "drop database if exists $DB" >/dev/null 2>&1
$PSQL_BIN -q -c "create database $DB"         >/dev/null 2>&1
out=$(run "$HERE/fixture.sql"); echo "$out" | grep -qE 'ERROR|FATAL|psql:' && { echo "fixture failed"; echo "$out" | grep -A2 ERROR | head -10; exit 1; }

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/000[123]_*.sql; do
    out=$(run "$f")
    if echo "$out" | grep -qE 'ERROR|FATAL|psql:'; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -B1 -A3 -E 'ERROR|FATAL|psql:' | head -12; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== behavioural checks (ERROR lines below are the passing result)"
cat "$HERE/behaviour.sql" | $PSQL_BIN -q -v hardening="$MIGRATIONS/0004_optional_public_execute_hardening.sql" -d "$DB" 2>&1 | grep -vE '^\s*$|^\(1 row\)|^-+$|^ *set_config'
exit $status
