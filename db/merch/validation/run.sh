#!/usr/bin/env bash
# Validate the merchandise migrations against a throwaway local PostgreSQL
# database. This never touches the THYLORA backend. It answers two questions:
# do the migrations apply cleanly and idempotently, and do the rules actually
# reject what they claim to reject?
#
#   sudo service postgresql start
#   db/merch/validation/run.sh
set -uo pipefail
DB="${MERCH_VALIDATION_DB:-merch_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"
PSQL="psql -q -v ON_ERROR_STOP=1 -d $DB"

run() { cat "$1" | $PSQL 2>&1; }

echo "== resetting $DB"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB"         >/dev/null 2>&1
run "$HERE/stub.sql" >/dev/null || { echo "stub failed"; exit 1; }

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(run "$f")
    if echo "$out" | grep -q ERROR; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -B1 -A2 ERROR | head -8; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== behaviour checks"
out=$(run "$HERE/behaviour.sql")
if echo "$out" | grep -q -e ERROR -e 'EXPECTED FAILURE DID NOT OCCUR'; then
  echo "$out" | grep -e ERROR -e 'EXPECTED FAILURE' | head -20; status=1
else
  echo "$out" | grep -c 'OK rejected' | xargs -I{} echo "{} rules rejected what they claim to reject"
fi

echo "== row counts"
$PSQL -c "select 'artwork_lock' t, count(*) from merch_artwork_lock
          union all select 'family', count(*) from merch_product_family
          union all select 'class', count(*) from merch_product_class
          union all select 'cup_side_map', count(*) from merch_cup_side_map
          union all select 'phrase', count(*) from merch_phrase_registry
          union all select 'scene', count(*) from merch_scene_registry
          union all select 'run', count(*) from merch_run
          union all select 'sku', count(*) from merch_sku
          union all select 'rights', count(*) from merch_rights_record
          union all select 'gate', count(*) from merch_approval_gate
          union all select 'make_order', count(*) from merch_make_order
          order by 1"

exit $status
