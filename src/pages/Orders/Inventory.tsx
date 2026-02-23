import { PlusCircleIcon, TruckIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useAuthContext } from '@context/auth/context.ts';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';
import { useMemo, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import { apiClient, type Order, type User } from '@lib/api-client.ts';
import { OrdersMap } from '@/components/orders/OrdersMap';
import { queryClient } from '@lib/query-client';
import { isOnline } from '@/lib/offline-store';

import TechnicianView from '@pages/Orders/tables/TechnicianView';
import AdminView from '@pages/Orders/tables/AdminView';
import Summary from '@components/Summary/Summary';
import Button from '@components/Button/Button';

const Inventory = () => {
    const i18n = useTranslations();

    const { user } = useAuthContext();
    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';

    const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
    const [filterTechnicianId, setFilterTechnicianId] = useState<number | null>(null);

    const { data: myOrders = [], isLoading: myLoading } = useQuery({
        queryKey: ['orders', 'my'],
        queryFn: () => apiClient.getMyOrders(),
        enabled: isTechnician,
    });

    const { data: technicianResponse } = useQuery({
        queryKey: ['technicians'],
        queryFn: () => apiClient.getTechnicians(),
        enabled: !isTechnician,
    });
    const technicians: Array<User> = Array.isArray(technicianResponse)
        ? technicianResponse
        : ((technicianResponse as any)?.data ?? []);

    const { data: allOrdersResponse } = useQuery({
        queryKey: ['orders', 'all-map', filterTechnicianId],
        queryFn: () =>
            apiClient.getOrders({
                limit: 10000,
                offset: 0,
                ...(filterTechnicianId ? { technicianId: filterTechnicianId } : {}),
            }),
        enabled: !isTechnician,
    });
    const allOrders = allOrdersResponse?.data || [];

    const bulkAssignMutation = useMutation({
        mutationFn: ({ orderIds, technicianId }: { orderIds: Array<number>; technicianId: number }) =>
            apiClient.bulkAssignOrders(orderIds, technicianId),
        onMutate: async ({ orderIds, technicianId }) => {
            await queryClient.cancelQueries({ queryKey: ['orders', 'all-map'] });

            const previous = queryClient.getQueryData<{ data: Array<Order> }>(['orders', 'all-map']);

            const tech = technicians.find((t) => t.id === technicianId);

            queryClient.setQueryData<{ data: Array<Order> } | undefined>(['orders', 'all-map'], (old) => {
                if (!old) {
                    return old;
                }

                return {
                    ...old,
                    data: old.data.map((order) =>
                        orderIds.includes(order.id)
                            ? {
                                  ...order,
                                  technicianId,
                                  technician: tech ? (tech as Order['technician']) : order.technician,
                              }
                            : order
                    ),
                };
            });

            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['orders', 'all-map'], context.previous);
            }
        },
        onSettled: () => {
            if (isOnline()) {
                queryClient.invalidateQueries({ queryKey: ['orders', 'all-map'] });
                queryClient.invalidateQueries({ queryKey: ['orders', 'all'] });
                queryClient.invalidateQueries({ queryKey: ['jobs'] });
            }
        },
    });

    const handleBulkAssign = (orderIds: Array<number>, technicianId: number) => {
        bulkAssignMutation.mutate({ orderIds, technicianId });
    };

    const orders = useMemo(() => (isTechnician ? myOrders : []), [isTechnician, myOrders]);

    if (userRole === 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const isLoading = isTechnician ? myLoading : false;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${viewMode === 'map' ? 'flex flex-col flex-1 min-h-0' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    {!isTechnician && (
                        <>
                            <Button as="a" icon={PlusCircleIcon} to="/orders/new">
                                {i18n('pages.orders.action')}
                            </Button>
                            <Button as="a" icon={UploadSimpleIcon} variant="outline" to="/orders/import">
                                {i18n('pages.orders.import')}
                            </Button>

                            {viewMode === 'map' && (
                                <select
                                    className={INPUT_CLASS}
                                    value={filterTechnicianId ?? ''}
                                    onChange={(e) =>
                                        setFilterTechnicianId(e.target.value ? Number(e.target.value) : null)
                                    }
                                >
                                    <option value="">{i18n('pages.orders.filter.allTechnicians')}</option>
                                    {technicians.map((tech) => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.name} {tech.lastName}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </>
                    )}
                </div>
                <select
                    className={INPUT_CLASS}
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as 'table' | 'map')}
                    data-testid="view-mode-dropdown"
                >
                    <option value="table">{i18n('pages.orders.viewMode.table')}</option>
                    <option value="map">{i18n('pages.orders.viewMode.map')}</option>
                </select>
            </div>

            {viewMode === 'table' ? (
                !isTechnician ? (
                    <Summary
                        icon={TruckIcon}
                        title={i18n('pages.orders.summary.title')}
                        subtitle={i18n('pages.orders.summary.subtitle')}
                    >
                        <AdminView />
                    </Summary>
                ) : (
                    <Summary
                        icon={TruckIcon}
                        title={i18n('pages.orders.summary.title')}
                        subtitle={i18n('pages.orders.summary.subtitle')}
                        legend={i18n('pages.orders.summary.total', { count: orders.length })}
                    >
                        <TechnicianView orders={orders} />
                    </Summary>
                )
            ) : (
                <div className="flex-1 min-h-0">
                    <OrdersMap
                        orders={isTechnician ? orders : allOrders}
                        technicians={technicians}
                        onBulkAssign={handleBulkAssign}
                        isAssigning={bulkAssignMutation.isPending}
                    />
                </div>
            )}
        </div>
    );
};

export default Inventory;
