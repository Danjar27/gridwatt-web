export interface Material {
    id: string;
    name: string;
    type: string;
    description?: string;
    unit: string;
    allowsDecimals: boolean;
    isActive?: boolean;
}
export interface WorkMaterial {
    id: string;
    jobId: number;
    materialId: string;
    quantity: number;
    material?: Material;
}
