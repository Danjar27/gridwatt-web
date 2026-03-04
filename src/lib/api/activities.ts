import type { PaginatedQuery, PaginatedResponse } from '@interfaces/api.interface.ts';
import type { Activity } from '@interfaces/activity.interface.ts';

import { buildQueryParameters } from '@utils/common/parameters.ts';
import { request, mutationRequest, uploadFile } from '../http-client';

export const getActivities = async (params?: PaginatedQuery) => {
    const query = buildQueryParameters(params);

    return request<PaginatedResponse<Activity>>(`/activities${query}`);
};

export const createActivity = async (data: Partial<Activity>) =>
    mutationRequest<Activity>(
        '/activities',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'activity', action: 'create', optimisticData: data }
    );

export const updateActivity = async (id: string | number, data: Partial<Activity>) =>
    mutationRequest<Activity>(
        `/activities/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'activity', action: 'update', optimisticData: data }
    );

export const deleteActivity = async (id: string) =>
    mutationRequest<void>(
        `/activities/${id}`,
        { method: 'DELETE' },
        { type: 'activity', action: 'delete', optimisticData: { id } }
    );

export const importActivities = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return uploadFile<{
        created: number;
        updated: number;
        errors: Array<{ row: number; reason: string }>;
        total: number;
    }>('/activities/import', formData);
};

export interface ActivityPreviewRow {
    row: number;
    data: { id: string; name: string; contractPrice?: number; technicianPrice?: number };
    errors: Array<{ field: string; reason: string }>;
}

export interface ActivityCommitResult {
    created: number;
    updated: number;
    errors: number;
    total: number;
}

export const previewActivitiesImport = async (file: File): Promise<ActivityPreviewRow[]> => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadFile<ActivityPreviewRow[]>('/activities/import/preview', formData);
};

export const commitActivitiesImport = async (
    rows: Array<{ id: string; name: string; contractPrice?: number; technicianPrice?: number }>
): Promise<ActivityCommitResult> =>
    request<ActivityCommitResult>('/activities/import/commit', { method: 'POST', body: JSON.stringify({ rows }) });
