import type { User } from './user.interface.ts';

export interface AreaCoordinate {
    lat: number;
    lng: number;
}

export interface MapArea {
    id: number;
    color: string;
    coordinates: Array<AreaCoordinate>;
    technicianId?: number | null;
    technician?: Pick<User, 'id' | 'name' | 'lastName'> | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAreaPayload {
    coordinates: Array<AreaCoordinate>;
    technicianId?: number | null;
}

export interface UpdateAreaPayload {
    coordinates?: Array<AreaCoordinate>;
    technicianId?: number | null;
}
