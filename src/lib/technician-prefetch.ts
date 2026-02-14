import { queryClient } from './query-client';
import { apiClient } from './api-client';

export async function prefetchTechnicianData() {
    // Prefetch catalog data and technician jobs in parallel
    await Promise.allSettled([
        queryClient.prefetchQuery({
            queryKey: ['jobs', 'my'],
            queryFn: () => apiClient.getMyJobs(),
        }),
        queryClient.prefetchQuery({
            queryKey: ['activities'],
            queryFn: () => apiClient.getActivities({ limit: 200 }),
        }),
        queryClient.prefetchQuery({
            queryKey: ['seals'],
            queryFn: () => apiClient.getSeals({ limit: 200 }),
        }),
        queryClient.prefetchQuery({
            queryKey: ['materials'],
            queryFn: () => apiClient.getMaterials({ limit: 200 }),
        }),
    ]);

    // Prefetch each individual job detail for offline viewing
    const jobs = queryClient.getQueryData<Array<{ id: number }>>(['jobs', 'my']);
    if (jobs?.length) {
        await Promise.allSettled(
            jobs.map((job) =>
                queryClient.prefetchQuery({
                    queryKey: ['job', String(job.id)],
                    queryFn: () => apiClient.getJob(job.id),
                })
            )
        );
    }
}
