import type { User } from '@interfaces/user.interface.ts';

import type { Job } from '@interfaces/job.interface.ts';

export interface Order {
    id: string;
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
    panelTowerBlock?: string;
    coordinateX?: number;
    coordinateY?: number;
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
    technician?: User;
    jobs?: Array<Job>;
}
export interface OrderImportData {
    id: string;
    type: string;
    orderStatus: string;
    issueDate: string;
    clientAccount: string;
    clientName: string;
    clientLastName?: string;
    clientId: string;
    clientPhone?: string;
    clientEmail?: string;
    address: string;
    addressReference?: string;
    zone?: string;
    sector?: string;
    parish?: string;
    neighborhood?: string;
    building?: string;
    urbanization?: string;
    canton?: string;
    province?: string;
    coordinateX?: number;
    coordinateY?: number;
    appliedTariff?: string;
    verifiedTariff?: string;
    transformerNumber?: string;
    transformerProperty?: string;
    meterId?: string;
    meterType?: string;
    observations?: string;
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
