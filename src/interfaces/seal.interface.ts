export interface Seal {
    id: number;
    type: string;
}

export interface JobSeal {
    id: number;
    jobId: number;
    seal: Seal;
}
