export interface Activity {
    id: string;
    name: string;
    contractPrice?: number;
    technicianPrice?: number;
}

export interface JobActivity {
    id: number;
    jobId: number;
    activity: Activity;
}
