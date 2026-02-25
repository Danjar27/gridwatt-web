export interface Activity {
    id: string;
    name: string;
    description?: string;
}

export interface JobActivity {
    id: string;
    jobId: number;
    activityId: string;
    activity?: Activity;
}
