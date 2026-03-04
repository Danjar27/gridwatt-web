import type { PaginatedQuery, PaginatedResponse } from '@interfaces/api.interface.ts';
import type { Material, Stock } from '@interfaces/material.interface.ts';

import { buildQueryParameters } from '@utils/common/parameters.ts';
import { request, mutationRequest, uploadFile } from '../http-client';

export const getMaterials = async (params?: PaginatedQuery) =>
    request<PaginatedResponse<Material>>(`/materials${buildQueryParameters(params)}`);

export const createMaterial = async (data: Partial<Material>) =>
    mutationRequest<Material>(
        '/materials',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'material', action: 'create', optimisticData: data }
    );

export const updateMaterial = async (id: string | number, data: Partial<Material>) =>
    mutationRequest<Material>(
        `/materials/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'material', action: 'update', optimisticData: data }
    );

export const deleteMaterial = async (id: string) =>
    mutationRequest<void>(
        `/materials/${id}`,
        { method: 'DELETE' },
        { type: 'material', action: 'delete', optimisticData: { id } }
    );

export const toggleMaterialActive = async (id: string) =>
    mutationRequest<Material>(
        `/materials/${id}/toggle-active`,
        { method: 'PATCH' },
        { type: 'material', action: 'toggle-active', optimisticData: { id } }
    );

export const importMaterials = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadFile<{ created: number; updated: number; errors: Array<{ row: number; reason: string }>; total: number }>(
        '/materials/import',
        formData
    );
};

export const getMaterialStock = async (materialId: string) =>
    request<Array<Stock>>(`/materials/${materialId}/stock`);

export const assignMaterialStock = async (
    materialId: string,
    stockId: string,
    data: { technicianId: number; quantity: number }
) => request<Stock>(`/materials/${materialId}/stock/${stockId}/assign`, { method: 'POST', body: JSON.stringify(data) });
