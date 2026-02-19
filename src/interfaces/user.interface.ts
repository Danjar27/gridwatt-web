export type Role = 'admin' | 'technician' | 'manager';

export interface Tenant {
    id: number;
    name: string;
    slug: string;
}