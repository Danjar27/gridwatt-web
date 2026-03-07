import type { Tenant } from '@interfaces/tenant.interface.ts';

export type Role = 'admin' | 'technician' | 'manager' | 'consultant';

export interface TechnicianMaterialStats {
    id: string;
    name: string;
    unit: string;
    available: number;
    used: number;
}

export interface TechnicianStats {
    id: number;
    name: string;
    lastName: string;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    materials: Array<TechnicianMaterialStats>;
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
