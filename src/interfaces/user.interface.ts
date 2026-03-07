import type { Tenant } from '@interfaces/tenant.interface.ts';

export type Role = 'admin' | 'technician' | 'manager';

export interface TechnicianStats {
    id: number;
    name: string;
    lastName: string;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    materialAvailable: number;
    materialUsed: number;
    sealsAssigned: number;
    sealsUsed: number;
}

export interface User {
    id: number;
    name: string;
    lastName: string;
    email: string;
    phone?: string;
    isActive?: boolean;
    role: {
        id: number;
        name: Role;
    };
    roleId: number;
    password?: string;
    tenantId?: number;
    tenant: Tenant;
}
