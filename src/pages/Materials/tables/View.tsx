import type { ColumnDef } from '@tanstack/react-table';
import type { FC } from 'react';

import { useServerPagination } from '@components/Table/hooks/useServerPagination.ts';
import { PencilSimpleIcon, TrashIcon, UserPlusIcon, ArrowLineDownIcon } from '@phosphor-icons/react';
import { useInventoryActions } from '../utils/context.ts';
import { getMaterials } from '@lib/api/materials.ts';
import { useTranslations } from 'use-intl';

import Table from '@components/Table/Table';
import type { Material } from '@interfaces/material.interface.ts';

interface ViewTableProps {
    onAssign?: (material: Material) => void;
    onIngress?: (material: Material) => void;
}

const ViewTable: FC<ViewTableProps> = ({ onAssign, onIngress }) => {
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

    const handleAssign = (material: Material) => {
        select(material);
        onAssign?.(material);
    };

    const handleIngress = (material: Material) => {
        select(material);
        onIngress?.(material);
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
            accessorKey: 'unit',
            header: i18n('pages.materials.form.unit'),
            cell: ({ row }) => <div className="text-sm">{row.original.unit}</div>,
        },
        {
            accessorKey: 'totalStock',
            header: i18n('pages.materials.form.totalStock'),
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original.totalStock ?? 0} {row.original.unit}
                </div>
            ),
        },
        {
            id: 'actions',
            header: i18n('literal.actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleIngress(row.original)}
                        className="cursor-pointer"
                        title={i18n('pages.materials.form.ingress')}
                    >
                        <ArrowLineDownIcon weight="duotone" className="text-blue-400" width={20} height={20} />
                    </button>
                    <button
                        onClick={() => handleAssign(row.original)}
                        className="cursor-pointer"
                        title={i18n('pages.materials.form.assign')}
                    >
                        <UserPlusIcon weight="duotone" className="text-green-500" width={20} height={20} />
                    </button>
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
        fetchFn: (params) => getMaterials(params),
        columns,
    });

    return <Table table={table} isLoading={isLoading} total={total} />;
};

export default ViewTable;
