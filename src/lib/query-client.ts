import { QueryClient } from '@tanstack/react-query';
import { createIDBPersister } from './idb-persister';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            retry: (failureCount, error) => {
                if (error.message.includes('401')) {
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

export const persister = createIDBPersister();
