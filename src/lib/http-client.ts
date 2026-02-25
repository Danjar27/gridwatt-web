import { addOfflineMutation, isOnline, type MutationType } from './offline-store';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Detect network errors across browsers:
 * - Chrome: "Failed to fetch"
 * - Safari/iOS: "Load failed" / "The network connection was lost."
 * - Firefox: "NetworkError when attempting to fetch resource."
 */
export function isNetworkError(error: unknown): boolean {
    if (!(error instanceof TypeError)) {
        return false;
    }
    const msg = error.message.toLowerCase();

    return (
        msg.includes('failed to fetch') ||
        msg.includes('load failed') ||
        msg.includes('networkerror') ||
        msg.includes('network request failed') ||
        msg.includes('network connection was lost') ||
        msg.includes('cancelled')
    );
}

// ---------------------------------------------------------------------------
// Token store
// ---------------------------------------------------------------------------

const tokenStore = {
    accessToken: null as string | null,
    refreshToken: null as string | null,
};

export function setTokens(accessToken: string, refreshToken: string) {
    tokenStore.accessToken = accessToken;
    tokenStore.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
    tokenStore.accessToken = null;
    tokenStore.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

export function getAccessToken() {
    return tokenStore.accessToken;
}

export function loadTokens() {
    tokenStore.accessToken = localStorage.getItem('accessToken');
    tokenStore.refreshToken = localStorage.getItem('refreshToken');

    return !!tokenStore.refreshToken;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

export interface OfflineMutationOptions {
    type: MutationType;
    action: 'create' | 'update' | 'delete' | 'toggle-active';
    optimisticData?: unknown;
}

export interface PaginatedResponse<T> {
    data: Array<T>;
    total: number;
    limit: number;
    offset: number;
}

// ---------------------------------------------------------------------------
// Token refresh (singleton promise to avoid parallel refreshes)
// ---------------------------------------------------------------------------

let refreshingPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
    if (refreshingPromise) {
        return refreshingPromise;
    }

    refreshingPromise = (async () => {
        if (!tokenStore.refreshToken) {
            tokenStore.refreshToken = localStorage.getItem('refreshToken');
        }

        if (!tokenStore.refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokenStore.refreshToken}`,
                },
            });

            if (response.status === 401) {
                clearTokens();
                throw new Error('401: Unauthorized');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `Refresh failed: ${response.status}`);
            }

            const data = await response.json();
            setTokens(data.accessToken, data.refreshToken);

            return true;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            throw error;
        } finally {
            refreshingPromise = null;
        }
    })();

    return refreshingPromise;
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (!skipAuth && tokenStore.accessToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${tokenStore.accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    if (response.status === 401 && !skipAuth) {
        if (endpoint === '/auth/refresh') {
            clearTokens();
            throw new Error('401: Unauthorized');
        }

        // Try to refresh token
        try {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry original request
                const retryHeaders: HeadersInit = {
                    ...headers,
                    Authorization: `Bearer ${tokenStore.accessToken}`,
                };
                const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                    ...fetchOptions,
                    headers: retryHeaders,
                });
                if (!retryResponse.ok) {
                    const error = await retryResponse.json().catch(() => ({}));
                    const message = error.message || `${retryResponse.status}: ${retryResponse.statusText}`;
                    if (retryResponse.status === 401) {
                        clearTokens();
                        throw new Error(`401: ${message}`);
                    }
                    throw new Error(message);
                }

                if (retryResponse.status === 204 || retryResponse.headers.get('content-length') === '0') {
                    return null as T;
                }

                return retryResponse.json();
            }
        } catch (error) {
            console.error('Failed to refresh access token (retry):', error);
            throw error;
        }

        throw new Error('401: Unauthorized');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `${response.status}: ${response.statusText}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as T;
    }

    return response.json();
}

// ---------------------------------------------------------------------------
// Offline-aware mutation wrapper
// ---------------------------------------------------------------------------

export async function mutationRequest<T>(
    endpoint: string,
    options: RequestOptions,
    offlineOptions: OfflineMutationOptions
): Promise<T> {
    const online = isOnline();

    if (!online) {
        await addOfflineMutation({
            type: offlineOptions.type,
            action: offlineOptions.action,
            data: options.body ? JSON.parse(options.body as string) : null,
            endpoint,
            method: options.method || 'POST',
            optimisticData: offlineOptions.optimisticData,
        });

        return (offlineOptions.optimisticData || {}) as T;
    }

    try {
        return await request<T>(endpoint, options);
    } catch (error) {
        if (isNetworkError(error)) {
            await addOfflineMutation({
                type: offlineOptions.type,
                action: offlineOptions.action,
                data: options.body ? JSON.parse(options.body as string) : null,
                endpoint,
                method: options.method || 'POST',
                optimisticData: offlineOptions.optimisticData,
            });

            return (offlineOptions.optimisticData || {}) as T;
        }

        throw error;
    }
}

// Public alias used by sync-manager
export async function executeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return request<T>(endpoint, options);
}

// ---------------------------------------------------------------------------
// File upload helper
// ---------------------------------------------------------------------------

export async function uploadFile<T = unknown>(endpoint: string, formData: FormData): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Upload failed');
    }

    return response.json();
}
