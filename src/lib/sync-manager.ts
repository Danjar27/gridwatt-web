import { apiClient } from './api-client';
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

    for (const mutation of mutations) {
        try {
            await updateMutationStatus(mutation.id, 'syncing');

            // Execute the API call
            const response = await fetch(mutation.endpoint, {
                method: mutation.method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiClient.getAccessToken()}`,
                },
                // Only include body if there's data (not for DELETE or some PATCH requests)
                ...(mutation.data ? { body: JSON.stringify(mutation.data) } : {}),
            });

            if (response.ok) {
                await removeMutation(mutation.id);
                synced++;
                syncedTypes.add(mutation.type);
            } else if (response.status === 401) {
                // Token expired, will retry after refresh
                await updateMutationStatus(mutation.id, 'pending');
            } else {
                // Permanent failure
                if (mutation.retryCount >= MAX_RETRIES) {
                    await updateMutationStatus(mutation.id, 'failed', mutation.retryCount);
                    failed++;
                } else {
                    await updateMutationStatus(mutation.id, 'pending', mutation.retryCount + 1);
                }
            }
        } catch (error) {
            console.error(error);
            // Network error, will retry
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

            // For offline photos, we stored a file reference (local path)
            // The user would need to re-select the file when online
            // This is a simplified flow - in production you might use File System Access API
            // or store the file in IndexedDB as a blob (but we agreed not to do that)

            // For now, we'll create a photo record with the local path
            // The actual upload happens when the user is online and re-selects the file
            await apiClient.addJobPhoto(photo.jobId, photo.localPath, photo.type, photo.notes);

            await removePhoto(photo.id);
            synced++;
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

// Background sync registration
export async function registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await (
                registration as unknown as {
                    sync: { register: (tag: string) => Promise<void> };
                }
            ).sync.register('gridwatt-sync');
        } catch (error) {
            console.error('Background sync registration failed:', error);
        }
    }
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
