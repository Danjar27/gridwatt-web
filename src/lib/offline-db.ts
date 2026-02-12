// src/lib/offline-db.ts
// IndexedDB wrapper for offline orders, technicians, and sync queue

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'gridwatt-offline';
const DB_VERSION = 1;

export async function getDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('orders')) {
                db.createObjectStore('orders', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('technicians')) {
                db.createObjectStore('technicians', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { autoIncrement: true });
            }
        },
    });
}

export async function cacheOrders(orders: any[]) {
    const db = await getDB();
    const tx = db.transaction('orders', 'readwrite');
    await Promise.all(orders.map((order) => tx.store.put(order)));
    await tx.done;
}

export async function getCachedOrders() {
    const db = await getDB();
    return db.getAll('orders');
}

export async function cacheTechnicians(technicians: any[]) {
    const db = await getDB();
    const tx = db.transaction('technicians', 'readwrite');
    await Promise.all(technicians.map((t) => tx.store.put(t)));
    await tx.done;
}

export async function getCachedTechnicians() {
    const db = await getDB();
    return db.getAll('technicians');
}

export async function addToSyncQueue(action: any) {
    const db = await getDB();
    await db.add('syncQueue', action);
}

export async function getSyncQueue() {
    const db = await getDB();
    return db.getAll('syncQueue');
}

export async function clearSyncQueue() {
    const db = await getDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    await tx.store.clear();
    await tx.done;
}
