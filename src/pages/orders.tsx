import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Eye, MapPin, User } from 'lucide-react';
import { useAuthContext } from '@context/auth/context.ts';

export function OrdersPage() {
    const { user } = useAuthContext();
    const userRole = user?.role?.name || user?.roleName;
    const isTechnician = userRole === 'technician';

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders', isTechnician ? 'my' : 'all'],
        queryFn: () => (isTechnician ? apiClient.getMyOrders() : apiClient.getOrders()),
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

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-muted-foreground">
                        {isTechnician ? 'Your assigned orders' : 'Manage all orders'}
                    </p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border bg-card">
                    <p className="text-lg font-medium text-muted-foreground">No orders found</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                    <table className="w-full">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Service</th>
                                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                {!isTechnician && (
                                    <th className="px-4 py-3 text-left text-sm font-medium">Technician</th>
                                )}
                                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">#{order.id}</div>
                                        <div className="text-sm text-muted-foreground">{order.meterNumber}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            {order.firstName} {order.lastName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{order.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>{order.serviceType}</div>
                                        {order.latitude && order.longitude && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                Has location
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                                        >
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    {!isTechnician && (
                                        <td className="px-4 py-3">
                                            {order.technician ? (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {order.technician.name} {order.technician.lastName}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Unassigned</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {new Date(order.issueDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
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
            )}
        </div>
    );
}
