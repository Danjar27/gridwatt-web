import type { PaginatedQuery, PaginatedResponse } from '@interfaces/api.interface.ts';
import type { Photo } from '@interfaces/photo.interface.ts';
import type { Job } from '@interfaces/job.interface.ts';

import { buildQueryParameters } from '@utils/common/parameters.ts';
import { request, mutationRequest, uploadFile } from '../http-client';

export const getJobs = async (params?: PaginatedQuery & { technicianId?: number }) =>
    request<PaginatedResponse<Job>>(`/jobs${buildQueryParameters(params)}`);

export const getMyJobs = async () => request<Array<Job>>('/jobs/my');

export const getJob = async (id: number) => request<Job>(`/jobs/${id}`);

export const createJob = async (data: Partial<Job>) =>
    mutationRequest<Job>(
        '/jobs',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'job', action: 'create', optimisticData: { id: -Date.now(), ...data } }
    );

export const updateJob = async (id: number, data: Partial<Job>) =>
    mutationRequest<Job>(
        `/jobs/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'job', action: 'update', optimisticData: { id, ...data } }
    );

export const markJobSynced = async (id: number) => request<Job>(`/jobs/${id}/sync`, { method: 'PUT' });

export const reopenJob = async (id: number) => request<Job>(`/jobs/${id}/reopen`, { method: 'PUT' });

export const addJobMaterial = async (jobId: number, materialId: string, quantity: number) =>
    mutationRequest(
        `/jobs/${jobId}/materials`,
        { method: 'POST', body: JSON.stringify({ materialId, quantity }) },
        { type: 'job', action: 'create', optimisticData: { jobId, materialId, quantity } }
    );

export const addJobActivity = async (jobId: number, activityId: string) =>
    mutationRequest(
        `/jobs/${jobId}/activities`,
        { method: 'POST', body: JSON.stringify({ activityId }) },
        { type: 'job', action: 'create', optimisticData: { jobId, activityId } }
    );

export const addJobSeal = async (jobId: number, sealId: string) =>
    mutationRequest(
        `/jobs/${jobId}/seals`,
        { method: 'POST', body: JSON.stringify({ sealId }) },
        { type: 'job', action: 'create', optimisticData: { jobId, sealId } }
    );

export const addJobPhoto = async (jobId: number, path: string, type: string, notes?: string) =>
    mutationRequest(
        `/jobs/${jobId}/photos`,
        { method: 'POST', body: JSON.stringify({ path, type, notes }) },
        { type: 'job', action: 'create', optimisticData: { jobId, path, type, notes } }
    );

export const removeJobActivity = async (jobId: number, activityId: string) =>
    mutationRequest(
        `/jobs/${jobId}/activities/${activityId}`,
        { method: 'DELETE' },
        { type: 'job', action: 'delete', optimisticData: { jobId, activityId } }
    );

export const removeJobSeal = async (jobId: number, sealId: string) =>
    mutationRequest(
        `/jobs/${jobId}/seals/${sealId}`,
        { method: 'DELETE' },
        { type: 'job', action: 'delete', optimisticData: { jobId, sealId } }
    );

export const removeJobMaterial = async (jobId: number, materialId: string) =>
    mutationRequest(
        `/jobs/${jobId}/materials/${materialId}`,
        { method: 'DELETE' },
        { type: 'job', action: 'delete', optimisticData: { jobId, materialId } }
    );

export const removeJobPhoto = async (photoId: string) =>
    mutationRequest(
        `/jobs/photos/${photoId}`,
        { method: 'DELETE' },
        { type: 'job', action: 'delete', optimisticData: { id: photoId } }
    );

export const uploadJobPhoto = async (file: File, jobId: number, type: string): Promise<Photo> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return uploadFile<Photo>(`/jobs/${jobId}/photos/upload`, formData);
};

export const downloadCompletedJobsReport = async (from: string, to: string): Promise<void> => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/jobs/export?from=${from}&to=${to}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Export failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `jobs-export-${from}-${to}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
};
