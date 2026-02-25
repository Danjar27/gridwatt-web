import { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckCircle, UploadCloud, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/react-table';
import type { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';
import { commitOrdersImport, previewOrdersImport } from '@lib/api/orders.ts';
import { classnames } from '@utils/classnames.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';
import Button from '@components/Button/Button';
import Table from '@components/Table/Table';
import Checkbox from '@components/atoms/Checkbox';
import type { OrderImportData, OrderImportPreviewItem, OrdersImportPreviewResponse } from '@interfaces/order.interface.ts';

const CELL_INPUT = 'w-full rounded border border-neutral-800 bg-neutral-500/60 px-1 py-0.5 text-sm';

export function OrdersImportPage() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const i18n = useTranslations();
    const userRole = user?.role?.name;
    const isRestricted = userRole === 'technician' || userRole === 'admin';

    const [files, setFiles] = useState<Array<File>>([]);
    const [preview, setPreview] = useState<OrdersImportPreviewResponse | null>(null);
    const [localOrders, setLocalOrders] = useState<Array<OrderImportPreviewItem>>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [error, setError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isCommitting, setIsCommitting] = useState(false);
    const [commitResult, setCommitResult] = useState<number | null>(null);

    useEffect(() => {
        if (preview) {
            setLocalOrders(preview.orders);
            setRowSelection({});
            setPagination((p) => ({ ...p, pageIndex: 0 }));
        }
    }, [preview]);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files || []);
        setFiles(selected);
        setPreview(null);
        setCommitResult(null);
        setError(null);
    };

    const parseFiles = async () => {
        if (files.length === 0) {
            setError(i18n('pages.ordersImport.errors.noFiles'));

            return;
        }
        setError(null);
        setIsParsing(true);
        setCommitResult(null);
        try {
            const result = await previewOrdersImport(files);
            setPreview(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : i18n('pages.ordersImport.errors.parseFiles'));
        } finally {
            setIsParsing(false);
        }
    };

    const handleEdit = useCallback((rowIndex: number, field: keyof OrderImportData, value: string) => {
        setLocalOrders((prev) =>
            prev.map((order, i) => (i === rowIndex ? { ...order, data: { ...order.data, [field]: value } } : order))
        );
    }, []);

    const commitOrders = async (selectedOnly = false) => {
        if (localOrders.length === 0) {return;}

        let ordersToProcess = localOrders;
        let selectedIndices: Set<number> | null = null;

        if (selectedOnly) {
            selectedIndices = new Set(
                Object.entries(rowSelection)
                    .filter(([, v]) => v)
                    .map(([k]) => Number(k)),
            );
            ordersToProcess = localOrders.filter((_, i) => selectedIndices!.has(i));
        }

        const validOrders = ordersToProcess.filter((o) => !o.errors || o.errors.length === 0);
        if (validOrders.length === 0) {
            setError(i18n('pages.ordersImport.errors.noValidOrders'));

            return;
        }

        setError(null);
        setIsCommitting(true);
        try {
            const response = await commitOrdersImport(validOrders.map((o) => o.data));
            setCommitResult(response.createdCount);
            queryClient.invalidateQueries({ queryKey: ['orders'] });

            // Remove successfully imported orders from the table
            if (selectedOnly && selectedIndices) {
                // Only remove valid ones from the selection; invalid selected stay for review
                const validSelectedIndices = new Set(
                    localOrders
                        .map((o, i) => ({ o, i }))
                        .filter(({ o, i }) => selectedIndices!.has(i) && (!o.errors || o.errors.length === 0))
                        .map(({ i }) => i),
                );
                setLocalOrders((prev) => prev.filter((_, i) => !validSelectedIndices.has(i)));
            } else {
                // Remove all valid orders; invalid ones stay for review
                setLocalOrders((prev) => prev.filter((o) => o.errors && o.errors.length > 0));
            }
            setRowSelection({});
        } catch (err) {
            setError(err instanceof Error ? err.message : i18n('pages.ordersImport.errors.importFailed'));
        } finally {
            setIsCommitting(false);
        }
    };

    const removeSelected = () => {
        const selectedIndices = new Set(
            Object.entries(rowSelection)
                .filter(([, v]) => v)
                .map(([k]) => Number(k))
        );
        setLocalOrders((prev) => prev.filter((_, i) => !selectedIndices.has(i)));
        setRowSelection({});
    };

    const selectedCount = useMemo(() => Object.values(rowSelection).filter(Boolean).length, [rowSelection]);

    const summary = useMemo(
        () =>
            localOrders.length > 0
                ? {
                      total: localOrders.length,
                      invalid: localOrders.filter((o) => o.errors && o.errors.length > 0).length,
                  }
                : null,
        [localOrders]
    );

    const columns = useMemo<Array<ColumnDef<OrderImportPreviewItem>>>(
        () => [
            {
                id: 'select',
                size: 48,
                meta: { fixed: true },
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        indeterminate={table.getIsSomePageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
            },
            {
                id: 'source',
                header: i18n('pages.ordersImport.table.source'),
                cell: ({ row }) => {
                    const hasErrors = !!row.original.errors?.length;
                    const hasWarnings = !!row.original.warnings?.length;

                    return (
                        <div className="flex items-start gap-2">
                            <span
                                className={classnames('mt-1 h-2 w-2 shrink-0 rounded-full', {
                                    'bg-error-500': hasErrors,
                                    'bg-secondary-500': !hasErrors && hasWarnings,
                                    'bg-success-500': !hasErrors && !hasWarnings,
                                })}
                            />
                            <div className="min-w-0">
                                <div className="truncate font-medium">{row.original.fileName}</div>
                                <div className="text-xs text-neutral-900">
                                    {i18n('pages.ordersImport.row')} {row.original.rowNumber ?? 'n/a'}
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'customer',
                header: i18n('pages.ordersImport.table.customer'),
                cell: ({ row }) => {
                    const idx = row.index;
                    const d = row.original.data;

                    return (
                        <div className="space-y-1">
                            <input
                                className={CELL_INPUT}
                                value={String(d.firstName ?? '')}
                                onChange={(e) => handleEdit(idx, 'firstName', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.firstName')}
                            />
                            <input
                                className={CELL_INPUT}
                                value={String(d.lastName ?? '')}
                                onChange={(e) => handleEdit(idx, 'lastName', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.lastName')}
                            />
                            <input
                                className={classnames('text-xs', CELL_INPUT)}
                                value={String(d.email ?? '')}
                                onChange={(e) => handleEdit(idx, 'email', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.email')}
                            />
                            <input
                                className={classnames('text-xs', CELL_INPUT)}
                                value={String(d.phone ?? '')}
                                onChange={(e) => handleEdit(idx, 'phone', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.phone')}
                            />
                        </div>
                    );
                },
            },
            {
                id: 'accountMeter',
                header: i18n('pages.ordersImport.table.accountMeter'),
                cell: ({ row }) => {
                    const idx = row.index;
                    const d = row.original.data;

                    return (
                        <div className="space-y-1">
                            <input
                                className={CELL_INPUT}
                                value={String(d.accountNumber ?? '')}
                                onChange={(e) => handleEdit(idx, 'accountNumber', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.accountNumber')}
                            />
                            <input
                                className={CELL_INPUT}
                                value={String(d.meterNumber ?? '')}
                                onChange={(e) => handleEdit(idx, 'meterNumber', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.meterNumber')}
                            />
                        </div>
                    );
                },
            },
            {
                id: 'service',
                header: i18n('pages.ordersImport.table.service'),
                cell: ({ row }) => {
                    const idx = row.index;
                    const d = row.original.data;

                    return (
                        <div className="space-y-1">
                            <input
                                className={CELL_INPUT}
                                value={String(d.serviceType ?? '')}
                                onChange={(e) => handleEdit(idx, 'serviceType', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.serviceType')}
                            />
                            <input
                                className={CELL_INPUT}
                                value={String(d.orderStatus ?? '')}
                                onChange={(e) => handleEdit(idx, 'orderStatus', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.orderStatus')}
                            />
                        </div>
                    );
                },
            },
            {
                id: 'issueDate',
                header: i18n('pages.ordersImport.table.issueDate'),
                cell: ({ row }) => {
                    const idx = row.index;
                    const d = row.original.data;

                    return (
                        <div className="space-y-1">
                            <input
                                className={classnames('text-xs', CELL_INPUT)}
                                value={String(d.issueDate ?? '')}
                                onChange={(e) => handleEdit(idx, 'issueDate', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.issueDate')}
                            />
                            <input
                                className={classnames('text-xs', CELL_INPUT)}
                                value={String(d.issueTime ?? '')}
                                onChange={(e) => handleEdit(idx, 'issueTime', e.target.value)}
                                placeholder={i18n('pages.ordersImport.placeholders.issueTime')}
                            />
                        </div>
                    );
                },
            },
            {
                id: 'issues',
                header: i18n('pages.ordersImport.table.issues'),
                cell: ({ row }) => {
                    const hasErrors = !!row.original.errors?.length;
                    const hasWarnings = !!row.original.warnings?.length;
                    if (hasErrors) {
                        return (
                            <div className="flex items-start gap-1.5 text-xs text-error-500">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span>{row.original.errors?.join(' ')}</span>
                            </div>
                        );
                    }
                    if (hasWarnings) {
                        return <div className="text-xs text-secondary-500">{row.original.warnings?.join(' ')}</div>;
                    }

                    return <div className="text-xs text-neutral-900">{i18n('pages.ordersImport.ok')}</div>;
                },
            },
        ],
        [i18n, handleEdit]
    );

    const table = useReactTable({
        data: localOrders,
        columns,
        state: { rowSelection, pagination },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (isRestricted) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-600/60">
                <p className="text-neutral-900">{i18n('pages.ordersImport.restricted')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{i18n('pages.ordersImport.title')}</h1>
                <p className="text-neutral-900">{i18n('pages.ordersImport.subtitle')}</p>
            </div>

            {/* Upload card */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="text-sm font-medium">{i18n('pages.ordersImport.selectFiles')}</div>
                        <p className="text-sm text-neutral-900">{i18n('pages.ordersImport.supported')}</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:border-primary-500 hover:text-primary-500">
                        <UploadCloud className="h-4 w-4" />
                        {i18n('pages.ordersImport.chooseFiles')}
                        <input
                            type="file"
                            multiple
                            accept=".csv,.xlsx,.xls,.xml,.pdf"
                            onChange={onFileChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="mt-4 rounded-md bg-neutral-700/40 p-3 text-sm text-neutral-900">
                        {files.map((file) => (
                            <div key={file.name}>{file.name}</div>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                    <Button onClick={parseFiles} disabled={isParsing}>
                        {isParsing ? i18n('pages.ordersImport.parsing') : i18n('pages.ordersImport.parseFiles')}
                    </Button>
                    {localOrders.length > 0 && (
                        <Button variant="outline" onClick={() => commitOrders()} disabled={isCommitting}>
                            {isCommitting
                                ? i18n('pages.ordersImport.importing')
                                : i18n('pages.ordersImport.importValid')}
                        </Button>
                    )}
                </div>

                {error && (
                    <div className="mt-4 rounded-md border border-error-500/30 bg-error-500/10 p-3 text-sm text-error-500">
                        {error}
                    </div>
                )}

                {commitResult !== null && (
                    <div className="mt-4 flex items-center gap-2 rounded-md border border-success-500/30 bg-success-500/10 p-3 text-sm text-success-500">
                        <CheckCircle className="h-4 w-4" />
                        {i18n('pages.ordersImport.importedSuccess', { count: commitResult })}
                    </div>
                )}
            </div>

            {/* Preview section */}
            {preview && (
                <div className="space-y-4">
                    {preview.fileErrors.length > 0 && (
                        <div className="rounded-lg border border-secondary-500/30 bg-secondary-500/10 p-4 text-sm text-secondary-500">
                            <div className="mb-2 font-medium">{i18n('pages.ordersImport.fileWarnings')}</div>
                            {preview.fileErrors.map((fileError) => (
                                <div key={fileError.fileName}>
                                    {fileError.fileName}: {fileError.message}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary stats */}
                    {summary && (
                        <div className="flex flex-wrap gap-4">
                            <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 px-4 py-3">
                                <div className="text-sm text-neutral-900">{i18n('pages.ordersImport.totalParsed')}</div>
                                <div className="text-xl font-semibold">{summary.total}</div>
                            </div>
                            <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 px-4 py-3">
                                <div className="text-sm text-neutral-900">{i18n('pages.ordersImport.validOrders')}</div>
                                <div className="text-xl font-semibold">{summary.total - summary.invalid}</div>
                            </div>
                            <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 px-4 py-3">
                                <div className="text-sm text-neutral-900">{i18n('pages.ordersImport.needsReview')}</div>
                                <div className="text-xl font-semibold">{summary.invalid}</div>
                            </div>
                        </div>
                    )}

                    {/* Selection toolbar */}
                    {selectedCount > 0 && (
                        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary-500/30 bg-primary-500/10 px-4 py-3">
                            <span className="text-sm font-medium text-primary-500">
                                {i18n('pages.ordersImport.selected', { count: selectedCount })}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={() => commitOrders(true)} disabled={isCommitting}>
                                    {i18n('pages.ordersImport.importSelected', { count: selectedCount })}
                                </Button>
                                <Button variant="outline" onClick={removeSelected}>
                                    {i18n('pages.ordersImport.removeFromBatch')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Preview table */}
                    <div className="overflow-hidden rounded-lg border border-neutral-800 shadow-sm">
                        <Table table={table} total={localOrders.length} />
                    </div>
                </div>
            )}
        </div>
    );
}
