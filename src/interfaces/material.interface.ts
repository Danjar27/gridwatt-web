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

export interface AssignedMaterial extends Material {
    assignedQuantity: number;
}

export interface WorkMaterial {
    id: number;
    jobId: number;
    quantity: number;
    material?: Material;
}

export interface MaterialStats {
    id: string;
    name: string;
    unit: string;
    totalIngressed: number;
    available: number;
    operational: number;
}
