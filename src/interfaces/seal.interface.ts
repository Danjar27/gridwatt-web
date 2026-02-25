export interface Seal {
    id: string;
    name: string;
    description?: string;
    type: string;
    isActive: boolean;
}

export interface JobSeal {
    id: string;
    jobId: number;
    sealId: string;
    seal?: Seal;
}
