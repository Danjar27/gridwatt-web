import type { Material } from '@interfaces/material.interface.ts';
import { request, mutationRequest, type PaginatedResponse } from '../http-client';

export async function getMaterials(params?: { limit?: number; offset?: number; from?: string; to?: string }) {
    const qs = params
        ? `?${new URLSearchParams(
              Object.entries(params)
                  .filter(([, v]) => v !== null)
                  .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';

    return request<PaginatedResponse<Material>>(`/materials${qs}`);
}

export async function createMaterial(data: Partial<Material>) {
    const optimisticData: Material = {
        id: data.id || `temp-${Date.now()}`,
        name: data.name || '',
        type: data.type || '',
        unit: data.unit || '',
        description: data.description,
        allowsDecimals: data.allowsDecimals ?? false,
        isActive: data.isActive ?? true,
    };

    return mutationRequest<Material>(
        '/materials',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'material', action: 'create', optimisticData }
    );
}

export async function updateMaterial(id: string, data: Partial<Material>) {
    const optimisticData: Material = {
        id,
        name: data.name || '',
        type: data.type || '',
        unit: data.unit || '',
        description: data.description,
        allowsDecimals: data.allowsDecimals ?? false,
        isActive: data.isActive ?? true,
    };

    return mutationRequest<Material>(
        `/materials/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'material', action: 'update', optimisticData }
    );
}

export async function deleteMaterial(id: string) {
    return mutationRequest<void>(
        `/materials/${id}`,
        { method: 'DELETE' },
        { type: 'material', action: 'delete', optimisticData: { id } }
    );
}

export async function toggleMaterialActive(id: string) {
    return mutationRequest<Material>(
        `/materials/${id}/toggle-active`,
        { method: 'PATCH' },
        { type: 'material', action: 'toggle-active', optimisticData: { id } }
    );
}
