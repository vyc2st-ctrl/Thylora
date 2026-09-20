#!/usr/bin/env bash
# Validate the Chairman math / famous thought migrations against a throwaway
# local PostgreSQL database. This never touches the THYLORA backend. It answers:
# do these migrations apply cleanly and idempotently, and do the gates actually
# refuse what they claim to refuse?
#
#   sudo service postgresql start
#   db/chairman-math/validation/run.sh
set -uo pipefail
DB="${CHAIRMAN_MATH_VALIDATION_DB:-chairman_math_check}"
ADMIN_DB="${CHAIRMAN_MATH_ADMIN_DB:-postgres}"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$(dirname "$HERE")"

echo "== resetting $DB"
psql -q -d "$ADMIN_DB" -c "drop database if exists $DB" >/dev/null || { echo "FAIL: cannot reach PostgreSQL"; exit 1; }
psql -q -d "$ADMIN_DB" -c "create database $DB"         >/dev/null || { echo "FAIL: cannot create $DB"; exit 1; }

status=0
for pass in "first" "second (idempotency)"; do
  echo "== applying migrations, $pass pass"
  for f in "$MIGRATIONS"/0*.sql; do
    out=$(psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f" 2>&1)
    if [ $? -ne 0 ] || echo "$out" | grep -qi 'error'; then
      echo "FAIL $(basename "$f")"; echo "$out" | grep -i -B1 -A2 error | head -8; status=1
    else
      echo "OK   $(basename "$f")"
    fi
  done
done

echo "== behavioural checks"
psql -q -d "$DB" -f "$HERE/behaviour.sql" 2>&1 | grep -E '(^==|ERROR:|[a-z_]+ = )'

# Every "expect reject" block must have produced exactly one ERROR.
expected=$(grep -c '^\\echo == expect reject' "$HERE/behaviour.sql")
actual=$(psql -q -d "$DB" -f "$HERE/behaviour.sql" 2>&1 | grep -c 'ERROR:')
echo "== expect-reject blocks: $expected · rejections observed: $actual"
if [ "$expected" != "$actual" ]; then
  echo "FAIL: a rule did not reject what it claims to reject"; status=1
fi

[ $status -eq 0 ] && echo "== RESULT: pass" || echo "== RESULT: fail"
exit $status
