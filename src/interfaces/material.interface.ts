export interface Material {
    id: string;
    name: string;
    unit: string;
}
export interface WorkMaterial {
    id: string;
    jobId: number;
    materialId: string;
    quantity: number;
    material?: Material;
}
