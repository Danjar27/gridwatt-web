import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'gridwatt-offline';
const DB_VERSION = 2;

export type MutationType = 'job' | 'order' | 'photo' | 'material' | 'activity' | 'seal' | 'user';

export interface OfflineMutation {
    id: string;
    type: MutationType;
    action: 'create' | 'update' | 'delete' | 'toggle-active';
    data: unknown;
    endpoint: string;
    method: string;
    createdAt: number;
    retryCount: number;
    status: 'pending' | 'syncing' | 'failed';
    /** Optional: store optimistic response data for UI updates */
    optimisticData?: unknown;
}

export interface PendingPhoto {
    id: string;
    jobId: number;
    blob: Blob;
    type: 'antes' | 'despues';
    createdAt: number;
    status: 'pending' | 'uploading' | 'failed';
}

async function getDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
            // Store for offline mutations
            if (!db.objectStoreNames.contains('mutations')) {
                const mutationsStore = db.createObjectStore('mutations', {
                    keyPath: 'id',
                });
                mutationsStore.createIndex('status', 'status');
                mutationsStore.createIndex('createdAt', 'createdAt');
            }

            // V2: Recreate photos store to support blob storage
            if (oldVersion < 2 && db.objectStoreNames.contains('photos')) {
                db.deleteObjectStore('photos');
            }

            if (!db.objectStoreNames.contains('photos')) {
                const photosStore = db.createObjectStore('photos', { keyPath: 'id' });
                photosStore.createIndex('jobId', 'jobId');
                photosStore.createIndex('status', 'status');
            }

            // Store for cached data (jobs, orders, materials, etc.)
            if (!db.objectStoreNames.contains('cache')) {
                db.createObjectStore('cache', { keyPath: 'key' });
            }
        },
    });
}

// Offline Mutations
export async function addOfflineMutation(
    mutation: Omit<OfflineMutation, 'id' | 'createdAt' | 'retryCount' | 'status'>
): Promise<string> {
    const db = await getDB();
    const id = `${mutation.type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const fullMutation: OfflineMutation = {
        ...mutation,
        id,
        createdAt: Date.now(),
        retryCount: 0,
        status: 'pending',
    };
    await db.add('mutations', fullMutation);

    return id;
}

export async function getPendingMutations(): Promise<Array<OfflineMutation>> {
    const db = await getDB();

    return db.getAllFromIndex('mutations', 'status', 'pending');
}

export async function getPendingMutationsByType(type: MutationType): Promise<Array<OfflineMutation>> {
    const db = await getDB();
    const allPending = await db.getAllFromIndex('mutations', 'status', 'pending');

    return allPending.filter((m) => m.type === type);
}

export async function updateMutationStatus(
    id: string,
    status: OfflineMutation['status'],
    retryCount?: number
): Promise<void> {
    const db = await getDB();
    const mutation = await db.get('mutations', id);
    if (mutation) {
        mutation.status = status;
        if (retryCount !== undefined) {
            mutation.retryCount = retryCount;
        }
        await db.put('mutations', mutation);
    }
}

export async function removeMutation(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('mutations', id);
}

export async function clearCompletedMutations(): Promise<void> {
    const db = await getDB();
    const allMutations = await db.getAll('mutations');
    for (const mutation of allMutations) {
        if (mutation.status !== 'pending') {
            await db.delete('mutations', mutation.id);
        }
    }
}

export async function getFailedMutations(): Promise<Array<OfflineMutation>> {
    const db = await getDB();

    return db.getAllFromIndex('mutations', 'status', 'failed');
}

export async function resetMutationForRetry(id: string): Promise<void> {
    const db = await getDB();
    const mutation = await db.get('mutations', id);
    if (mutation) {
        mutation.status = 'pending';
        mutation.retryCount = 0;
        await db.put('mutations', mutation);
    }
}

// Pending Photos (blob storage)
export async function addPendingPhoto(photo: Omit<PendingPhoto, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const db = await getDB();
    const id = `photo-${photo.jobId}-${Date.now()}`;
    const fullPhoto: PendingPhoto = {
        ...photo,
        id,
        createdAt: Date.now(),
        status: 'pending',
    };
    await db.add('photos', fullPhoto);

    return id;
}

export async function getPendingPhotos(jobId?: number): Promise<Array<PendingPhoto>> {
    const db = await getDB();
    if (jobId) {
        return db.getAllFromIndex('photos', 'jobId', jobId);
    }

    return db.getAllFromIndex('photos', 'status', 'pending');
}

export async function updatePhotoStatus(id: string, status: PendingPhoto['status']): Promise<void> {
    const db = await getDB();
    const photo = await db.get('photos', id);
    if (photo) {
        photo.status = status;
        await db.put('photos', photo);
    }
}

export async function removePhoto(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('photos', id);
}

// Cache helpers
export async function setCacheItem<T>(key: string, data: T): Promise<void> {
    const db = await getDB();
    await db.put('cache', { key, data, updatedAt: Date.now() });
}

export async function getCacheItem<T>(key: string): Promise<T | undefined> {
    const db = await getDB();
    const item = await db.get('cache', key);

    return item?.data as T | undefined;
}

export async function removeCacheItem(key: string): Promise<void> {
    const db = await getDB();
    await db.delete('cache', key);
}

// Sync status
export function isOnline(): boolean {
    return navigator.onLine;
}

export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}
