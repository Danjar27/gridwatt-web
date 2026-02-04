import { openDB, type IDBPDatabase } from 'idb';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

const DB_NAME = 'gridwatt-cache';
const STORE_NAME = 'query-cache';

async function getDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

export function createIDBPersister(): Persister {
    return {
        persistClient: async (client: PersistedClient) => {
            const db = await getDB();
            await db.put(STORE_NAME, client, 'client');
        },
        restoreClient: async (): Promise<PersistedClient | undefined> => {
            const db = await getDB();

            return db.get(STORE_NAME, 'client');
        },
        removeClient: async () => {
            const db = await getDB();
            await db.delete(STORE_NAME, 'client');
        },
    };
}
