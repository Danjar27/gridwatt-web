import type { Actions, Context } from './interface.ts';

import { createContext, useContext } from 'react';

export const OfflineContext = createContext<Context>({
    online: true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncResult: null,
    failedMutations: [],
});

export const OfflineActions = createContext<Actions>({
    syncNow: async () => {},
    retryMutation: async () => {},
    dismissMutation: async () => {},
});

export const useOfflineContext = () => useContext(OfflineContext);

export const useOfflineActions = () => useContext(OfflineActions);
