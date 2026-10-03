// Print seed SQL for a family account. Usage:
//   node family-lineage/seed.mjs family-lineage/accounts/<file>.json > /tmp/seed.sql
//   psql -v owner=<auth.users id> -f /tmp/seed.sql
import { readFileSync } from 'node:fs';
import { toSeedSql, validateAccount } from './lib/lineage.js';

const file = process.argv[2];
if (!file) { console.error('usage: node family-lineage/seed.mjs <account.json>'); process.exit(2); }
const account = JSON.parse(readFileSync(file, 'utf8'));
const problems = validateAccount(account);
if (problems.length) { console.error(JSON.stringify(problems, null, 2)); process.exit(1); }
process.stdout.write(toSeedSql(account));
