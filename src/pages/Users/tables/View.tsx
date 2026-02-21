import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '@lib/api-client.ts';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { PencilSimpleIcon, TrashIcon, KeyIcon, ShieldIcon } from '@phosphor-icons/react';
import { useUsersActions } from '../utils/context.tsx';
import { useAuthContext } from '@context/auth/context.ts';
import { apiClient } from '@lib/api-client.ts';

import Table from '@components/Table/Table.tsx';

const formatDate = (dateString?: string) => {
    if (!dateString) {return 'Never';}

    return new Date(dateString).toLocaleDateString('es-MX', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

const ViewTable = () => {
    const { select, selectForDelete, selectForPasswordReset, selectForRoleChange } = useUsersActions();
    const { user: currentUser } = useAuthContext();

    const isAuthorized = currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'manager';

    const columns: Array<ColumnDef<User>> = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div className="whitespace-nowrap">
                    <div className="font-medium">{row.original.name} {row.original.lastName}</div>
                    {row.original.phone && (
                        <div className="text-sm text-muted-foreground">{row.original.phone}</div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <div className="whitespace-nowrap text-sm">{row.original.email}</div>,
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 border border-blue-200">
                    {row.original.role?.name}
                </span>
            ),
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({ row }) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.original.isActive
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                >
                    {row.original.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            id: 'lastLogin',
            header: 'Last Login',
            cell: ({ row }) => (
                <div className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate((row.original as any).lastLogin)}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <button onClick={() => select(row.original)} className="cursor-pointer" title="Edit">
                        <PencilSimpleIcon weight="duotone" className="text-primary-500 dark:text-white" width={20} height={20} />
                    </button>
                    <button onClick={() => selectForRoleChange(row.original)} className="cursor-pointer" title="Change Role">
                        <ShieldIcon weight="duotone" className="text-blue-500" width={20} height={20} />
                    </button>
                    <button onClick={() => selectForPasswordReset(row.original)} className="cursor-pointer" title="Reset Password">
                        <KeyIcon weight="duotone" className="text-amber-500" width={20} height={20} />
                    </button>
                    <button onClick={() => selectForDelete(row.original)} className="cursor-pointer" title="Delete">
                        <TrashIcon weight="duotone" className="text-secondary-500" width={20} height={20} />
                    </button>
                </div>
            ),
        },
    ];

    const { table, isLoading, total } = useServerPagination<User>({
        queryKey: ['users'],
        fetchFn: (params) => apiClient.getUsers(params),
        columns,
        enabled: isAuthorized,
    });

    return <Table table={table} isLoading={isLoading} total={total} />;
};

export default ViewTable;
