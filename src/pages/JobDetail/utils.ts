import type { QueryClient } from '@tanstack/react-query';
import type { Job } from '@lib/api-client';

/**
 * Mark a job as _pendingSync in all jobs list caches.
 * This ensures the PendingSyncWrapper shows on the jobs list page
 * when any offline mutation is made from a sub-section.
 */
export function markJobPendingInLists(queryClient: QueryClient, jobId: number) {
    const jobsCaches = queryClient.getQueriesData<Array<Job>>({ queryKey: ['jobs'] });
    for (const [queryKey, cachedJobs] of jobsCaches) {
        if (!Array.isArray(cachedJobs)) continue;
        queryClient.setQueryData<Array<Job>>(queryKey, (jobs) =>
            jobs?.map((j) =>
                j.id === jobId ? { ...j, _pendingSync: true } : j
            )
        );
    }
}
