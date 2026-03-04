import type { MapArea, CreateAreaPayload, UpdateAreaPayload } from '@interfaces/area.interface.ts';
import { request } from '../http-client';

export const getAreas = async () => request<Array<MapArea>>('/areas');

export const createArea = async (data: CreateAreaPayload) =>
    request<MapArea>('/areas', { method: 'POST', body: JSON.stringify(data) });

export const updateArea = async (id: number, data: UpdateAreaPayload) =>
    request<MapArea>(`/areas/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteArea = async (id: number) =>
    request<void>(`/areas/${id}`, { method: 'DELETE' });
