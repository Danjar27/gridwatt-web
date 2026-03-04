export interface Activity {
    id: string;
    name: string;
    contractPrice?: number;
    technicianPrice?: number;
}

export interface JobActivity {
    id: string;
    jobId: number;
    activityId: string;
    activity?: Activity;
}
