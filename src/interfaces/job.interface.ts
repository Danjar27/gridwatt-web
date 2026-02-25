import type { Order } from '@interfaces/order.interface.ts';
import type { User } from '@interfaces/user.interface.ts';
import type { WorkMaterial } from '@interfaces/material.interface.ts';
import type { JobActivity } from '@interfaces/activity.interface.ts';
import type { JobSeal } from '@interfaces/seal.interface.ts';
import type { Photo } from '@interfaces/photo.interface.ts';

export interface Job {
    id: number;
    orderId: number;
    technicianId: number;
    startDateTime: string;
    endDateTime?: string;
    jobType: string;
    jobStatus?: string;
    gpsLocation?: string;
    meterReading?: string;
    notes?: string;
    synchronized: boolean;
    order?: Order;
    technician?: User;
    photos?: Array<Photo>;
    workMaterials?: Array<WorkMaterial>;
    jobActivities?: Array<JobActivity>;
    jobSeals?: Array<JobSeal>;
    /** Client-side flag: true when changes are queued for sync */
    _pendingSync?: boolean;
}
