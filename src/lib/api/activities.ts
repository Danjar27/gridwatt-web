import type { PaginatedQuery, PaginatedResponse } from '@interfaces/api.interface.ts';
import type { Activity } from '@interfaces/activity.interface.ts';

import { buildQueryParameters } from '@utils/common/parameters.ts';
import { request, mutationRequest } from '../http-client';

export const getActivities = async (params?: PaginatedQuery) => {
    const query = buildQueryParameters(params);

    return request<PaginatedResponse<Activity>>(`/activities${query}`);
};

export const createActivity = async (data: Partial<Activity>) => mutationRequest<Activity>(
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
