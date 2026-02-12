// src/lib/offline-sync.ts
// Handles sync logic for offline queue
import { getSyncQueue, clearSyncQueue } from './offline-db';
import { apiClient } from './api-client';

export async function syncOfflineQueue() {
    const queue = await getSyncQueue();
    for (const action of queue) {
        try {
            if (action.type === 'createOrder') {
                await apiClient.createOrder(action.data);
            }
            // Add more action types as needed
        } catch (err) {
            // If sync fails, keep in queue
            return false;
        }
    }
    await clearSyncQueue();
    return true;
}
