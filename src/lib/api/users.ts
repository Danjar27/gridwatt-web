import type { PaginatedQuery, PaginatedResponse } from '@interfaces/api.interface.ts';
import type { User } from '@interfaces/user.interface.ts';

import { buildQueryParameters } from '@utils/common/parameters.ts';
import { request, mutationRequest } from '../http-client';

export const getUsers = async (params?: PaginatedQuery) =>
    request<PaginatedResponse<User>>(`/users${buildQueryParameters(params)}`);

export const getRoles = async () =>
    request<Array<{ id: number; name: string }>>('/users/roles');

export const createUser = async (data: Partial<User> & { password?: string; roleId: number; tenantId?: number }) =>
    mutationRequest<User>(
        '/users',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'user', action: 'create', optimisticData: data }
    );

export const updateUser = async (id: number, data: Partial<User> & { password?: string; roleId?: number }) =>
    mutationRequest<User>(
        `/users/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'user', action: 'update', optimisticData: { id, ...data } }
    );

export const getTechnicians = async () =>
    request<Array<User>>('/users/technicians');

export const getProfile = async () =>
    request<User>('/users/profile');

export const updateProfile = async (data: Partial<User>) =>
    request<User>('/users/profile', { method: 'PUT', body: JSON.stringify(data) });

export const deleteUser = async (id: number) =>
    mutationRequest(
        `/users/${id}`,
        { method: 'DELETE' },
        { type: 'user', action: 'delete', optimisticData: { id } }
    );
