export interface Seal {
    id: number;
    type: string;
}

export interface AssignedSeal extends Seal {
    fromNumber: number;
    toNumber: number;
}

export interface JobSeal {
    id: number;
    jobId: number;
    seal: Seal;
}
