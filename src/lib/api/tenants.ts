import type { Tenant } from '@interfaces/tenant.interface.ts';
import { request, type PaginatedResponse } from '../http-client';

export async function getTenants(params?: { limit?: number; offset?: number }) {
    const qs = params ? `?limit=${params.limit ?? 10}&offset=${params.offset ?? 0}` : '';

    return request<PaginatedResponse<Tenant>>(`/tenants${qs}`);
}

export async function createTenant(data: { name: string; code: string }) {
    return request<Tenant>('/tenants', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateTenant(id: number, data: { name?: string; slug?: string; isActive?: boolean }) {
    return request<Tenant>(`/tenants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteTenant(id: number) {
    return request<Tenant>(`/tenants/${id}`, {
        method: 'DELETE',
    });
}
