import type { Job } from '@interfaces/job.interface.ts';

export interface Order {
    id: string;
    technicianId?: number;
    type: string;
    status: string;
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
    createdAt?: string;
    updatedAt?: string;
    technician?: { id: number; name: string; lastName: string };
    job?: Job;
}

/** Lightweight projection used by the map — avoids fetching the full order payload */
export interface OrderMapPoint {
    id: string;
    coordinateX?: number | null;
    coordinateY?: number | null;
    technicianId?: number | null;
    technician?: { id: number; name: string; lastName: string } | null;
    clientName: string;
    clientLastName?: string | null;
    clientId: string;
    type: string;
    address: string;
    clientAccount: string;
    meterId?: string | null;
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
    skippedCount: number;
}

export interface TechnicianOrderStats {
    technicianId: number;
    name: string;
    lastName: string;
    assigned: number;
    resolved: number;
}

export interface OrderStats {
    total: number;
    completed: number;
    byTechnician: Array<TechnicianOrderStats>;
}
