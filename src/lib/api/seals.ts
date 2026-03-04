import type { PaginatedQuery, PaginatedResponse } from '@interfaces/api.interface.ts';
import type { Seal } from '@interfaces/seal.interface.ts';

import { buildQueryParameters } from '@utils/common/parameters.ts';
import { request, mutationRequest } from '../http-client';

export const getSeals = async (params?: PaginatedQuery) =>
    request<PaginatedResponse<Seal>>(`/seals${buildQueryParameters(params)}`);

export const createSeal = async (data: Partial<Seal>) =>
    mutationRequest<Seal>(
        '/seals',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'seal', action: 'create', optimisticData: data }
    );

export const updateSeal = async (id: string | number, data: Partial<Seal>) =>
    mutationRequest<Seal>(
        `/seals/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'seal', action: 'update', optimisticData: data }
    );

export const deleteSeal = async (id: string) =>
    mutationRequest<void>(
        `/seals/${id}`,
        { method: 'DELETE' },
        { type: 'seal', action: 'delete', optimisticData: { id } }
    );

export const toggleSealActive = async (id: string) =>
    mutationRequest<Seal>(
        `/seals/${id}/toggle-active`,
        { method: 'PATCH' },
        { type: 'seal', action: 'toggle-active', optimisticData: { id } }
    );

export const createSealRange = async (data: { type: string; namePrefix?: string; from: number; to: number }) =>
    request<{ requested: number; created: number; skipped: number }>(
        '/seals/range',
        { method: 'POST', body: JSON.stringify(data) }
    );

export const assignSeal = async (
    id: string,
    data: { technicianId: number; fromNumber: number; toNumber: number }
) => request<{ sealId: string; technicianId: number; fromNumber: number; toNumber: number }>(
    `/seals/${id}/assign`,
    { method: 'POST', body: JSON.stringify(data) }
);
