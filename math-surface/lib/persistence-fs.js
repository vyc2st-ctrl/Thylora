// THYLORA · filesystem adapter
// Workroom: WR-MATH-SURFACE-001
//
// Kept in its own file because it imports node:fs. The surface never loads it;
// the backend verification and the test suite do. Writes are atomic: a
// temporary file is written and renamed, so a process dying mid-write cannot
// leave a half-parsed collection behind.

import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function fileAdapter(directory) {
  mkdirSync(directory, { recursive: true });
  const pathFor = collection => join(directory, `${collection}.json`);

  return {
    name: `file:${directory}`,
    async read(collection) {
      const path = pathFor(collection);
      if (!existsSync(path)) return [];
      try {
        const parsed = JSON.parse(readFileSync(path, 'utf8'));
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        throw new Error(`${path} is not readable as a record collection: ${error.message}`);
      }
    },
    async write(collection, records) {
      const path = pathFor(collection);
      const temporary = `${path}.writing`;
      writeFileSync(temporary, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
      renameSync(temporary, path);
    }
  };
}
