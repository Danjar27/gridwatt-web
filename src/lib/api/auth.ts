import type { User } from '@interfaces/user.interface.ts';

import { request, setTokens, clearTokens } from '../http-client';

export async function login(email: string, password: string) {
    const data = await request<{
        accessToken: string;
        refreshToken: string;
        user: User;
    }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
    });
    setTokens(data.accessToken, data.refreshToken);

    return data;
}

export async function logout() {
    await request('/auth/logout', { method: 'POST' }).catch(() => {});
    clearTokens();
}

export async function getMe() {
    return request<User>('/auth/me');
}
