import type { Actions, Context } from '@context/offline/interface.ts';
import type { FC, PropsWithChildren } from 'react';

import {
    getPendingMutations,
    getFailedMutations,
    resetMutationForRetry,
    removeMutation,
    isOnline,
    onOnlineStatusChange,
    type OfflineMutation,
} from '@lib/offline-store.ts';
import { performFullSync, setupAutoSync } from '@lib/sync-manager.ts';
import { OfflineActions, OfflineContext } from './context.ts';
import { useCallback, useEffect, useMemo, useState } from 'react';

const OfflineProvider: FC<PropsWithChildren> = ({ children }) => {
    const [online, setOnline] = useState(isOnline());
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [failedMutations, setFailedMutations] = useState<Array<OfflineMutation>>([]);
    const [lastSyncResult, setLastSyncResult] = useState<{
        synced: number;
        failed: number;
    } | null>(null);

    const refreshCounts = useCallback(async () => {
        const pending = await getPendingMutations();
        setPendingCount(pending.length);
        const failed = await getFailedMutations();
        setFailedMutations(failed);
    }, []);

    useEffect(() => {
        const cleanup = onOnlineStatusChange(setOnline);
        const cleanupAutoSync = setupAutoSync();

        refreshCounts();
        const interval = setInterval(refreshCounts, 5000);

        return () => {
            cleanup();
            cleanupAutoSync();
            clearInterval(interval);
        };
    }, [refreshCounts]);

    const syncNow = useCallback(async () => {
        if (!online || isSyncing) {
            return;
        }

        setIsSyncing(true);
        try {
            const result = await performFullSync();
            setLastSyncResult({
                synced: result.mutations.synced + result.photos.synced,
                failed: result.mutations.failed + result.photos.failed,
            });
            await refreshCounts();
        } finally {
            setIsSyncing(false);
        }
    }, [online, isSyncing, refreshCounts]);

    const retryMutation = useCallback(async (id: string) => {
        await resetMutationForRetry(id);
        await refreshCounts();
        // Trigger sync after resetting
        setIsSyncing(true);
        try {
            const result = await performFullSync();
            setLastSyncResult({
                synced: result.mutations.synced + result.photos.synced,
                failed: result.mutations.failed + result.photos.failed,
            });
            await refreshCounts();
        } finally {
            setIsSyncing(false);
        }
    }, [refreshCounts]);

    const dismissMutation = useCallback(async (id: string) => {
        await removeMutation(id);
        await refreshCounts();
    }, [refreshCounts]);

    const context = useMemo<Context>(
        () => ({
            online,
            pendingCount,
            isSyncing,
            lastSyncResult,
            failedMutations,
        }),
        [online, pendingCount, isSyncing, lastSyncResult, failedMutations]
    );

    const actions = useMemo<Actions>(
        () => ({
            syncNow,
            retryMutation,
            dismissMutation,
        }),
        [syncNow, retryMutation, dismissMutation]
    );

    return (
        <OfflineContext.Provider value={context}>
            <OfflineActions.Provider value={actions}>{children}</OfflineActions.Provider>
        </OfflineContext.Provider>
    );
};

export default OfflineProvider;
