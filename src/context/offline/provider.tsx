import type { Actions, Context } from '@context/offline/interface.ts';
import type { FC, PropsWithChildren } from 'react';

import { getPendingMutations, isOnline, onOnlineStatusChange } from '@lib/offline-store.ts';
import { performFullSync, setupAutoSync } from '@lib/sync-manager.ts';
import { OfflineActions, OfflineContext } from './context.ts';
import { useEffect, useMemo, useState } from 'react';

const OfflineProvider: FC<PropsWithChildren> = ({ children }) => {
    const [online, setOnline] = useState(isOnline());
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncResult, setLastSyncResult] = useState<{
        synced: number;
        failed: number;
    } | null>(null);

    useEffect(() => {
        const cleanup = onOnlineStatusChange(setOnline);

        const cleanupAutoSync = setupAutoSync();

        const checkPending = async () => {
            const mutations = await getPendingMutations();
            setPendingCount(mutations.length);
        };

        checkPending();
        const interval = setInterval(checkPending, 5000);

        return () => {
            cleanup();
            cleanupAutoSync();
            clearInterval(interval);
        };
    }, []);

    const syncNow = async () => {
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

            const mutations = await getPendingMutations();
            setPendingCount(mutations.length);
        } finally {
            setIsSyncing(false);
        }
    };

    const context = useMemo<Context>(
        () => ({
            online,
            pendingCount,
            isSyncing,
            lastSyncResult,
        }),
        [online, pendingCount, isSyncing, lastSyncResult]
    );

    const actions = useMemo<Actions>(
        () => ({
            syncNow,
        }),
        [syncNow]
    );

    return (
        <OfflineContext.Provider value={context}>
            <OfflineActions.Provider value={actions}>{children}</OfflineActions.Provider>
        </OfflineContext.Provider>
    );
};

export default OfflineProvider;
