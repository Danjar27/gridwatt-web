export interface Tenant {
    id: number;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count: {
        users: number;
        orders: number;
        jobs: number;
        materials: number;
        activities: number;
        seals: number;
    };
}
