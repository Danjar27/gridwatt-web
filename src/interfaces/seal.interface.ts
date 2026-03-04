export interface Seal {
    id: string;
    name: string;
    type: string;
}

export interface JobSeal {
    id: string;
    jobId: number;
    sealId: string;
    seal?: Seal;
}
