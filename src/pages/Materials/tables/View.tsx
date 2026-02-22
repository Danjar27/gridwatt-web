import type { ColumnDef } from '@tanstack/react-table';
import type { Material } from '@lib/api-client.ts';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useInventoryActions } from '../utils/context.ts';
import { apiClient } from '@lib/api-client.ts';
import { useTranslations } from 'use-intl';

import Table from '@components/Table/Table';

const ViewTable = () => {
    const i18n = useTranslations();
    const { select, openUpdate, openDelete } = useInventoryActions();

    const handleEdit = (material: Material) => {
        select(material);
        openUpdate();
    };

    const handleRemove = (material: Material) => {
        select(material);
        openDelete();
    };

    const columns: Array<ColumnDef<Material>> = [
        {
            accessorKey: 'id',
            header: i18n('pages.materials.form.id'),
            cell: ({ row }) => <div className="font-mono text-sm">{row.original.id}</div>,
        },
        {
            accessorKey: 'name',
            header: i18n('pages.materials.form.name'),
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: 'description',
            header: i18n('pages.materials.form.description'),
            cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.description}</div>,
        },
        {
            accessorKey: 'type',
            header: i18n('pages.materials.form.type'),
            cell: ({ row }) => (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {row.original.type}
                </span>
            ),
        },
        {
            accessorKey: 'unit',
            header: i18n('pages.materials.form.unit'),
            cell: ({ row }) => <div className="text-sm">{row.original.unit}</div>,
        },
        {
            id: 'actions',
            header: 'Actions',
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

    const { table, isLoading, total } = useServerPagination<Material>({
        queryKey: ['materials'],
        fetchFn: (params) => apiClient.getMaterials(params),
        columns,
    });

    return <Table table={table} isLoading={isLoading} total={total} />;
};

export default ViewTable;
