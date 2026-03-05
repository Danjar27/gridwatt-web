import { PlusCircleIcon, TruckIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useAuthContext } from '@context/auth/context.ts';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';
import { useMemo, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getMyOrders, getOrderMapPoints } from '@lib/api/orders.ts';
import { getTechnicians } from '@lib/api/users.ts';
import { getAreas, deleteArea, updateArea } from '@lib/api/areas.ts';
import { OrdersMap } from '@/components/orders/OrdersMap';
import { queryClient } from '@lib/query-client';

import PageToolbar from '@components/PageToolbar/PageToolbar';
import ToolbarButton from '@components/PageToolbar/ToolbarButton';
import ToolbarDivider from '@components/PageToolbar/ToolbarDivider';
import ToolbarSelect from '@components/PageToolbar/ToolbarSelect';
import TechnicianView from '@pages/Orders/tables/TechnicianView';
import AdminView from '@pages/Orders/tables/AdminView';
import Summary from '@components/Summary/Summary';
import AreaForm from '@pages/Orders/forms/AreaForm.tsx';
import type { User } from '@interfaces/user.interface.ts';
import type { MapArea, AreaCoordinate } from '@interfaces/area.interface.ts';
import type { OrderMapPoint } from '@interfaces/order.interface.ts';

const Inventory = () => {
    const i18n = useTranslations();

    const { user } = useAuthContext();
    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';

    const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
    const [filterTechnicianId, setFilterTechnicianId] = useState<number | null>(null);
    const [pendingCoords, setPendingCoords] = useState<AreaCoordinate[] | null>(null);
    const [editingArea, setEditingArea] = useState<MapArea | null>(null);

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

    const { data: allOrders = [] } = useQuery<Array<OrderMapPoint>>({
        queryKey: ['orders', 'map-points', filterTechnicianId],
        queryFn: () => getOrderMapPoints(),
        enabled: !isTechnician && viewMode === 'map',
    });

    const { data: areas = [] } = useQuery({
        queryKey: ['areas'],
        queryFn: getAreas,
        select: (res) => (Array.isArray(res) ? res : ((res as any)?.data ?? [])),
        enabled: viewMode === 'map' && !isTechnician,
    });

    const deleteAreaMutation = useMutation({
        mutationFn: (id: number) => deleteArea(id),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['areas'] }),
    });

    const updateAreaShapeMutation = useMutation({
        mutationFn: ({ id, coords }: { id: number; coords: AreaCoordinate[] }) =>
            updateArea(id, { coordinates: coords }),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['areas'] });
            queryClient.invalidateQueries({ queryKey: ['orders', 'map-points'] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
    });

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
        <>
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
                            areas={areas}
                            onDrawComplete={(coords) => setPendingCoords(coords)}
                            onAreaEditRequest={(area) => setEditingArea(area)}
                            onAreaShapeUpdate={(id, coords) => updateAreaShapeMutation.mutate({ id, coords })}
                            onAreaDelete={(id) => deleteAreaMutation.mutate(id)}
                            isAreaMutating={deleteAreaMutation.isPending || updateAreaShapeMutation.isPending}
                        />
                    </div>
                )}
            </div>

            <AreaForm
                isOpen={!!pendingCoords || !!editingArea}
                onClose={() => {
                    setPendingCoords(null);
                    setEditingArea(null);
                }}
                pendingCoords={pendingCoords}
                editingArea={editingArea}
                orders={allOrders}
            />
        </>
    );
};

export default Inventory;
