import type { Order, OrderImportData, OrdersImportCommitResponse, OrdersImportPreviewResponse } from '@interfaces/order.interface.ts';
import type { PaginatedQuery, PaginatedResponse } from '@interfaces/api.interface.ts';

import { buildQueryParameters } from '@utils/common/parameters.ts';
import { request, mutationRequest, uploadFile } from '../http-client';

export const getOrders = async (params?: PaginatedQuery & { technicianId?: number }) =>
    request<PaginatedResponse<Order>>(`/orders${buildQueryParameters(params)}`);

export const getMyOrders = async () =>
    request<Array<Order>>('/orders/my');

export const getOrder = async (id: string) =>
    request<Order>(`/orders/${id}`);

export const createOrder = async (data: Partial<Order>) =>
    mutationRequest<Order>(
        '/orders',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'order', action: 'create', optimisticData: { id: String(-Date.now()), ...data } }
    );

export const updateOrder = async (id: string, data: Partial<Order>) =>
    mutationRequest<Order>(
        `/orders/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'order', action: 'update', optimisticData: { id, ...data } }
    );

export const assignOrder = async (id: string, technicianId: number | null) =>
    mutationRequest<Order>(
        `/orders/${id}/assign`,
        { method: 'PUT', body: JSON.stringify({ technicianId }) },
        { type: 'order', action: 'update', optimisticData: { id, technicianId } }
    );

export const bulkAssignOrders = async (orderIds: Array<string>, technicianId: number) =>
    mutationRequest<Array<Order>>(
        '/orders/assign',
        { method: 'PUT', body: JSON.stringify({ orderIds, technicianId }) },
        { type: 'order', action: 'update', optimisticData: orderIds.map((id) => ({ id, technicianId })) }
    );

export const previewOrdersImport = async (files: Array<File>) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return uploadFile<OrdersImportPreviewResponse>('/orders/import/preview', formData);
};

const toCommitPayload = ({ issueTime: _t, coordinateX: _cx, coordinateY: _cy, technicianId: _tid, ...rest }: OrderImportData) => rest;

export const commitOrdersImport = async (orders: Array<OrderImportData>) =>
    request<OrdersImportCommitResponse>('/orders/import/commit', {
        method: 'POST',
        body: JSON.stringify({ orders: orders.map(toCommitPayload) }),
    });
