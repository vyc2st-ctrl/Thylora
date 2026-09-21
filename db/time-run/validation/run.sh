#!/usr/bin/env bash
# TIME RUN · migration + behaviour validation from a fresh database.
# Usage: PGHOST=... PGPORT=... PGUSER=... db/time-run/validation/run.sh
set -euo pipefail
DB="${TRUN_VALIDATION_DB:-trun_validation}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

psql -v ON_ERROR_STOP=1 -q -c "drop database if exists ${DB};" -c "create database ${DB};"
for f in "${HERE}"/0*.sql; do
  echo "apply  $(basename "$f")"
  psql -v ON_ERROR_STOP=1 -q -d "${DB}" -f "$f" >/dev/null
done
echo "re-apply for idempotence"
for f in "${HERE}"/0*.sql; do psql -v ON_ERROR_STOP=1 -q -d "${DB}" -f "$f" >/dev/null; done
echo "behaviour"
psql -q -d "${DB}" -f "${HERE}/validation/behaviour.sql"
