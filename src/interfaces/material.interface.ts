export interface Stock {
    id: string;
    availableQuantity: number;
    minimumStock: number;
}

export interface Material {
    id: string;
    name: string;
    unit: string;
    totalStock?: number;
}
export interface WorkMaterial {
    id: string;
    jobId: number;
    materialId: string;
    quantity: number;
    material?: Material;
}
