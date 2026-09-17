#!/usr/bin/env bash
# Applies every vehicle-civilization migration to a throwaway local database,
# twice, to prove idempotency, then runs behaviour.sql.
#
#   sudo service postgresql start
#   db/vehicle-civilization/validation/run.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB="${DB:-thy_veh_civ_validation}"
PSQL_SUPER="${PSQL_SUPER:-psql -v ON_ERROR_STOP=1 -q}"

echo "== dropping and recreating $DB =="
$PSQL_SUPER -d postgres -c "drop database if exists $DB;"
$PSQL_SUPER -d postgres -c "create database $DB;"

apply_all() {
  for f in "$DIR"/0*.sql; do
    echo "   -- $(basename "$f")"
    $PSQL_SUPER -d "$DB" -f "$f"
  done
}

echo "== pass 1 =="
apply_all
echo "== pass 2 (idempotency) =="
apply_all

echo "== behaviour =="
$PSQL_SUPER -d "$DB" -f "$DIR/validation/behaviour.sql"

echo "== OK =="
