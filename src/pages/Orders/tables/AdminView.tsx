import type { ColumnDef } from '@tanstack/react-table';
import type { FilterConfig } from '@components/Table/Table.interface';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { EyeIcon, TrashIcon, UserIcon } from '@phosphor-icons/react';
import { deleteOrder, getOrders } from '@lib/api/orders.ts';
import { getTechnicians } from '@lib/api/users.ts';
import { useTranslations } from 'use-intl';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Table from '@components/Table/Table';
import type { User } from '@interfaces/user.interface.ts';
import type { Order } from '@interfaces/order.interface.ts';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'atendida':
        case 'completed':
            return 'bg-success-500/20 text-success-500';
        case 'pendiente':
        default:
            return 'bg-secondary-500/20 text-secondary-500';
    }
};

const AdminView = () => {
    const i18n = useTranslations();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: deleteOrder,
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    });

    const columns = useMemo<Array<ColumnDef<Order, any>>>(
        () => [
            {
                accessorKey: 'id',
                header: i18n('pages.orders.table.order'),
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">#{row.original.id}</div>
                        <div className="text-sm text-neutral-900">{row.original.meterId}</div>
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
                id: 'actions',
                header: i18n('literal.actions'),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <Link to={`/orders/${row.original.id}`} aria-label={i18n('pages.orders.table.view')}>
                            <EyeIcon weight="duotone" width={20} height={20} className="text-primary-500" />
                        </Link>
                        <button
                            type="button"
                            aria-label={i18n('literal.delete')}
                            onClick={() => {
                                if (!window.confirm(i18n('pages.orders.deleteConfirm'))) {
                                    return;
                                }
                                deleteMutation.mutate(row.original.id);
                            }}
                            className="cursor-pointer"
                        >
                            <TrashIcon weight="duotone" width={20} height={20} className="text-secondary-500" />
                        </button>
                    </div>
                ),
            },
        ],
        [i18n, deleteMutation]
    );

    const filterConfig = useMemo<FilterConfig>(
        () => ({
            status: {
                paramKey: 'status',
                options: [
                    { label: i18n('pages.orders.filter.status.pending'), value: 'pendiente' },
                    { label: i18n('pages.orders.filter.status.completed'), value: 'atendida' },
                ],
            },
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
        [i18n]
    );

    const { table, isLoading, total } = useServerPagination<Order>({
        queryKey: ['orders', 'all'],
        fetchFn: (params) => getOrders(params),
        columns,
        filterConfig,
        initialColumnFilters: [{ id: 'status', value: 'pendiente' }],
    });

    return <Table table={table} isLoading={isLoading} total={total} filterConfig={filterConfig} />;
};

export default AdminView;
