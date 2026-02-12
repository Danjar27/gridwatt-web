import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Eye, MapPin, User, ClipboardList } from 'lucide-react';
import { useAuthContext } from '@context/auth/context.ts';
import { OrderForm } from '@/components/orders/OrderForm';
import { OrdersMap } from '@/components/orders/OrdersMap';
import { useState } from 'react';
import Page from '@layouts/Page.tsx';
import { useTranslations } from 'use-intl';
import Summary from '@components/Summary/Summary.tsx';
import Table from '@components/Table/Table.tsx';
import Row from '@components/Table/blocks/Row.tsx';

const OrdersPage = () => {
    const i18n = useTranslations();
    const { user } = useAuthContext();
    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders', isTechnician ? 'my' : 'all'],
        queryFn: () => (isTechnician ? apiClient.getMyOrders() : apiClient.getOrders()),
    });

    // For technician assignment legend
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

    // UI state
    const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Handle order creation
    const handleCreateOrder = async (data: any) => {
        setCreating(true);
        setError(null);
        setSuccess(null);
        try {
            // TODO: Add offline queue logic here
            await apiClient.createOrder(data);
            setSuccess('Order created successfully!');
            setShowOrderForm(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to create order');
        } finally {
            setCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    const tableColumns = isTechnician
        ? ['Order', 'Customer', 'Service', 'Status', 'Date', 'Actions']
        : ['Order', 'Customer', 'Service', 'Status', 'Technician', 'Date', 'Actions'];

    return (
        <Page id="orders" title={i18n('pages.orders.title')} subtitle={i18n('pages.orders.subtitle')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
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
                        orders.length === 0 ? (
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
                                <Table columns={tableColumns}>
                                    {orders.map((order) => (
                                        <Row key={order.id}>
                                            <div>
                                                <div className="font-medium">#{order.id}</div>
                                                <div className="text-sm text-muted-foreground">{order.meterNumber}</div>
                                            </div>
                                            <div>
                                                <div>
                                                    {order.firstName} {order.lastName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{order.email}</div>
                                            </div>
                                            <div>
                                                <div>{order.serviceType}</div>
                                                {order.latitude && order.longitude && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        Has location
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                                                >
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            {!isTechnician && (
                                                <div>
                                                    {order.technician ? (
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            {order.technician.name} {order.technician.lastName}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Unassigned</span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(order.issueDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-right">
                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Link>
                                            </div>
                                        </Row>
                                    ))}
                                </Table>
                            </Summary>
                        )
                    ) : (
                        <OrdersMap orders={orders} technicians={technicians} />
                    ))}
            </div>
        </Page>
    );
};

export default OrdersPage;