import type { ColumnDef } from '@tanstack/react-table';
import type { Order } from '@lib/api-client.ts';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { EyeIcon, MapPinIcon, UserIcon } from '@phosphor-icons/react';
import { apiClient } from '@lib/api-client.ts';
import { useTranslations } from 'use-intl';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

import Table from '@components/Table/Table.tsx';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'bg-success-500/20 text-success-500';
        case 'in_progress':
        case 'assigned':
            return 'bg-primary-500/20 text-primary-500';
        default:
            return 'bg-secondary-500/20 text-secondary-500';
    }
};

interface AdminViewProps {
    filterTechnicianId: number | null;
}

const AdminView = ({ filterTechnicianId }: AdminViewProps) => {
    const i18n = useTranslations();

    const columns = useMemo<Array<ColumnDef<Order, any>>>(
        () => [
            {
                accessorKey: 'id',
                header: i18n('pages.orders.table.order'),
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">#{row.original.id}</div>
                        <div className="text-sm text-neutral-900">{row.original.meterNumber}</div>
                    </div>
                ),
            },
            {
                id: 'customer',
                header: i18n('pages.orders.table.customer'),
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
                header: i18n('pages.orders.table.service'),
                cell: ({ row }) => (
                    <div>
                        <div>{row.original.serviceType}</div>
                        {row.original.latitude && row.original.longitude && (
                            <div className="flex items-center gap-1 text-sm text-neutral-900">
                                <MapPinIcon weight="duotone" width={12} height={12} />
                                {i18n('pages.orders.table.hasLocation')}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'orderStatus',
                header: i18n('pages.orders.table.status'),
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
                header: i18n('pages.orders.table.technician'),
                cell: ({ row }) =>
                    row.original.technician ? (
                        <div className="flex items-center gap-2">
                            <UserIcon weight="duotone" width={16} height={16} className="text-neutral-900" />
                            {row.original.technician.name} {row.original.technician.lastName}
                        </div>
                    ) : (
                        <span className="text-neutral-900">{i18n('pages.orders.table.unassigned')}</span>
                    ),
            },
            {
                accessorKey: 'issueDate',
                header: i18n('pages.orders.table.date'),
                cell: ({ row }) => (
                    <div className="text-sm text-neutral-900">
                        {new Date(row.original.issueDate).toLocaleDateString()}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: i18n('literal.actions'),
                cell: ({ row }) => (
                    <Link
                        to={`/orders/${row.original.id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
                    >
                        <EyeIcon weight="duotone" width={16} height={16} />
                        {i18n('pages.orders.table.view')}
                    </Link>
                ),
            },
        ],
        [i18n]
    );

    const extraParams = useMemo(
        () => (filterTechnicianId ? { technicianId: filterTechnicianId } : undefined),
        [filterTechnicianId]
    );

    const { table, isLoading, total } = useServerPagination<Order>({
        queryKey: ['orders', 'all'],
        fetchFn: (params) => apiClient.getOrders(params),
        columns,
        extraParams,
    });

    return <Table table={table} isLoading={isLoading} total={total} />;
};

export default AdminView;
