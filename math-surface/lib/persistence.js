// THYLORA · persistence for the mathematics surface
// Workroom: WR-MATH-SURFACE-001
//
// Append-only by construction.
//
// An Understanding Card is a record of what an adult watched a child do on a
// particular morning. It is not a field to be updated when a later opinion
// forms. A correction writes a new version that points back at the old one, and
// the old one stays readable — the same rule the family story archive runs on,
// applied to assessment instead of memory.
//
// The store is adapter-shaped so the same repository code runs against memory
// (tests), the filesystem (backend verification), the browser (the surface
// offline) and, once provisioned, the backend tables in db/math-surface.

export class PersistenceError extends Error {
  constructor(message, { code = 'PERSISTENCE', collection = null, id = null } = {}) {
    super(message);
    this.name = 'PersistenceError';
    this.code = code;
    this.collection = collection;
    this.id = id;
  }
}

export const COLLECTIONS = Object.freeze([
  'understanding_cards',
  'layer_observations',
  'learner_refs',
  'protocol_events'
]);

function assertCollection(collection) {
  if (!COLLECTIONS.includes(collection)) {
    throw new PersistenceError(`unknown collection ${collection}`, { code: 'UNKNOWN_COLLECTION', collection });
  }
  return collection;
}

/**
 * @typedef {object} Adapter
 * @property {(collection: string) => Promise<object[]>} read
 * @property {(collection: string, records: object[]) => Promise<void>} write
 * @property {string} name
 */

export function memoryAdapter(seed = {}) {
  const store = new Map(Object.entries(seed).map(([k, v]) => [k, [...v]]));
  return {
    name: 'memory',
    async read(collection) { return [...(store.get(collection) ?? [])]; },
    async write(collection, records) { store.set(collection, [...records]); }
  };
}

/** localStorage / sessionStorage, for the surface when the backend is absent. */
export function browserStorageAdapter(storage, prefix = 'thy_math_') {
  return {
    name: 'browser-storage',
    async read(collection) {
      try { return JSON.parse(storage.getItem(prefix + collection) || '[]'); } catch { return []; }
    },
    async write(collection, records) {
      try { storage.setItem(prefix + collection, JSON.stringify(records)); }
      catch (error) { throw new PersistenceError(`browser storage refused the write: ${error.message}`, { code: 'STORAGE_FULL', collection }); }
    }
  };
}

/**
 * The repository. Every write is an append; nothing is edited in place.
 */
export function createRepository(adapter) {
  if (!adapter || typeof adapter.read !== 'function' || typeof adapter.write !== 'function') {
    throw new PersistenceError('an adapter with read and write is required', { code: 'BAD_ADAPTER' });
  }

  async function all(collection) {
    assertCollection(collection);
    return adapter.read(collection);
  }

  return {
    adapter: adapter.name ?? 'unnamed',

    async put(collection, record) {
      assertCollection(collection);
      if (!record || !record.id) throw new PersistenceError('a record needs an id', { code: 'MISSING_ID', collection });
      const records = await adapter.read(collection);
      if (records.some(r => r.id === record.id)) {
        throw new PersistenceError(
          `${record.id} already exists in ${collection}. Records here are append-only; write a superseding version instead.`,
          { code: 'IMMUTABLE_RECORD', collection, id: record.id }
        );
      }
      const stored = { ...record, _written_at: record._written_at ?? new Date().toISOString() };
      await adapter.write(collection, [...records, stored]);
      return stored;
    },

    async putMany(collection, list) {
      const written = [];
      for (const record of list) written.push(await this.put(collection, record));
      return written;
    },

    async get(collection, id) {
      const records = await all(collection);
      return records.find(r => r.id === id) ?? null;
    },

    async list(collection, filter = null) {
      const records = await all(collection);
      return filter ? records.filter(filter) : records;
    },

    async count(collection) {
      return (await all(collection)).length;
    },

    /** The live version of a record: the newest in its supersede chain. */
    async current(collection, id) {
      const records = await all(collection);
      let node = records.find(r => r.id === id);
      if (!node) return null;
      let next = records.find(r => r.supersedes === node.id);
      while (next) {
        node = next;
        next = records.find(r => r.supersedes === node.id);
      }
      return node;
    },

    /** Every version of a record, oldest first. */
    async history(collection, id) {
      const records = await all(collection);
      const chain = [];
      let node = records.find(r => r.id === id);
      // walk back to the root first
      while (node && node.supersedes) {
        const parent = records.find(r => r.id === node.supersedes);
        if (!parent) break;
        node = parent;
      }
      while (node) {
        chain.push(node);
        node = records.find(r => r.supersedes === node.id);
      }
      return chain;
    }
  };
}

/**
 * A verification any deployment can run: write, re-open the store through a
 * fresh repository over the same adapter, and read back. This is what
 * "persistence verified" means here — not that a write returned without
 * throwing, but that the record survived losing the object that wrote it.
 */
export async function verifyPersistence(adapterFactory, sample) {
  const first = createRepository(adapterFactory());
  await first.put('understanding_cards', sample);

  const second = createRepository(adapterFactory());
  const readBack = await second.get('understanding_cards', sample.id);

  const survived = Boolean(readBack) && readBack.id === sample.id;
  let immutable = false;
  try {
    await second.put('understanding_cards', sample);
  } catch (error) {
    immutable = error.code === 'IMMUTABLE_RECORD';
  }

  return Object.freeze({
    adapter: first.adapter,
    survived_reopen: survived,
    append_only_enforced: immutable,
    ok: survived && immutable,
    read_back: readBack
  });
}
