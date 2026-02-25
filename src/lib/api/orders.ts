import type { Order, OrderImportData, OrdersImportCommitResponse } from '@interfaces/order.interface.ts';
import { request, mutationRequest, uploadFile, type PaginatedResponse } from '../http-client';

export async function getOrders(params?: {
    limit?: number;
    offset?: number;
    from?: string;
    to?: string;
    technicianId?: number;
}) {
    const qs = params
        ? `?${new URLSearchParams(
              Object.entries(params)
                  .filter(([, v]) => v !== null)
                  .map(([k, v]) => [k, String(v)])
          ).toString()}`
        : '';

    return request<PaginatedResponse<Order>>(`/orders${qs}`);
}

export async function getMyOrders() {
    return request<Array<Order>>('/orders/my');
}

export async function getOrder(id: number) {
    return request<Order>(`/orders/${id}`);
}

export async function createOrder(data: Partial<Order>) {
    return mutationRequest<Order>(
        '/orders',
        { method: 'POST', body: JSON.stringify(data) },
        { type: 'order', action: 'create', optimisticData: { id: -Date.now(), ...data } }
    );
}

export async function updateOrder(id: number, data: Partial<Order>) {
    return mutationRequest<Order>(
        `/orders/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
        { type: 'order', action: 'update', optimisticData: { id, ...data } }
    );
}

export async function assignOrder(id: number, technicianId: number | null) {
    return mutationRequest<Order>(
        `/orders/${id}/assign`,
        { method: 'PUT', body: JSON.stringify({ technicianId }) },
        { type: 'order', action: 'update', optimisticData: { id, technicianId } }
    );
}

export async function bulkAssignOrders(orderIds: Array<number>, technicianId: number) {
    return mutationRequest<Array<Order>>(
        '/orders/bulk-assign',
        { method: 'PUT', body: JSON.stringify({ orderIds, technicianId }) },
        { type: 'order', action: 'update', optimisticData: orderIds.map((id) => ({ id, technicianId })) }
    );
}

export async function previewOrdersImport(files: Array<File>) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    return uploadFile('/orders/import/preview', formData);
}

export async function commitOrdersImport(orders: Array<OrderImportData>) {
    return request<OrdersImportCommitResponse>('/orders/import/commit', {
        method: 'POST',
        body: JSON.stringify({ orders }),
    });
}
