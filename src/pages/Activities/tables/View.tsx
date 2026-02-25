import type { ColumnDef } from '@tanstack/react-table';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useInventoryActions } from '../utils/context.ts';
import { apiClient } from '@lib/api-client.ts';
import { useTranslations } from 'use-intl';

import Table from '@components/Table/Table';
import type {Activity} from "@interfaces/activity.interface.ts";

const ViewTable = () => {
    const i18n = useTranslations();
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
            header: i18n('pages.activities.form.id'),
            cell: ({ row }) => <div className="font-medium">{row.original.id}</div>,
        },
        {
            accessorKey: 'name',
            header: i18n('pages.activities.form.name'),
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: 'description',
            header: i18n('pages.activities.form.description'),
            cell: ({ row }) => <div className="text-sm truncate">{row.original.description || '-'}</div>,
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

    const { table, isLoading, total } = useServerPagination<Activity>({
        queryKey: ['activities'],
        fetchFn: (params) => apiClient.getActivities(params),
        columns,
    });

    return <Table table={table} isLoading={isLoading} total={total} />;
};

export default ViewTable;
