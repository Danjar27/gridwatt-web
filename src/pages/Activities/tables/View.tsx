import type { ColumnDef } from '@tanstack/react-table';
import type { Activity } from '@lib/api-client.ts';
import { apiClient } from '@lib/api-client.ts';

import { useInventoryActions } from '@context/Inventory/context.ts';

import Table from '@components/Table/Table.tsx';
import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { PencilSimpleIcon } from '@phosphor-icons/react';

const ViewTable = () => {
    const { select } = useInventoryActions();

    const columns: Array<ColumnDef<Partial<Activity>>> = [
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
                    <button
                        onClick={() => select(row.original)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                        <PencilSimpleIcon width={20} height={20} />
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
