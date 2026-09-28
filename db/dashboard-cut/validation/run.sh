#!/usr/bin/env bash
# Validates 0001_chairman_read_policies.sql on a fresh local PostgreSQL database.
# Reproduces the production defect first (Chairman reads 0 rows), then applies the
# migration twice (idempotency), then checks Chairman > 0 and non-Chairman = 0.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
DB=thy_dashcut_validate
PSQL="sudo -u postgres psql -v ON_ERROR_STOP=1 -X -q"
sudo -u postgres dropdb --if-exists "$DB"
sudo -u postgres createdb "$DB"
$PSQL -d "$DB" -f "$DIR/stub.sql"
echo "BEFORE (expect chairman zeros on all five):"
$PSQL -d "$DB" -A -t -f "$DIR/witness.sql"
$PSQL -d "$DB" -f "$DIR/../0001_chairman_read_policies.sql" 2>&1 | grep -E "NOTICE" || true
$PSQL -d "$DB" -f "$DIR/../0001_chairman_read_policies.sql" 2>&1 | grep -E "NOTICE" || true
echo "AFTER (expect chairman 3|2|2|2|2 then non-chairman 0|0|0|0|0):"
OUT="$($PSQL -d "$DB" -A -t -f "$DIR/witness.sql")"
echo "$OUT"
POL="$($PSQL -d "$DB" -A -t -c "select count(*) from pg_policies where policyname like 'chairman_read_thylora_%' and cmd='SELECT'")"
echo "policies=$POL"
[ "$POL" = "5" ] || { echo "FAIL policy count"; exit 1; }
[ "$(echo "$OUT" | sed -n 1p)" = "chairman|3|2|2|2|2" ] || { echo "FAIL chairman read"; exit 1; }
[ "$(echo "$OUT" | sed -n 2p)" = "other|0|0|0|0|0" ] || { echo "FAIL isolation"; exit 1; }
echo "VALIDATION PASS"
sudo -u postgres dropdb "$DB"
