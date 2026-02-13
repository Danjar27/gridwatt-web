import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient, type Order } from '@/lib/api-client';
import { Eye, MapPin, User, ClipboardList, BookA } from 'lucide-react';
import { useAuthContext } from '@context/auth/context.ts';
import { OrderForm } from '@/components/orders/OrderForm';
import { OrdersMap } from '@/components/orders/OrdersMap';
import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useServerPagination } from '@components/Table/hooks/useServerPagination';
import Page from '@layouts/Page.tsx';
import { useTranslations } from 'use-intl';
import Summary from '@components/Summary/Summary.tsx';
import Table from '@components/Table/Table.tsx';
import { INPUT_CLASS } from '@components/Form/utils/constants';

const OrdersPage = () => {
    const i18n = useTranslations();
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';

    // Technician view stays non-paginated
    const { data: myOrders = [], isLoading: myLoading } = useQuery({
        queryKey: ['orders', 'my'],
        queryFn: () => apiClient.getMyOrders(),
        enabled: isTechnician,
    });

    const { data: technicians = [] } = useQuery({
        queryKey: ['technicians'],
        queryFn: () => apiClient.getTechnicians(),
        enabled: !isTechnician,
    });

    // Fetch all orders for map view (high limit to get all)
    const { data: allOrdersResponse } = useQuery({
        queryKey: ['orders', 'all-map'],
        queryFn: () => apiClient.getOrders({ limit: 10000, offset: 0 }),
        enabled: !isTechnician,
    });
    const allOrders = allOrdersResponse?.data || [];

    const bulkAssignMutation = useMutation({
        mutationFn: ({ orderIds, technicianId }: { orderIds: number[]; technicianId: number }) =>
            apiClient.bulkAssignOrders(orderIds, technicianId),
        onMutate: async ({ orderIds, technicianId }) => {
            // Cancel outgoing refetches so they don't overwrite optimistic update
            await queryClient.cancelQueries({ queryKey: ['orders', 'all-map'] });

            // Snapshot previous value for rollback
            const previous = queryClient.getQueryData<{ data: Order[] }>(['orders', 'all-map']);

            // Find the technician object for the optimistic update
            const tech = technicians.find((t) => t.id === technicianId);

            // Optimistically update the map cache
            queryClient.setQueryData<{ data: Order[] } | undefined>(['orders', 'all-map'], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((order) =>
                        orderIds.includes(order.id)
                            ? {
                                  ...order,
                                  technicianId,
                                  technician: tech ? { id: tech.id, name: tech.name, lastName: tech.lastName } : order.technician,
                              }
                            : order
                    ),
                };
            });

            return { previous };
        },
        onError: (_err, _vars, context) => {
            // Rollback on error
            if (context?.previous) {
                queryClient.setQueryData(['orders', 'all-map'], context.previous);
            }
        },
        onSettled: () => {
            // Refetch to ensure server state after mutation completes
            queryClient.invalidateQueries({ queryKey: ['orders', 'all-map'] });
            queryClient.invalidateQueries({ queryKey: ['orders', 'all'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-success-500/20 text-success-500';
            case 'in_progress':
                return 'bg-primary-500/20 text-primary-500';
            case 'assigned':
                return 'bg-primary-500/20 text-primary-500';
            default:
                return 'bg-secondary-500/20 text-secondary-500';
        }
    };

    const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleCreateOrder = async (data: any) => {
        setCreating(true);
        setError(null);
        setSuccess(null);
        try {
            await apiClient.createOrder(data);
            setSuccess('Order created successfully!');
            setShowOrderForm(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to create order');
        } finally {
            setCreating(false);
        }
    };

    const handleBulkAssign = (orderIds: number[], technicianId: number) => {
        bulkAssignMutation.mutate({ orderIds, technicianId });
    };

    // Admin/manager columns with technician column
    const adminColumns = useMemo<Array<ColumnDef<Order, any>>>(
        () => [
            {
                accessorKey: 'id',
                header: 'Order',
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">#{row.original.id}</div>
                        <div className="text-sm text-neutral-900">{row.original.meterNumber}</div>
                    </div>
                ),
            },
            {
                id: 'customer',
                header: 'Customer',
                cell: ({ row }) => (
                    <div>
                        <div>
                            {row.original.firstName} {row.original.lastName}
                        </div>
                        <div className="text-sm text-neutral-900">{row.original.email}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'serviceType',
                header: 'Service',
                cell: ({ row }) => (
                    <div>
                        <div>{row.original.serviceType}</div>
                        {row.original.latitude && row.original.longitude && (
                            <div className="flex items-center gap-1 text-sm text-neutral-900">
                                <MapPin className="h-3 w-3" />
                                Has location
                            </div>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'orderStatus',
                header: 'Status',
                cell: ({ row }) => (
                    <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(row.original.orderStatus)}`}
                    >
                        {row.original.orderStatus}
                    </span>
                ),
            },
            {
                id: 'technician',
                header: 'Technician',
                cell: ({ row }) =>
                    row.original.technician ? (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-neutral-900" />
                            {row.original.technician.name} {row.original.technician.lastName}
                        </div>
                    ) : (
                        <span className="text-neutral-900">Unassigned</span>
                    ),
            },
            {
                accessorKey: 'issueDate',
                header: 'Date',
                cell: ({ row }) => (
                    <div className="text-sm text-neutral-900">
                        {new Date(row.original.issueDate).toLocaleDateString()}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <Link
                        to={`/orders/${row.original.id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
                    >
                        <Eye className="h-4 w-4" />
                        View
                    </Link>
                ),
            },
        ],
        []
    );

    // Technician columns (no technician column)
    const techColumns = useMemo<Array<ColumnDef<Order, any>>>(
        () => adminColumns.filter((c) => c.id !== 'technician'),
        [adminColumns]
    );

    const {
        table,
        isLoading: paginatedLoading,
        total,
    } = useServerPagination<Order>({
        queryKey: ['orders', 'all'],
        fetchFn: (params) => apiClient.getOrders(params),
        columns: adminColumns,
        enabled: !isTechnician,
    });

    // For technician view, create a simple client-side table
    const techTable = useMemo(() => {
        if (!isTechnician) {
            return null;
        }

        // We use the raw react-table for client-side data
        return null;
    }, [isTechnician]);

    const isLoading = isTechnician ? myLoading : paginatedLoading;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    // For technician view, fall back to simpler rendering
    const orders = isTechnician ? myOrders : [];

    return (
        <Page id="orders" title={i18n('pages.orders.title')} subtitle={i18n('pages.orders.subtitle')}>
            <div className={`space-y-6 ${viewMode === 'map' ? 'flex flex-col flex-1 min-h-0' : ''}`}>
                <div className="flex flex-col s425:flex-row items-start s425:items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                        {!isTechnician && (
                            <>
                                <button
                                    className="rounded-md border border-primary-500 px-3 py-2 text-sm font-medium text-primary-500 transition hover:bg-primary-500/10"
                                    onClick={() => setShowOrderForm(true)}
                                    data-testid="create-order-btn"
                                >
                                    Create Order
                                </button>
                                <Link
                                    to="/orders/import"
                                    className="rounded-md border border-primary-500 px-3 py-2 text-sm font-medium text-primary-500 transition hover:bg-primary-500/10"
                                    data-testid="import-orders-btn"
                                >
                                    Import Orders
                                </Link>
                            </>
                        )}
                        <select
                            className={INPUT_CLASS}
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as 'table' | 'map')}
                            data-testid="view-mode-dropdown"
                        >
                            <option value="table">Table</option>
                            <option value="map">Map</option>
                        </select>
                    </div>
                </div>

                {showOrderForm && (
                    <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                        <h2 className="text-xl font-bold mb-4">Create Order</h2>
                        <OrderForm onSubmit={handleCreateOrder} />
                        <button className="mt-4 text-sm text-primary-500 underline" onClick={() => setShowOrderForm(false)}>
                            Cancel
                        </button>
                        {creating && <div className="mt-2 text-sm text-neutral-900">Creating order...</div>}
                        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
                        {success && <div className="mt-2 text-sm text-green-600">{success}</div>}
                    </div>
                )}

                {!showOrderForm &&
                    (viewMode === 'table' ? (
                        !isTechnician ? (
                            <Summary
                                icon={BookA}
                                title={i18n('pages.orders.summary.title')}
                                subtitle={i18n('pages.orders.summary.subtitle')}
                                legend={i18n('pages.orders.summary.total', { count: total })}
                            >
                                <Table table={table} isLoading={paginatedLoading} total={total} />
                            </Summary>
                        ) : orders.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-600/60">
                                <p className="text-lg font-medium text-neutral-900">No orders found</p>
                            </div>
                        ) : (
                            <Summary
                                icon={ClipboardList}
                                title={i18n('pages.orders.summary.title')}
                                subtitle={i18n('pages.orders.summary.subtitle')}
                                legend={i18n('pages.orders.summary.total', { count: orders.length })}
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                        <thead>
                                            <tr className="bg-neutral-600 rounded-md">
                                                {['Order', 'Customer', 'Service', 'Status', 'Date', 'Actions'].map(
                                                    (col) => (
                                                        <th
                                                            key={col}
                                                            className="px-6 py-3 text-left text-sm font-semibold"
                                                        >
                                                            {col}
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr key={order.id} className="border-b border-neutral-800">
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="font-medium">#{order.id}</div>
                                                        <div className="text-sm text-neutral-900">
                                                            {order.meterNumber}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div>
                                                            {order.firstName} {order.lastName}
                                                        </div>
                                                        <div className="text-sm text-neutral-900">
                                                            {order.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{order.serviceType}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                                                        >
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-neutral-900">
                                                        {new Date(order.issueDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <Link
                                                            to={`/orders/${order.id}`}
                                                            className="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Summary>
                        )
                    ) : (
                        <OrdersMap
                            orders={isTechnician ? orders : allOrders}
                            technicians={technicians}
                            onBulkAssign={handleBulkAssign}
                            isAssigning={bulkAssignMutation.isPending}
                        />
                    ))}
            </div>
        </Page>
    );
};

export default OrdersPage;
