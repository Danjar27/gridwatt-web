import type { PaginatedQuery, PaginatedResponse } from '@interfaces/api.interface.ts';
import type { Material } from '@interfaces/material.interface.ts';

import { buildQueryParameters } from '@utils/common/parameters.ts';
import { request, mutationRequest } from '../http-client';

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
