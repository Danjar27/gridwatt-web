import { uploadJobPhoto } from './api/jobs.ts';
import { request } from './http-client';
import {
    getPendingMutations,
    updateMutationStatus,
    removeMutation,
    getPendingPhotos,
    updatePhotoStatus,
    removePhoto,
    isOnline,
    type MutationType,
} from './offline-store';
import { queryClient } from './query-client';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const MAX_RETRIES = 3;

// Map mutation types to their query keys
const typeToQueryKey: Record<MutationType, string> = {
    material: 'materials',
    activity: 'activities',
    seal: 'seals',
    user: 'users',
    job: 'jobs',
    order: 'orders',
    photo: 'photos',
};

/**
 * Normalize endpoint: strip absolute API_URL prefix from old mutations
 * so executeRequest (which prepends API_URL) works correctly.
 */
function normalizeEndpoint(endpoint: string): string {
    if (endpoint.startsWith('http')) {
        return endpoint.replace(API_URL, '');
    }

    return endpoint;
}

export async function syncPendingMutations(): Promise<{
    synced: number;
    failed: number;
}> {
    if (!isOnline()) {
        return { synced: 0, failed: 0 };
    }

    const mutations = await getPendingMutations();
    let synced = 0;
    let failed = 0;
    const syncedTypes = new Set<MutationType>();
    const syncedJobIds = new Set<string>();

    for (const mutation of mutations) {
        try {
            await updateMutationStatus(mutation.id, 'syncing');

            const endpoint = normalizeEndpoint(mutation.endpoint);

            await request(endpoint, {
                method: mutation.method,
                ...(mutation.data ? { body: JSON.stringify(mutation.data) } : {}),
            });

            await removeMutation(mutation.id);
            synced++;
            syncedTypes.add(mutation.type);

            // Track individual job IDs so we can clear _pendingSync from cache
            if (mutation.type === 'job') {
                const jobIdMatch = mutation.endpoint.match(/\/jobs\/(\d+)/);
                if (jobIdMatch) {
                    syncedJobIds.add(jobIdMatch[1]);
                }
            }
        } catch (error) {
            // 401 = token expired even after refresh → stop sync
            if (error instanceof Error && error.message.startsWith('401')) {
                await updateMutationStatus(mutation.id, 'pending');
                break;
            }

            if (mutation.retryCount >= MAX_RETRIES) {
                await updateMutationStatus(mutation.id, 'failed', mutation.retryCount);
                failed++;
            } else {
                await updateMutationStatus(mutation.id, 'pending', mutation.retryCount + 1);
            }
        }
    }

    // Invalidate queries for all synced types to refresh data from server
    for (const type of syncedTypes) {
        const queryKey = typeToQueryKey[type];
        if (queryKey) {
            await queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
    }

    // Invalidate individual job queries so _pendingSync flag gets cleared
    for (const jobId of syncedJobIds) {
        await queryClient.invalidateQueries({ queryKey: ['job', jobId] });
    }

    return { synced, failed };
}

export async function syncPendingPhotos(): Promise<{
    synced: number;
    failed: number;
}> {
    if (!isOnline()) {
        return { synced: 0, failed: 0 };
    }

    const photos = await getPendingPhotos();
    let synced = 0;
    let failed = 0;

    for (const photo of photos) {
        try {
            await updatePhotoStatus(photo.id, 'uploading');

            const file = new File([photo.blob], photo.type + '.jpg', { type: photo.blob.type });
            await uploadJobPhoto(file, photo.jobId, photo.type as 'antes' | 'despues');

            await removePhoto(photo.id);
            synced++;

            // Invalidate job query to refresh photos from server
            await queryClient.invalidateQueries({ queryKey: ['job', String(photo.jobId)] });
        } catch (error) {
            console.error(error);
            await updatePhotoStatus(photo.id, 'failed');
            failed++;
        }
    }

    return { synced, failed };
}

export async function performFullSync(): Promise<{
    mutations: { synced: number; failed: number };
    photos: { synced: number; failed: number };
}> {
    const mutations = await syncPendingMutations();
    const photos = await syncPendingPhotos();

    return { mutations, photos };
}

// Listen for online event to trigger sync
export function setupAutoSync(): () => void {
    const handleOnline = async () => {
        console.debug('Back online, syncing...');
        await performFullSync();
    };

    window.addEventListener('online', handleOnline);

    return () => {
        window.removeEventListener('online', handleOnline);
    };
}
