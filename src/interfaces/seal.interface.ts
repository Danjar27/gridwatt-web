export interface Seal {
    id: number;
    type: string;
}

export interface JobSeal {
    id: string;
    jobId: number;
    sealId: number;
    seal?: Seal;
}
