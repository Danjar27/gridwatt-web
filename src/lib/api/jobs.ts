import type { Job } from '@interfaces/job.interface.ts';
import type { Photo } from '@interfaces/photo.interface.ts';
import { request, mutationRequest, uploadFile, type PaginatedResponse } from '../http-client';

export async function getJobs(params?: {
    limit?: number;
    offset?: number;
    from?: string;
    to?: string;
    technicianId?: number;
}) {
    const qs = params
        ? `?${new URLSearchParams(
              Object.entries(params)
                  .filter(([, v]) => v !== null)
                  .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';

    return request<PaginatedResponse<Job>>(`/jobs${qs}`);
}

export async function getMyJobs() {
    return request<Array<Job>>('/jobs/my');
}

export async function getJob(id: number) {
    return request<Job>(`/jobs/${id}`);
}

export async function createJob(data: Partial<Job>) {
    return mutationRequest<Job>(
        '/jobs',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'job', action: 'create', optimisticData: { id: -Date.now(), ...data } }
    );
}

export async function updateJob(id: number, data: Partial<Job>) {
    return mutationRequest<Job>(
        `/jobs/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'job', action: 'update', optimisticData: { id, ...data } }
    );
}

export async function markJobSynced(id: number) {
    return request<Job>(`/jobs/${id}/sync`, { method: 'PUT' });
}

export async function addJobMaterial(jobId: number, materialId: string, quantity: number) {
    return mutationRequest(
        `/jobs/${jobId}/materials`,
        { method: 'POST', body: JSON.stringify({ materialId, quantity }) },
        { type: 'job', action: 'create', optimisticData: { jobId, materialId, quantity } }
    );
}

export async function addJobActivity(jobId: number, activityId: string) {
    return mutationRequest(
        `/jobs/${jobId}/activities`,
        { method: 'POST', body: JSON.stringify({ activityId }) },
        { type: 'job', action: 'create', optimisticData: { jobId, activityId } }
    );
}

export async function addJobSeal(jobId: number, sealId: string) {
    return mutationRequest(
        `/jobs/${jobId}/seals`,
        { method: 'POST', body: JSON.stringify({ sealId }) },
        { type: 'job', action: 'create', optimisticData: { jobId, sealId } }
    );
}

export async function addJobPhoto(jobId: number, path: string, type: string, notes?: string) {
    return mutationRequest(
        `/jobs/${jobId}/photos`,
        { method: 'POST', body: JSON.stringify({ path, type, notes }) },
        { type: 'job', action: 'create', optimisticData: { jobId, path, type, notes } }
    );
}

export async function removeJobActivity(jobActivityId: string) {
    return mutationRequest(
        `/jobs/activities/${jobActivityId}`,
        { method: 'DELETE' },
        { type: 'job', action: 'delete', optimisticData: { id: jobActivityId } }
    );
}

export async function removeJobSeal(jobSealId: string) {
    return mutationRequest(
        `/jobs/seals/${jobSealId}`,
        { method: 'DELETE' },
        { type: 'job', action: 'delete', optimisticData: { id: jobSealId } }
    );
}

export async function removeJobMaterial(workMaterialId: string) {
    return mutationRequest(
        `/jobs/materials/${workMaterialId}`,
        { method: 'DELETE' },
        { type: 'job', action: 'delete', optimisticData: { id: workMaterialId } }
    );
}

export async function removeJobPhoto(photoId: string) {
    return mutationRequest(
        `/jobs/photos/${photoId}`,
        { method: 'DELETE' },
        { type: 'job', action: 'delete', optimisticData: { id: photoId } }
    );
}

export async function uploadJobPhoto(file: File, jobId: number, type: string): Promise<Photo> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return uploadFile<Photo>(`/jobs/${jobId}/photos/upload`, formData);
}
