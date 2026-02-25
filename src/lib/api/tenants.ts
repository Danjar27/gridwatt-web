import type { PaginatedQuery, PaginatedResponse } from '@interfaces/api.interface.ts';
import type { Tenant } from '@interfaces/tenant.interface.ts';

import { buildQueryParameters } from '@utils/common/parameters.ts';
import { request } from '../http-client';

export const getTenants = async (params?: PaginatedQuery) =>
    request<PaginatedResponse<Tenant>>(`/tenants${buildQueryParameters(params)}`);

export const createTenant = async (data: { name: string; code: string }) =>
    request<Tenant>('/tenants', { method: 'POST', body: JSON.stringify(data) });

export const updateTenant = async (id: number, data: { name?: string; slug?: string; isActive?: boolean }) =>
    request<Tenant>(`/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTenant = async (id: number) =>
    request<Tenant>(`/tenants/${id}`, { method: 'DELETE' });
