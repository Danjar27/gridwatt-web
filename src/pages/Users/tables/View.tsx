import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '@lib/api-client.ts';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { PencilSimpleIcon, TrashIcon, KeyIcon, ShieldIcon } from '@phosphor-icons/react';
import { useUsersActions } from '../utils/context';
import { useAuthContext } from '@context/auth/context.ts';
import { apiClient } from '@lib/api-client.ts';

import Table from '@components/Table/Table';
import { useTranslations } from 'use-intl';

const ViewTable = () => {
    const i18n = useTranslations();

    const { select, selectForDelete, selectForPasswordReset, selectForRoleChange } = useUsersActions();
    const { user } = useAuthContext();

    const isAdmin = user?.role?.name === 'admin';
    const isAuthorized = isAdmin || user?.role?.name === 'manager';

    const columns: Array<ColumnDef<User>> = [
        {
            id: 'name',
            accessorKey: 'name',
            header: i18n('pages.users.table.name'),
            cell: ({ row }) => (
                <div className="font-medium">
                    {row.original.name} {row.original.lastName}
                </div>
            ),
        },
        {
            id: 'email',
            accessorKey: 'email',
            header: i18n('pages.users.table.email'),
            cell: ({ row }) => <div className="whitespace-nowrap text-sm">{row.original.email}</div>,
        },
        {
            id: 'phone',
            accessorKey: 'phone',
            header: i18n('pages.users.table.phone'),
            cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.phone ?? '-'}</div>,
        },
        {
            id: 'role',
            accessorKey: 'role',
            header: i18n('pages.users.table.role'),
            cell: ({ row }) => (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 border border-blue-200">
                    {row.original.role?.name}
                </span>
            ),
        },
        {
            id: 'status',
            accessorKey: 'isActive',
            header: i18n('pages.users.table.status'),
            cell: ({ row }) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.original.isActive
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                >
                    {row.original.isActive ? i18n('literal.active') : i18n('literal.inactive')}
                </span>
            ),
        },
        {
            id: 'tenant',
            header: i18n('pages.users.table.tenant'),
            accessorKey: 'tenant',
            cell: ({ row }) => (
                <div className="whitespace-nowrap text-sm text-muted-foreground">{row.original?.tenant?.name}</div>
            ),
        },
        {
            id: 'actions',
            header: i18n('literal.actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => select(row.original)}
                        className="cursor-pointer"
                        title={i18n('literal.edit')}
                    >
                        <PencilSimpleIcon
                            weight="duotone"
                            className="text-primary-500 dark:text-white"
                            width={20}
                            height={20}
                        />
                    </button>
                    <button
                        onClick={() => selectForRoleChange(row.original)}
                        className="cursor-pointer"
                        title={i18n('pages.users.form.changeRole.title')}
                    >
                        <ShieldIcon weight="duotone" className="text-blue-500" width={20} height={20} />
                    </button>
                    <button
                        onClick={() => selectForPasswordReset(row.original)}
                        className="cursor-pointer"
                        title={i18n('pages.users.form.passwordReset.title')}
                    >
                        <KeyIcon weight="duotone" className="text-amber-500" width={20} height={20} />
                    </button>
                    <button
                        onClick={() => selectForDelete(row.original)}
                        className="cursor-pointer"
                        title={i18n('literal.delete')}
                    >
                        <TrashIcon weight="duotone" className="text-secondary-500" width={20} height={20} />
                    </button>
                </div>
            ),
        },
    ];

    const { table, isLoading, total } = useServerPagination<User>({
        initialState: {
            columnVisibility: {
                tenant: isAdmin,
            },
        },
        queryKey: ['users'],
        fetchFn: (params) => apiClient.getUsers(params),
        columns,
        enabled: isAuthorized,
    });

    return <Table table={table} isLoading={isLoading} total={total} />;
};

export default ViewTable;
