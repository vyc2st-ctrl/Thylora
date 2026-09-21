#!/usr/bin/env bash
# Validate the Wave 1 store and castle migrations against a throwaway local
# PostgreSQL database. This never touches the THYLORA backend. It answers:
# do these migrations apply cleanly and idempotently, and do the rules actually
# reject what they claim to reject?
#
#   sudo service postgresql start
#   db/store-wave1/validation/run.sh
set -uo pipefail
DB="${STORE_VALIDATION_DB:-store_wave1_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"
PSQL="psql -q -v ON_ERROR_STOP=1 -d $DB"
run() { cat "$1" | $PSQL 2>&1; }

echo "== resetting $DB"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB"         >/dev/null 2>&1

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(run "$f")
    if echo "$out" | grep -qE "ERROR|FATAL"; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -A2 -E "ERROR|FATAL" | head -6; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== expect-reject cases"
reject() {
  out=$(psql -q -v ON_ERROR_STOP=1 -d "$DB" -c "$2" 2>&1)
  if echo "$out" | grep -qE "ERROR|FATAL"; then
    echo "OK   rejected: $1"
  else
    echo "FAIL accepted:  $1"; status=1
  fi
}

psql -q -d "$DB" -c "insert into thy_castle.castle (castle_id) values ('CASTLE-STABLE-001') on conflict do nothing" >/dev/null
psql -q -d "$DB" -c "insert into thy_castle.era_layer (castle_id,aspect_key,valid_from,valid_to,payload,source) select 'CASTLE-STABLE-001','room_use','1880-01-01','1899-12-31','{\"hall\":\"dining\"}','estate inventory 1880' where not exists (select 1 from thy_castle.era_layer where castle_id='CASTLE-STABLE-001')" >/dev/null

reject "a second lead shelf" \
  "insert into thy_store.shelf (shelf_key,title,is_lead_shelf) values ('another','Another',true)"
reject "delivery binding that builds new commerce infrastructure" \
  "insert into thy_store.delivery_binding (sku,entitlement_path,new_infrastructure_built) values ('THY-BEFORE-YOU-BUY-001','x',true)"
reject "updating a castle era layer" \
  "update thy_castle.era_layer set source='rewritten' where castle_id='CASTLE-STABLE-001'"
reject "deleting a castle era layer" \
  "delete from thy_castle.era_layer where castle_id='CASTLE-STABLE-001'"
reject "a name candidate with no language source" \
  "insert into thy_castle.name_candidate (castle_id,source_id,root_word,meaning,pronunciation,historical_use,provenance,compound_construction,final_candidate) values ('CASTLE-STABLE-001',999999,'r','m','p','h','v','c','Some Name')"
reject "an external reference marked usable for naming" \
  "insert into thy_castle.external_reference (label,usable_for_naming) values ('Windsor derivative',true)"
reject "an external reference classified as anything but ERC" \
  "insert into thy_castle.external_reference (label,classification) values ('Windsor derivative','SOURCE')"
reject "a serial for a product with no serial root" \
  "select thy_store.issue_serial('THY-STORY-BRAMBLE-WICK')"

echo "== readback"
psql -q -d "$DB" -At -F' | ' -c \
  "select sku, thy_store.current_shelf(sku), thy_store.is_publishable(sku) from thy_store.product order by sku"
echo "-- naming_unblocked (expect f):"
psql -q -d "$DB" -At -c "select thy_castle.naming_unblocked()"
echo "-- naming dependencies not present (expect 8):"
psql -q -d "$DB" -At -c "select count(*) from thy_castle.name_dependency where state <> 'PRESENT'"
echo "-- two serials, must differ:"
psql -q -d "$DB" -At -F' | ' -c "select thy_store.issue_serial('THY-QYRIS-QUICKCHECK-001'), thy_store.issue_serial('THY-QYRIS-QUICKCHECK-001')"
echo "-- castle at 1890-01-01, aspects present | missing (expect 1 | 9):"
psql -q -d "$DB" -At -F' | ' -c \
  "select (select count(*) from thy_castle.load_at('CASTLE-STABLE-001', date '1890-01-01')), (select count(*) from thy_castle.missing_at('CASTLE-STABLE-001', date '1890-01-01'))"
echo "-- a correction supersedes without erasing: layers held | which one loads:"
psql -q -d "$DB" -c "insert into thy_castle.era_layer (castle_id,aspect_key,valid_from,valid_to,payload,source,supersedes) select 'CASTLE-STABLE-001','room_use','1880-01-01','1899-12-31','{\"hall\":\"library\"}','estate inventory 1884, corrected', (select min(layer_id) from thy_castle.era_layer where castle_id='CASTLE-STABLE-001') where (select count(*) from thy_castle.era_layer where castle_id='CASTLE-STABLE-001')=1" >/dev/null
psql -q -d "$DB" -At -F' | ' -c \
  "select (select count(*) from thy_castle.era_layer where castle_id='CASTLE-STABLE-001'), (select payload->>'hall' from thy_castle.load_at('CASTLE-STABLE-001', date '1890-01-01') where aspect_key='room_use')"

echo "-- placement history is preserved, not overwritten (rows per story title):"
psql -q -d "$DB" -At -F' | ' -c \
  "select sku, count(*) from thy_store.shelf_placement group by sku order by sku limit 4"

echo
[ $status -eq 0 ] && echo "VALIDATION PASSED" || echo "VALIDATION FAILED"
exit $status
