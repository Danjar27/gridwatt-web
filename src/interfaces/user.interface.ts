import type { Tenant } from '@interfaces/tenant.interface.ts';

export type Role = 'admin' | 'technician' | 'manager';

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
    tenantId: number;
    tenant: Tenant;
}
