import { queryClient } from './query-client';
import { getActivities } from './api/activities.ts';
import { getJob, getMyJobs } from './api/jobs.ts';
import { getMaterials } from './api/materials.ts';
import { getSeals } from './api/seals.ts';
export async function prefetchTechnicianData() {
    // Prefetch catalog data and technician jobs in parallel
    await Promise.allSettled([
        queryClient.prefetchQuery({
            queryKey: ['jobs', 'my'],
            queryFn: () => getMyJobs(),
        }),
        queryClient.prefetchQuery({
            queryKey: ['activities'],
            queryFn: () => getActivities({ limit: 200 }),
        }),
        queryClient.prefetchQuery({
            queryKey: ['seals'],
            queryFn: () => getSeals({ limit: 200 }),
        }),
        queryClient.prefetchQuery({
            queryKey: ['materials'],
            queryFn: () => getMaterials({ limit: 200 }),
        }),
    ]);

    // Prefetch each individual job detail for offline viewing
    const jobs = queryClient.getQueryData<Array<{ id: number }>>(['jobs', 'my']);
    if (jobs?.length) {
        await Promise.allSettled(
            jobs.map((job) =>
                queryClient.prefetchQuery({
                    queryKey: ['job', String(job.id)],
                    queryFn: () => getJob(job.id),
                })
            )
        );
    }
}
