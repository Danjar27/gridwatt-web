import { useQuery } from '@tanstack/react-query';
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

const OrdersPage = () => {
    const i18n = useTranslations();
    const { user } = useAuthContext();
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'assigned':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
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

    // Admin/manager columns with technician column
    const adminColumns = useMemo<Array<ColumnDef<Order, any>>>(
        () => [
            {
                accessorKey: 'id',
                header: 'Order',
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">#{row.original.id}</div>
                        <div className="text-sm text-muted-foreground">{row.original.meterNumber}</div>
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
                        <div className="text-sm text-muted-foreground">{row.original.email}</div>
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
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                            <User className="h-4 w-4 text-muted-foreground" />
                            {row.original.technician.name} {row.original.technician.lastName}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                    ),
            },
            {
                accessorKey: 'issueDate',
                header: 'Date',
                cell: ({ row }) => (
                    <div className="text-sm text-muted-foreground">
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
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // For technician view, fall back to simpler rendering
    const orders = isTechnician ? myOrders : [];

    return (
        <Page id="orders" title={i18n('pages.orders.title')} subtitle={i18n('pages.orders.subtitle')}>
            <div className="space-y-6">
                <div className="flex flex-col s425:flex-row items-start s425:items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                        {!isTechnician && (
                            <>
                                <button
                                    className="rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                                    onClick={() => setShowOrderForm(true)}
                                    data-testid="create-order-btn"
                                >
                                    Create Order
                                </button>
                                <Link
                                    to="/orders/import"
                                    className="rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                                    data-testid="import-orders-btn"
                                >
                                    Import Orders
                                </Link>
                            </>
                        )}
                        <select
                            className="rounded-md border px-2 py-1 text-sm font-medium text-muted-foreground"
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
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-bold mb-4">Create Order</h2>
                        <OrderForm onSubmit={handleCreateOrder} />
                        <button className="mt-4 text-sm text-primary underline" onClick={() => setShowOrderForm(false)}>
                            Cancel
                        </button>
                        {creating && <div className="mt-2 text-sm text-muted-foreground">Creating order...</div>}
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
                            <div className="flex h-64 flex-col items-center justify-center rounded-lg border bg-card">
                                <p className="text-lg font-medium text-muted-foreground">No orders found</p>
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
                                                <tr key={order.id} className="border-b border-neutral-200">
                                                    <td className="px-6 py-4 text-sm">
                                                        <div className="font-medium">#{order.id}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {order.meterNumber}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div>
                                                            {order.firstName} {order.lastName}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
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
                                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                                        {new Date(order.issueDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <Link
                                                            to={`/orders/${order.id}`}
                                                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
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
                            orders={isTechnician ? orders : table.getRowModel().rows.map((r) => r.original)}
                            technicians={technicians}
                        />
                    ))}
            </div>
        </Page>
    );
};

export default OrdersPage;
