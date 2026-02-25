import type { AuthData, Tokens } from '@interfaces/auth.interface.ts';
import type { User } from '@interfaces/user.interface.ts';

import { request } from '../http-client';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export const getTokens = (): Tokens | null => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!accessToken || !refreshToken) {
        console.error('User is not authenticated. Access token or refresh token is missing.');

        return null;
    }

    return { accessToken, refreshToken };
};

export const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

async function doRefresh(): Promise<boolean> {
    const tokens = getTokens();

    if (!tokens?.refreshToken) {
        return false;
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.refreshToken}`,
        },
    });

    if (response.status === 401) {
        clearTokens();
        throw new Error('401: Unauthorized');
    }

    if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);

    return true;
}

let pendingRefresh: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
    if (pendingRefresh) {
        return pendingRefresh;
    }

    pendingRefresh = doRefresh()
        .catch((error) => {
            console.error('Failed to refresh access token:', error);
            throw error;
        })
        .finally(() => {
            pendingRefresh = null;
        });

    return pendingRefresh;
}

export const login = async (email: string, password: string) => {
    const data = await request<AuthData>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
    });

    setTokens(data.accessToken, data.refreshToken);

    return data;
};

export const logout = async () => {
    await request('/auth/logout', { method: 'POST' }).catch(() => {});
    clearTokens();
};

export const getMe = async () => request<User>('/auth/me');
