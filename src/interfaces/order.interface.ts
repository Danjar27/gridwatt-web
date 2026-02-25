import type { User } from '@interfaces/user.interface.ts';

import type { Job } from '@interfaces/job.interface.ts';

export interface Order {
    id: number;
    technicianId?: number;
    serviceType: string;
    meterNumber: string;
    status: string;
    issueDate: string;
    issueTime: string;
    accountNumber: string;
    lastName: string;
    firstName: string;
    idNumber: string;
    email: string;
    phone: string;
    orderLocation: string;
    latitude?: number;
    longitude?: number;
    observations?: string;
    technician?: User;
    jobs?: Array<Job>;
}
export interface OrderImportData {
    serviceType: string;
    meterNumber: string;
    orderStatus: string;
    issueDate: string;
    issueTime: string;
    accountNumber: string;
    lastName: string;
    firstName: string;
    idNumber: string;
    email: string;
    phone: string;
    orderLocation: string;
    panelTowerBlock?: string;
    coordinateX?: number;
    coordinateY?: number;
    latitude?: number;
    longitude?: number;
    appliedTariff?: string;
    transformerNumber?: string;
    distributionNetwork?: string;
    transformerOwnership?: string;
    sharedSubstation?: string;
    normalLoad?: string;
    fluctuatingLoad?: string;
    plannerGroup?: string;
    workPosition?: string;
    lockerSequence?: string;
    observations?: string;
    technicianId?: number;
}

export interface OrderImportPreviewItem {
    data: OrderImportData;
    fileName: string;
    rowNumber?: number;
    errors?: Array<string>;
    warnings?: Array<string>;
}

export interface OrdersImportPreviewResponse {
    orders: Array<OrderImportPreviewItem>;
    fileErrors: Array<{ fileName: string; message: string }>;
}

export interface OrdersImportCommitResponse {
    createdCount: number;
}
