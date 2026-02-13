import { addOfflineMutation, isOnline, type MutationType } from './offline-store';
import type { Role } from '@interfaces/user.interface.ts';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
}

interface OfflineMutationOptions {
    type: MutationType;
    action: 'create' | 'update' | 'delete' | 'toggle-active';
    optimisticData?: unknown;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
}

class ApiClient {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    setTokens(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    getAccessToken() {
        return this.accessToken;
    }

    loadTokens() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');

        return !!this.refreshToken;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { skipAuth = false, ...fetchOptions } = options;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (!skipAuth && this.accessToken) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        if (response.status === 401 && !skipAuth) {
            if (endpoint === '/auth/refresh') {
                this.clearTokens();
                throw new Error('401: Unauthorized');
            }

            // Try to refresh token
            try {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry original request
                    const retryHeaders: HeadersInit = {
                        ...headers,
                        Authorization: `Bearer ${this.accessToken}`,
                    };
                    const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                        ...fetchOptions,
                        headers: retryHeaders,
                    });
                    if (!retryResponse.ok) {
                        const error = await retryResponse.json().catch(() => ({}));
                        const message = error.message || `${retryResponse.status}: ${retryResponse.statusText}`;
                        if (retryResponse.status === 401) {
                            this.clearTokens();
                            throw new Error(`401: ${message}`);
                        }
                        throw new Error(message);
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

        return response.json();
    }

    private refreshingPromise: Promise<boolean> | null = null;

    private async refreshAccessToken(): Promise<boolean> {
        if (this.refreshingPromise) {
            return this.refreshingPromise;
        }

        this.refreshingPromise = (async () => {
            if (!this.refreshToken) {
                this.refreshToken = localStorage.getItem('refreshToken');
            }

            if (!this.refreshToken) {
                return false;
            }

            try {
                const response = await fetch(`${API_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.refreshToken}`,
                    },
                });

                if (response.status === 401) {
                    this.clearTokens();
                    throw new Error('401: Unauthorized');
                }

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.message || `Refresh failed: ${response.status}`);
                }

                const data = await response.json();
                this.setTokens(data.accessToken, data.refreshToken);

                return true;
            } catch (error) {
                console.error('Failed to refresh access token:', error);
                throw error;
            } finally {
                this.refreshingPromise = null;
            }
        })();

        return this.refreshingPromise;
    }

    /**
     * Wrapper for mutation requests that handles offline scenarios.
     * When offline or network fails, stores the mutation in IndexedDB and returns optimistic data.
     */
    private async mutationRequest<T>(
        endpoint: string,
        options: RequestOptions,
        offlineOptions: OfflineMutationOptions
    ): Promise<T> {
        const online = isOnline();

        // If offline, store mutation immediately and return optimistic data
        if (!online) {
            await addOfflineMutation({
                type: offlineOptions.type,
                action: offlineOptions.action,
                data: options.body ? JSON.parse(options.body as string) : null,
                endpoint: `${API_URL}${endpoint}`,
                method: options.method || 'POST',
                optimisticData: offlineOptions.optimisticData,
            });

            // Return optimistic data for UI update
            return (offlineOptions.optimisticData || {}) as T;
        }

        // Try the request when online
        try {
            return await this.request<T>(endpoint, options);
        } catch (error) {
            // Check if it's a network error (Failed to fetch)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Store mutation for later sync
                await addOfflineMutation({
                    type: offlineOptions.type,
                    action: offlineOptions.action,
                    data: options.body ? JSON.parse(options.body as string) : null,
                    endpoint: `${API_URL}${endpoint}`,
                    method: options.method || 'POST',
                    optimisticData: offlineOptions.optimisticData,
                });

                // Return optimistic data for UI update
                return (offlineOptions.optimisticData || {}) as T;
            }

            // Re-throw other errors (validation, auth, etc.)
            throw error;
        }
    }

    // Auth
    async login(email: string, password: string) {
        const data = await this.request<{
            accessToken: string;
            refreshToken: string;
            user: User;
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true,
        });
        this.setTokens(data.accessToken, data.refreshToken);

        return data;
    }

    async logout() {
        await this.request('/auth/logout', { method: 'POST' }).catch(() => {});
        this.clearTokens();
    }

    async getMe() {
        return this.request<User>('/auth/me');
    }

    // Users
    async getUsers(params?: { limit?: number; offset?: number }) {
        const qs = params ? `?limit=${params.limit ?? 10}&offset=${params.offset ?? 0}` : '';
        return this.request<PaginatedResponse<User>>(`/users${qs}`);
    }

    async getRoles() {
        return this.request<Array<{ id: number; name: string }>>('/users/roles');
    }

    async createUser(data: Partial<User> & { password?: string; roleId: number }) {
        const optimisticData: User = {
            id: data.id || -Date.now(),
            name: data.name || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone,
            roleId: data.roleId,
            isActive: data.isActive ?? true,
        };

        return this.mutationRequest<User>(
            '/users',
            { method: 'POST', body: JSON.stringify(data) },
            { type: 'user', action: 'create', optimisticData }
        );
    }

    async updateUser(id: number, data: Partial<User> & { password?: string; roleId?: number }) {
        const optimisticData: User = {
            id,
            name: data.name || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone,
            roleId: data.roleId || 0,
            isActive: data.isActive,
        };

        return this.mutationRequest<User>(
            `/users/${id}`,
            { method: 'PUT', body: JSON.stringify(data) },
            { type: 'user', action: 'update', optimisticData }
        );
    }

    async getTechnicians() {
        return this.request<Array<User>>('/users/technicians');
    }

    async getProfile() {
        return this.request<User>('/users/profile');
    }

    async updateProfile(data: Partial<User>) {
        return this.request<User>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Orders
    async getOrders(params?: { limit?: number; offset?: number }) {
        const qs = params ? `?limit=${params.limit ?? 10}&offset=${params.offset ?? 0}` : '';
        return this.request<PaginatedResponse<Order>>(`/orders${qs}`);
    }

    async getMyOrders() {
        return this.request<Array<Order>>('/orders/my');
    }

    async getOrder(id: number) {
        return this.request<Order>(`/orders/${id}`);
    }

    async createOrder(data: Partial<Order>) {
        return this.request<Order>('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateOrder(id: number, data: Partial<Order>) {
        return this.request<Order>(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async assignOrder(id: number, technicianId: number | null) {
        return this.request<Order>(`/orders/${id}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ technicianId }),
        });
    }

    // Jobs
    async getJobs(params?: { limit?: number; offset?: number }) {
        const qs = params ? `?limit=${params.limit ?? 10}&offset=${params.offset ?? 0}` : '';
        return this.request<PaginatedResponse<Job>>(`/jobs${qs}`);
    }

    async getMyJobs() {
        return this.request<Array<Job>>('/jobs/my');
    }

    async getJob(id: number) {
        return this.request<Job>(`/jobs/${id}`);
    }

    async createJob(data: Partial<Job>) {
        return this.request<Job>('/jobs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateJob(id: number, data: Partial<Job>) {
        return this.request<Job>(`/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async markJobSynced(id: number) {
        return this.request<Job>(`/jobs/${id}/sync`, {
            method: 'PUT',
        });
    }

    async addJobMaterial(jobId: number, materialId: string, quantity: number) {
        return this.request(`/jobs/${jobId}/materials`, {
            method: 'POST',
            body: JSON.stringify({ materialId, quantity }),
        });
    }

    async addJobActivity(jobId: number, activityId: string) {
        return this.request(`/jobs/${jobId}/activities`, {
            method: 'POST',
            body: JSON.stringify({ activityId }),
        });
    }

    async addJobSeal(jobId: number, sealId: string) {
        return this.request(`/jobs/${jobId}/seals`, {
            method: 'POST',
            body: JSON.stringify({ sealId }),
        });
    }

    async addJobPhoto(jobId: number, path: string, type: string, notes?: string) {
        return this.request(`/jobs/${jobId}/photos`, {
            method: 'POST',
            body: JSON.stringify({ path, type, notes }),
        });
    }

    // Materials
    async getMaterials(params?: { limit?: number; offset?: number }) {
        const qs = params ? `?limit=${params.limit ?? 10}&offset=${params.offset ?? 0}` : '';
        return this.request<PaginatedResponse<Material>>(`/materials${qs}`);
    }

    async createMaterial(data: Partial<Material>) {
        const optimisticData: Material = {
            id: data.id || `temp-${Date.now()}`,
            name: data.name || '',
            type: data.type || '',
            unit: data.unit || '',
            description: data.description,
            allowsDecimals: data.allowsDecimals ?? false,
            isActive: data.isActive ?? true,
        };

        return this.mutationRequest<Material>(
            '/materials',
            { method: 'POST', body: JSON.stringify(data) },
            { type: 'material', action: 'create', optimisticData }
        );
    }

    async updateMaterial(id: string, data: Partial<Material>) {
        const optimisticData: Material = {
            id,
            name: data.name || '',
            type: data.type || '',
            unit: data.unit || '',
            description: data.description,
            allowsDecimals: data.allowsDecimals ?? false,
            isActive: data.isActive ?? true,
        };

        return this.mutationRequest<Material>(
            `/materials/${id}`,
            { method: 'PUT', body: JSON.stringify(data) },
            { type: 'material', action: 'update', optimisticData }
        );
    }

    async toggleMaterialActive(id: string) {
        return this.mutationRequest<Material>(
            `/materials/${id}/toggle-active`,
            { method: 'PATCH' },
            { type: 'material', action: 'toggle-active', optimisticData: { id } }
        );
    }

    // Activities
    async getActivities(params?: { limit?: number; offset?: number }) {
        const qs = params ? `?limit=${params.limit ?? 10}&offset=${params.offset ?? 0}` : '';
        return this.request<PaginatedResponse<Activity>>(`/activities${qs}`);
    }

    async createActivity(data: Partial<Activity>) {
        const optimisticData: Activity = {
            id: data.id || `temp-${Date.now()}`,
            name: data.name || '',
            description: data.description,
            isActive: data.isActive ?? true,
        };

        return this.mutationRequest<Activity>(
            '/activities',
            { method: 'POST', body: JSON.stringify(data) },
            { type: 'activity', action: 'create', optimisticData }
        );
    }

    async updateActivity(id: string, data: Partial<Activity>) {
        const optimisticData: Activity = {
            id,
            name: data.name || '',
            description: data.description,
            isActive: data.isActive ?? true,
        };

        return this.mutationRequest<Activity>(
            `/activities/${id}`,
            { method: 'PUT', body: JSON.stringify(data) },
            { type: 'activity', action: 'update', optimisticData }
        );
    }

    async toggleActivityActive(id: string) {
        return this.mutationRequest<Activity>(
            `/activities/${id}/toggle-active`,
            { method: 'PATCH' },
            { type: 'activity', action: 'toggle-active', optimisticData: { id } }
        );
    }

    // Seals
    async getSeals(params?: { limit?: number; offset?: number }) {
        const qs = params ? `?limit=${params.limit ?? 10}&offset=${params.offset ?? 0}` : '';
        return this.request<PaginatedResponse<Seal>>(`/seals${qs}`);
    }

    async createSeal(data: Partial<Seal>) {
        const optimisticData: Seal = {
            id: data.id || `temp-${Date.now()}`,
            name: data.name || '',
            type: data.type || '',
            description: data.description,
            isActive: data.isActive ?? true,
        };

        return this.mutationRequest<Seal>(
            '/seals',
            { method: 'POST', body: JSON.stringify(data) },
            { type: 'seal', action: 'create', optimisticData }
        );
    }

    async updateSeal(id: string, data: Partial<Seal>) {
        const optimisticData: Seal = {
            id,
            name: data.name || '',
            type: data.type || '',
            description: data.description,
            isActive: data.isActive ?? true,
        };

        return this.mutationRequest<Seal>(
            `/seals/${id}`,
            { method: 'PUT', body: JSON.stringify(data) },
            { type: 'seal', action: 'update', optimisticData }
        );
    }

    async toggleSealActive(id: string) {
        return this.mutationRequest<Seal>(
            `/seals/${id}/toggle-active`,
            { method: 'PATCH' },
            { type: 'seal', action: 'toggle-active', optimisticData: { id } }
        );
    }

    // Users (additional operations)
    async deleteUser(id: number) {
        return this.mutationRequest(
            `/users/${id}`,
            { method: 'DELETE' },
            { type: 'user', action: 'delete', optimisticData: { id } }
        );
    }

    // Upload
    async uploadFile(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        return response.json();
    }

    // Orders import
    async previewOrdersImport(files: Array<File>) {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));

        const response = await fetch(`${API_URL}/orders/import/preview`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Preview import failed');
        }

        return response.json();
    }

    async commitOrdersImport(orders: Array<OrderImportData>) {
        return this.request<OrdersImportCommitResponse>('/orders/import/commit', {
            method: 'POST',
            body: JSON.stringify({ orders }),
        });
    }
}

export const apiClient = new ApiClient();

// Types
export interface User {
    id: number;
    name: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive?: boolean;
    role: { id: number; name: Role };
}

export interface Order {
    id: number;
    technicianId?: number;
    serviceType: string;
    meterNumber: string;
    orderStatus: string;
    issueDate: string;
    issueTime: string;
    accountNumber: string;
    lastName: string;
    firstName: string;
    idNumber: string;
    email: string;
    phone: string;
    orderLocation: string;
    latitude?: number;
    longitude?: number;
    observations?: string;
    technician?: User;
    jobs?: Array<Job>;
}

export interface OrderImportData {
    serviceType: string;
    meterNumber: string;
    orderStatus: string;
    issueDate: string;
    issueTime: string;
    accountNumber: string;
    lastName: string;
    firstName: string;
    idNumber: string;
    email: string;
    phone: string;
    orderLocation: string;
    panelTowerBlock?: string;
    coordinateX?: number;
    coordinateY?: number;
    latitude?: number;
    longitude?: number;
    appliedTariff?: string;
    transformerNumber?: string;
    distributionNetwork?: string;
    transformerOwnership?: string;
    sharedSubstation?: string;
    normalLoad?: string;
    fluctuatingLoad?: string;
    plannerGroup?: string;
    workPosition?: string;
    lockerSequence?: string;
    observations?: string;
    technicianId?: number;
}

export interface OrderImportPreviewItem {
    data: OrderImportData;
    fileName: string;
    rowNumber?: number;
    errors?: Array<string>;
    warnings?: Array<string>;
}

export interface OrdersImportPreviewResponse {
    orders: Array<OrderImportPreviewItem>;
    fileErrors: Array<{ fileName: string; message: string }>;
}

export interface OrdersImportCommitResponse {
    createdCount: number;
}

export interface Job {
    id: number;
    orderId: number;
    technicianId: number;
    startDateTime: string;
    endDateTime?: string;
    jobType: string;
    jobStatus?: string;
    gpsLocation?: string;
    meterReading?: string;
    notes?: string;
    synchronized: boolean;
    order?: Order;
    technician?: User;
    photos?: Array<Photo>;
    workMaterials?: Array<WorkMaterial>;
    jobActivities?: Array<JobActivity>;
    jobSeals?: Array<JobSeal>;
}

export interface Photo {
    id: string;
    jobId: number;
    path: string;
    type: string;
    dateTime: string;
    notes?: string;
}

export interface Material {
    id: string;
    name: string;
    type: string;
    description?: string;
    unit: string;
    allowsDecimals: boolean;
    isActive: boolean;
}

export interface Activity {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface Seal {
    id: string;
    name: string;
    description?: string;
    type: string;
    isActive: boolean;
}

export interface WorkMaterial {
    id: string;
    jobId: number;
    materialId: string;
    quantity: number;
    material?: Material;
}

export interface JobActivity {
    id: string;
    jobId: number;
    activityId: string;
    activity?: Activity;
}

export interface JobSeal {
    id: string;
    jobId: number;
    sealId: string;
    seal?: Seal;
}
