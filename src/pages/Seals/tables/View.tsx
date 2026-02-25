import type { ColumnDef } from '@tanstack/react-table';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useInventoryActions } from '../utils/context.ts';
import { getSeals } from '@lib/api/seals.ts';
import { useTranslations } from 'use-intl';

import Table from '@components/Table/Table';
import type {Seal} from "@interfaces/seal.interface.ts";

const ViewTable = () => {
    const i18n = useTranslations();
    const { select, openUpdate, openDelete } = useInventoryActions();

    const handleEdit = (seal: Seal) => {
        select(seal);
        openUpdate();
    };

    const handleRemove = (seal: Seal) => {
        select(seal);
        openDelete();
    };

    const columns: Array<ColumnDef<Seal>> = [
        {
            accessorKey: 'id',
            header: i18n('pages.seals.form.id'),
            cell: ({ row }) => <div className="font-mono text-sm">{row.original.id}</div>,
        },
        {
            accessorKey: 'name',
            header: i18n('pages.seals.form.name'),
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: 'type',
            header: i18n('pages.seals.form.type'),
            cell: ({ row }) => (
                <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {row.original.type}
                </span>
            ),
        },
        {
            accessorKey: 'description',
            header: i18n('pages.seals.form.description'),
            cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.original.description || '-'}</div>,
        },
        {
            accessorKey: 'isActive',
            header: i18n('pages.seals.form.isActive'),
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

    const { table, isLoading, total } = useServerPagination<Seal>({
        queryKey: ['seals'],
        fetchFn: (params) => getSeals(params),
        columns,
    });

    return <Table table={table} isLoading={isLoading} total={total} />;
};

export default ViewTable;
