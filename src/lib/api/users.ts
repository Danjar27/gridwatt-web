import type { User } from '@interfaces/user.interface.ts';
import type { Tenant } from '@interfaces/tenant.interface.ts';
import { request, mutationRequest, type PaginatedResponse } from '../http-client';

export async function getUsers(params?: { limit?: number; offset?: number }) {
    const qs = params ? `?limit=${params.limit ?? 10}&offset=${params.offset ?? 0}` : '';

    return request<PaginatedResponse<User>>(`/users${qs}`);
}

export async function getRoles() {
    return request<Array<{ id: number; name: string }>>('/users/roles');
}

export async function createUser(data: Partial<User> & { password?: string; roleId: number; tenantId?: number }) {
    const optimisticData: User = {
        id: data.id || -Date.now(),
        name: data.name || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone,
        isActive: data.isActive ?? true,
        role: { id: data.roleId, name: 'technician' },
        tenantId: data.tenantId || 0,
        tenant: data.tenant || ({} as Tenant),
    };

    return mutationRequest<User>(
        '/users',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'user', action: 'create', optimisticData }
    );
}

export async function updateUser(id: number, data: Partial<User> & { password?: string; roleId?: number }) {
    const optimisticData: User = {
        id,
        name: data.name || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone,
        isActive: data.isActive,
        role: { id: data.roleId || 0, name: 'technician' },
        tenantId: data.tenantId || 0,
        tenant: data.tenant || ({} as Tenant),
    };

    return mutationRequest<User>(
        `/users/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'user', action: 'update', optimisticData }
    );
}

export async function getTechnicians() {
    return request<Array<User>>('/users/technicians');
}

export async function getProfile() {
    return request<User>('/users/profile');
}

export async function updateProfile(data: Partial<User>) {
    return request<User>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteUser(id: number) {
    return mutationRequest(
        `/users/${id}`,
        { method: 'DELETE' },
        { type: 'user', action: 'delete', optimisticData: { id } }
    );
}
