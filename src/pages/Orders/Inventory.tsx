import { PlusCircleIcon, TruckIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useAuthContext } from '@context/auth/context.ts';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';
import { useMemo, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { bulkAssignOrders, getMyOrders, getOrders } from '@lib/api/orders.ts';
import { getTechnicians } from '@lib/api/users.ts';
import { OrdersMap } from '@/components/orders/OrdersMap';
import { queryClient } from '@lib/query-client';
import { isOnline } from '@/lib/offline-store';

import PageToolbar from '@components/PageToolbar/PageToolbar';
import ToolbarButton from '@components/PageToolbar/ToolbarButton';
import ToolbarDivider from '@components/PageToolbar/ToolbarDivider';
import ToolbarSelect from '@components/PageToolbar/ToolbarSelect';
import TechnicianView from '@pages/Orders/tables/TechnicianView';
import AdminView from '@pages/Orders/tables/AdminView';
import Summary from '@components/Summary/Summary';
import type { User } from '@interfaces/user.interface.ts';
import type { Order } from '@interfaces/order.interface.ts';

const Inventory = () => {
    const i18n = useTranslations();

    const { user } = useAuthContext();
    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';

    const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
    const [filterTechnicianId, setFilterTechnicianId] = useState<number | null>(null);

    const { data: myOrders = [], isLoading: myLoading } = useQuery({
        queryKey: ['orders', 'my'],
        queryFn: () => getMyOrders(),
        enabled: isTechnician,
    });

    const { data: technicianResponse } = useQuery({
        queryKey: ['technicians'],
        queryFn: () => getTechnicians(),
        enabled: !isTechnician,
    });
    const technicians: Array<User> = Array.isArray(technicianResponse)
        ? technicianResponse
        : ((technicianResponse as any)?.data ?? []);

    const { data: allOrdersResponse } = useQuery({
        queryKey: ['orders', 'all-map', filterTechnicianId],
        queryFn: () =>
            getOrders({
                limit: 10000,
                offset: 0,
                ...(filterTechnicianId ? { technicianId: filterTechnicianId } : {}),
            }),
        enabled: !isTechnician,
    });
    const allOrders = allOrdersResponse?.data || [];

    const bulkAssignMutation = useMutation({
        mutationFn: ({ orderIds, technicianId }: { orderIds: Array<string>; technicianId: number }) =>
            bulkAssignOrders(orderIds, technicianId),
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

    const handleBulkAssign = (orderIds: Array<string>, technicianId: number) => {
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
            <PageToolbar>
                {!isTechnician && (
                    <>
                        <ToolbarButton as="a" icon={PlusCircleIcon} variant="primary" to="/orders/new">
                            {i18n('pages.orders.action')}
                        </ToolbarButton>
                        <ToolbarButton as="a" icon={UploadSimpleIcon} to="/orders/import">
                            {i18n('pages.orders.import')}
                        </ToolbarButton>
                        <ToolbarDivider />
                        <ToolbarSelect<'table' | 'map'>
                            value={viewMode}
                            onChange={setViewMode}
                            options={[
                                { label: i18n('pages.orders.viewMode.table'), value: 'table' },
                                { label: i18n('pages.orders.viewMode.map'), value: 'map' },
                            ]}
                        />
                        {viewMode === 'map' && (
                            <ToolbarSelect<number | null>
                                value={filterTechnicianId}
                                onChange={setFilterTechnicianId}
                                options={[
                                    { label: i18n('pages.orders.filter.allTechnicians'), value: null },
                                    ...technicians.map((tech) => ({
                                        label: `${tech.name} ${tech.lastName}`,
                                        value: tech.id,
                                    })),
                                ]}
                            />
                        )}
                    </>
                )}
            </PageToolbar>

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
