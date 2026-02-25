import type { Seal } from '@interfaces/seal.interface.ts';
import { request, mutationRequest, type PaginatedResponse } from '../http-client';

export async function getSeals(params?: { limit?: number; offset?: number; from?: string; to?: string }) {
    const qs = params
        ? `?${new URLSearchParams(
              Object.entries(params)
                  .filter(([, v]) => v !== null)
                  .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';

    return request<PaginatedResponse<Seal>>(`/seals${qs}`);
}

export async function createSeal(data: Partial<Seal>) {
    const optimisticData: Seal = {
        id: data.id || `temp-${Date.now()}`,
        name: data.name || '',
        type: data.type || '',
        description: data.description,
        isActive: data.isActive ?? true,
    };

    return mutationRequest<Seal>(
        '/seals',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'seal', action: 'create', optimisticData }
    );
}

export async function updateSeal(id: string, data: Partial<Seal>) {
    const optimisticData: Seal = {
        id,
        name: data.name || '',
        type: data.type || '',
        description: data.description,
        isActive: data.isActive ?? true,
    };

    return mutationRequest<Seal>(
        `/seals/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'seal', action: 'update', optimisticData }
    );
}

export async function deleteSeal(id: string) {
    return mutationRequest<void>(
        `/seals/${id}`,
        { method: 'DELETE' },
        { type: 'seal', action: 'delete', optimisticData: { id } }
    );
}

export async function toggleSealActive(id: string) {
    return mutationRequest<Seal>(
        `/seals/${id}/toggle-active`,
        { method: 'PATCH' },
        { type: 'seal', action: 'toggle-active', optimisticData: { id } }
    );
}
