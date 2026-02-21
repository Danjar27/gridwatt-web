import type { ColumnDef } from '@tanstack/react-table';
import type { Activity } from '@lib/api-client.ts';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useInventoryActions } from '../utils/context.ts';
import { apiClient } from '@lib/api-client.ts';

import Table from '@components/Table/Table.tsx';

const ViewTable = () => {
    const { select, openUpdate, openDelete } = useInventoryActions();

    const handleEdit = (activity: Activity) => {
        select(activity);
        openUpdate();
    };

    const handleRemove = (activity: Activity) => {
        select(activity);
        openDelete();
    };

    const columns: Array<ColumnDef<Activity>> = [
        {
            accessorKey: 'id',
            header: 'Id',
            cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.description || '-'}</div>,
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
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(row.original)} className="cursor-pointer">
                        <PencilSimpleIcon weight="duotone" className="text-primary-500 dark:text-white" width={20} height={20} />
                    </button>
                    <button onClick={() => handleRemove(row.original)} className="cursor-pointer">
                        <TrashIcon weight="duotone" className="text-secondary-500" width={20} height={20} />
                    </button>
                </div>
            ),
        },
    ];

    const { table, isLoading, total } = useServerPagination<Activity>({
        queryKey: ['activities'],
        fetchFn: (params) => apiClient.getActivities(params),
        columns,
    });

    return <Table table={table} isLoading={isLoading} total={total} />;
};

export default ViewTable;
