import type { Activity } from '@interfaces/activity.interface.ts';
import { request, mutationRequest, type PaginatedResponse } from '../http-client';

export async function getActivities(params?: { limit?: number; offset?: number; from?: string; to?: string }) {
    const qs = params
        ? `?${new URLSearchParams(
              Object.entries(params)
                  .filter(([, v]) => v !== null)
                  .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';

    return request<PaginatedResponse<Activity>>(`/activities${qs}`);
}

export async function createActivity(data: Partial<Activity>) {
    const optimisticData: Activity = {
        id: data.id || `temp-${Date.now()}`,
        name: data.name || '',
        description: data.description,
        isActive: data.isActive ?? true,
    };

    return mutationRequest<Activity>(
        '/activities',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'activity', action: 'create', optimisticData }
    );
}

export async function updateActivity(id: string, data: Partial<Activity>) {
    const optimisticData: Activity = {
        id,
        name: data.name || '',
        description: data.description,
        isActive: data.isActive ?? true,
    };

    return mutationRequest<Activity>(
        `/activities/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'activity', action: 'update', optimisticData }
    );
}

export async function deleteActivity(id: string) {
    return mutationRequest<void>(
        `/activities/${id}`,
        { method: 'DELETE' },
        { type: 'activity', action: 'delete', optimisticData: { id } }
    );
}
