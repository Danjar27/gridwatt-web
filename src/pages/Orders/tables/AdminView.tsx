import type { ColumnDef } from '@tanstack/react-table';
import type { FilterConfig } from '@components/Table/Table.interface';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { EyeIcon, MapPinIcon, UserIcon } from '@phosphor-icons/react';
import { getOrders } from '@lib/api/orders.ts';
import { getTechnicians } from '@lib/api/users.ts';
import { useTranslations } from 'use-intl';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

import Table from '@components/Table/Table';
import type {User} from "@interfaces/user.interface.ts";
import type { Order } from '@interfaces/order.interface.ts';

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

const AdminView = () => {
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
                accessorKey: 'status',
                header: i18n('pages.orders.table.status'),
                cell: ({ row }) => (
                    <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(row.original.status)}`}
                    >
                        {row.original.status}
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

    const filterConfig = useMemo<FilterConfig>(
        () => ({
            technician: {
                paramKey: 'technicianId',
                options: async () => {
                    const response = await getTechnicians();
                    const technicians: Array<User> = Array.isArray(response)
                        ? response
                        : ((response as any)?.data ?? []);

                    return technicians.map((t) => ({
                        label: `${t.name} ${t.lastName}`,
                        value: String(t.id),
                    }));
                },
            },
        }),
        []
    );

    const { table, isLoading, total } = useServerPagination<Order>({
        queryKey: ['orders', 'all'],
        fetchFn: (params) => getOrders(params),
        columns,
        filterConfig,
    });

    return <Table table={table} isLoading={isLoading} total={total} filterConfig={filterConfig} />;
};

export default AdminView;
