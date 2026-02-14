import type { OfflineMutation } from '@lib/offline-store';

export interface Context {
    /**
     * Checks user connection status. If user is offline, data must be
     * stored locally and synced when the user comes back online.
     */
    online: boolean;
    pendingCount: number;
    /**
     * Checks if the app is currently syncing data with the server.
     */
    isSyncing: boolean;
    /**
     * Result of the last sync operation. `null` if the app has not synced any
     * data to the server yet, or if the app is online.
     */
    lastSyncResult: { synced: number; failed: number } | null;
    /**
     * Mutations that have exceeded the max retry count.
     */
    failedMutations: Array<OfflineMutation>;
}

export interface Actions {
    /**
     * Attempts to sync data with the server.
     */
    syncNow: () => Promise<void>;
    /**
     * Reset a failed mutation for retry and trigger sync.
     */
    retryMutation: (id: string) => Promise<void>;
    /**
     * Remove a failed mutation from the queue.
     */
    dismissMutation: (id: string) => Promise<void>;
}
