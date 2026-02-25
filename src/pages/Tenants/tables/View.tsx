import type { ColumnDef } from '@tanstack/react-table';

import { useServerPagination } from '@components/Table/hooks/useServerPagination';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useInventoryActions } from '../utils/context';
import { useAuthContext } from '@context/auth/context';
import { apiClient } from '@lib/api-client';
import { useTranslations } from 'use-intl';

import Table from '@components/Table/Table';
import type {Tenant} from "@interfaces/tenant.interface.ts";

const ViewTable = () => {
    const i18n = useTranslations();
    const { user } = useAuthContext();
    const { select, openUpdate, openDelete } = useInventoryActions();

    const isAuthorized = user?.role?.name === 'admin';

    const handleEdit = (payload: Tenant) => {
        select(payload);
        openUpdate();
    };

    const handleRemove = (payload: Tenant) => {
        select(payload);
        openDelete();
    };

    const columns: Array<ColumnDef<Tenant>> = [
        {
            accessorKey: 'code',
            header: i18n('pages.tenants.fields.code'),
            cell: ({ row }) => <div className="whitespace-nowrap font-medium">{row.original.code}</div>,
        },
        {
            accessorKey: 'name',
            header: i18n('pages.tenants.fields.name'),
            cell: ({ row }) => <div className="whitespace-nowrap font-medium">{row.original.name}</div>,
        },
        {
            id: 'users',
            header: i18n('pages.tenants.fields.users'),
            cell: ({ row }) => <div className="whitespace-nowrap text-sm">{row.original._count.users}</div>,
        },
        {
            id: 'orders',
            header: i18n('pages.tenants.fields.orders'),
            cell: ({ row }) => <div className="whitespace-nowrap text-sm">{row.original._count.orders}</div>,
        },
        {
            id: 'actions',
            header: i18n('literal.actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(row.original)} className="cursor-pointer">
                        <PencilSimpleIcon
                            weight="duotone"
                            className="text-primary-500 dark:text-white"
                            width={20}
                            height={20}
                        />
                    </button>
                    <button onClick={() => handleRemove(row.original)} className="cursor-pointer">
                        <TrashIcon weight="duotone" className="text-secondary-500" width={20} height={20} />
                    </button>
                </div>
            ),
        },
    ];

    const { table, isLoading, total } = useServerPagination<Tenant>({
        queryKey: ['tenants'],
        fetchFn: (params) => apiClient.getTenants(params),
        columns,
        enabled: isAuthorized,
    });

    return <Table table={table} isLoading={isLoading} total={total} />;
};

export default ViewTable;
