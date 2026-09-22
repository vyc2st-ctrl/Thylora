#!/usr/bin/env bash
# Validate the QYRIS migrations against a throwaway local PostgreSQL database.
# This never touches the THYLORA backend. It answers three questions:
#
#   1. Do these migrations apply cleanly, and again idempotently?
#   2. Do the rules actually reject what they claim to reject?
#   3. Does what was written read back in the shape it was written?
#
#   sudo service postgresql start
#   db/qyris/validation/run.sh
set -uo pipefail
DB="${QYRIS_VALIDATION_DB:-qyris_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"
PSQL="psql -q -v ON_ERROR_STOP=1 -d $DB"

run() { cat "$1" | $PSQL 2>&1; }

echo "== resetting $DB"
# -d postgres explicitly: without it psql connects to a database named after the
# current user, which usually does not exist, and the reset fails silently.
ADMIN_DB="${QYRIS_ADMIN_DB:-postgres}"
psql -q -d "$ADMIN_DB" -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -d "$ADMIN_DB" -c "create database $DB" >/dev/null 2>&1 \
  || { echo "could not create $DB — is PostgreSQL running and does this role exist?"; exit 1; }
run "$HERE/supabase_stub.sql" >/dev/null || { echo "stub failed"; exit 1; }

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(run "$f")
    if echo "$out" | grep -q ERROR; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -A2 ERROR | head -8; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== shape"
psql -q -d "$DB" -t -A -F' ' -c "
  select 'tables=' || count(*) from pg_tables where schemaname='public' and tablename like 'qyr\_%';"
psql -q -d "$DB" -t -A -F' ' -c "
  select 'policies=' || count(*) from pg_policies where schemaname='public' and tablename like 'qyr\_%';"
psql -q -d "$DB" -t -A -F' ' -c "
  select 'functions=' || count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname like 'qyr\_%';"
psql -q -d "$DB" -t -A -F' ' -c "
  select 'check_constraints=' || count(*) from pg_constraint c join pg_class t on t.oid=c.conrelid
   where c.contype='c' and t.relname like 'qyr\_%';"
psql -q -d "$DB" -t -A -F' ' -c "
  select 'rls_disabled_tables=' || count(*) from pg_tables
   where schemaname='public' and tablename like 'qyr\_%' and rowsecurity is false;"

echo "== behavioural checks (ERROR lines below are the passing result)"
behaviour=$(cat "$HERE/behaviour.sql" | psql -q -d "$DB" 2>&1)
# Count the \echo markers specifically, not every line that mentions the phrase.
expected=$(grep -c "^\\\\echo '== EXPECT REJECT" "$HERE/behaviour.sql")
rejected=$(echo "$behaviour" | grep -c '^ERROR')
echo "$behaviour" | grep -E '^(==|ERROR|[a-z_]+=)'
echo "-- expected rejections: $expected, actual: $rejected"
if [ "$rejected" -lt "$expected" ]; then
  echo "FAIL: $((expected - rejected)) rule(s) did not reject what they claim to reject"
  status=1
fi

echo "== readback verification"
readback=$(cat "$HERE/readback.sql" | psql -q -d "$DB" 2>&1)
echo "$readback" | grep -E '^(NOTICE|WARNING|ERROR|==)' | sed 's/^NOTICE:  //'
if echo "$readback" | grep -q '^ERROR'; then
  echo "FAIL: readback did not verify"
  status=1
elif ! echo "$readback" | grep -q 'READBACK VERIFIED'; then
  echo "FAIL: readback did not complete"
  status=1
fi

echo "== exit $status"
exit $status
