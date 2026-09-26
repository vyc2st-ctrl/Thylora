#!/usr/bin/env bash
# Validate db/world migrations against a throwaway LOCAL PostgreSQL database.
# Never touches the THYLORA backend.
#   sudo service postgresql start && db/world/validation/run.sh
set -uo pipefail
DB="${WORLD_VALIDATION_DB:-world_check}"
HERE="$(cd "$(dirname "$0")" && pwd)"
psql -q -c "drop database if exists $DB" >/dev/null 2>&1
psql -q -c "create database $DB" >/dev/null 2>&1
for pass in 1 2; do
  for f in "$HERE"/../0*.sql; do
    psql -q -v ON_ERROR_STOP=1 -d "$DB" < "$f" >/dev/null 2>&1 && echo "OK   pass $pass $(basename "$f")" || { echo "FAIL pass $pass $(basename "$f")"; exit 1; }
  done
done
errors=$(psql -d "$DB" < "$HERE/negative.sql" 2>&1 | grep -c '^ERROR')
echo "guard rejections: $errors (expected 7)"
[ "$errors" -eq 7 ]
