import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createIDBPersister } from './idb-persister';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            retry: (failureCount, error) => {
                // Don't retry on 401/403
                if (error instanceof Error && error.message.includes('401')) {
                    return false;
                }

                return failureCount < 3;
            },
            networkMode: 'offlineFirst',
        },
        mutations: {
            networkMode: 'offlineFirst',
        },
    },
});

// Persist queries to IndexedDB
const persister = createIDBPersister();

persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
});
