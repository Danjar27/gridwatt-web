import { useState, useEffect, useMemo } from 'react';
import {
    UploadSimpleIcon,
    CheckCircleIcon,
    WarningCircleIcon,
    WarningIcon,
    TrashIcon,
    XIcon,
    FilePdfIcon,
    FileXlsIcon,
    FileCsvIcon,
    ArrowRightIcon,
    ListBulletsIcon,
    CheckSquareIcon,
    PencilSimpleIcon,
    ArrowsClockwiseIcon,
    ClockIcon,
    XCircleIcon,
} from '@phosphor-icons/react';
import OrderEditModal from './OrdersImport/OrderEditModal';
import { useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';
import type { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';
import { commitOrdersImport, previewOrdersImport } from '@lib/api/orders.ts';
import { classnames } from '@utils/classnames.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';
import Button from '@components/Button/Button';
import FileUploader from '@components/FileUploader/FileUploader';
import Table from '@components/Table/Table';
import Page from '@layouts/Page';
import Checkbox from '@components/atoms/Checkbox';
import Stepper from '@components/Stepper/Stepper.tsx';
import { useStepper } from '@hooks/useStepper.ts';
import type { FilterConfig } from '@components/Table/Table.interface.ts';
import type { OrderImportPreviewItem, OrdersImportPreviewResponse } from '@interfaces/order.interface.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep = 'upload' | 'review' | 'done';

const WIZARD_STEP_IDS = ['upload', 'review', 'done'] as const satisfies ReadonlyArray<WizardStep>;

/** Files per request sent to /orders/import/preview. Must be ≤ server FilesInterceptor limit (100). */
const BATCH_SIZE = 20;
/** Orders per request sent to /orders/import/commit. Keeps JSON body well under NestJS's 1 MB limit. */
const COMMIT_BATCH_SIZE = 200;

type BatchStatus = 'pending' | 'processing' | 'done' | 'error';

interface BatchState {
    id: string;
    index: number;
    fileCount: number;
    status: BatchStatus;
    parsedCount?: number;
    fileErrorCount?: number;
    error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FileTypeIcon({ filename }: { filename: string }) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
        return <FilePdfIcon size={14} weight="fill" className="shrink-0 text-error-500" />;
    }
    if (ext === 'csv') {
        return <FileCsvIcon size={14} weight="fill" className="shrink-0 text-success-500" />;
    }

    return <FileXlsIcon size={14} weight="fill" className="shrink-0 text-secondary-500" />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OrdersImportPage() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const i18n = useTranslations();
    const userRole = user?.role?.name;
    const isRestricted = userRole === 'technician' || userRole === 'admin';

    const stepperSteps = useMemo(
        () => [
            { id: 'upload', label: i18n('pages.ordersImport.wizard.upload') },
            { id: 'review', label: i18n('pages.ordersImport.wizard.review') },
            { id: 'done', label: i18n('pages.ordersImport.wizard.done') },
        ],
        [i18n]
    );

    const { current: step, currentIndex, goTo, reset: resetStep } = useStepper(WIZARD_STEP_IDS);
    const [files, setFiles] = useState<Array<File>>([]);
    const [batches, setBatches] = useState<Array<BatchState>>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<OrdersImportPreviewResponse | null>(null);
    const [localOrders, setLocalOrders] = useState<Array<OrderImportPreviewItem>>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [error, setError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isCommitting, setIsCommitting] = useState(false);
    const [commitProgress, setCommitProgress] = useState<{ done: number; total: number } | null>(null);
    const [commitResult, setCommitResult] = useState<{ created: number; skipped: number } | null>(null);
    const [editingOrder, setEditingOrder] = useState<OrderImportPreviewItem | null>(null);

    useEffect(() => {
        if (preview) {
            setLocalOrders(
                preview.orders.map((order) => ({
                    ...order,
                    data: { ...order.data, id: order.data.id || crypto.randomUUID() },
                    errors: order.errors ?? [],
                    warnings: order.warnings ?? [],
                }))
            );
            setRowSelection({});
            setPagination((p) => ({ ...p, pageIndex: 0 }));
        }
    }, [preview]);

    // ── File management ────────────────────────────────────────────────────────

    const addFiles = (newFiles: Array<File>) => {
        setFiles((prev) => {
            const existing = new Set(prev.map((f) => f.name));

            return [...prev, ...newFiles.filter((f) => !existing.has(f.name))];
        });
        setError(null);
    };

    const removeFile = (name: string) => {
        setFiles((prev) => prev.filter((f) => f.name !== name));
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const accepted = Array.from(e.dataTransfer.files).filter((f) => /\.(csv|xlsx|xls|pdf)$/i.test(f.name));
        addFiles(accepted);
    };

    // ── Wizard navigation ──────────────────────────────────────────────────────

    const parseFiles = async () => {
        if (files.length === 0) {
            setError(i18n('pages.ordersImport.errors.noFiles'));

            return;
        }
        setError(null);
        setIsParsing(true);
        setCommitResult(null);

        // ── Single batch (≤ BATCH_SIZE files) ─────────────────────────────────
        if (files.length <= BATCH_SIZE) {
            try {
                const result = await previewOrdersImport(files);
                setPreview(result);
                goTo('review');
            } catch (err) {
                setError(err instanceof Error ? err.message : i18n('pages.ordersImport.errors.parseFiles'));
            } finally {
                setIsParsing(false);
            }

            return;
        }

        // ── Multi-batch mode ───────────────────────────────────────────────────
        const groups: Array<Array<File>> = [];
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
            groups.push(files.slice(i, i + BATCH_SIZE));
        }

        const initialBatches: Array<BatchState> = groups.map((group, i) => ({
            id: crypto.randomUUID(),
            index: i + 1,
            fileCount: group.length,
            status: 'pending',
        }));
        setBatches(initialBatches);

        const allOrders: Array<OrderImportPreviewItem> = [];
        const allFileErrors: Array<{ fileName: string; message: string }> = [];

        for (let i = 0; i < groups.length; i++) {
            const batchId = initialBatches[i]!.id;

            setBatches((prev) => prev.map((b) => (b.id === batchId ? { ...b, status: 'processing' } : b)));

            try {
                const result = await previewOrdersImport(groups[i]!);
                allOrders.push(...result.orders);
                allFileErrors.push(...result.fileErrors);
                setBatches((prev) =>
                    prev.map((b) =>
                        b.id === batchId
                            ? {
                                  ...b,
                                  status: 'done',
                                  parsedCount: result.orders.length,
                                  fileErrorCount: result.fileErrors.length,
                              }
                            : b
                    )
                );
            } catch (err) {
                setBatches((prev) =>
                    prev.map((b) =>
                        b.id === batchId
                            ? {
                                  ...b,
                                  status: 'error',
                                  error:
                                      err instanceof Error ? err.message : i18n('pages.ordersImport.errors.parseFiles'),
                              }
                            : b
                    )
                );
            }
        }

        setIsParsing(false);
        setPreview({ orders: allOrders, fileErrors: allFileErrors });
        goTo('review');
    };

    const resetWizard = () => {
        resetStep();
        setFiles([]);
        setBatches([]);
        setPreview(null);
        setLocalOrders([]);
        setRowSelection({});
        setCommitResult(null);
        setError(null);
        setEditingOrder(null);
    };

    const handleSaveOrder = (updated: OrderImportPreviewItem) => {
        setLocalOrders((prev) => prev.map((o) => (o.data.id === updated.data.id ? updated : o)));
    };

    const commitOrders = async (selectedOnly = false) => {
        if (localOrders.length === 0) {
            return;
        }

        let selectedIndices: Set<number> | null = null;
        let ordersToProcess = localOrders;

        if (selectedOnly) {
            selectedIndices = new Set(
                Object.entries(rowSelection)
                    .filter(([, v]) => v)
                    .map(([k]) => Number(k))
            );
            ordersToProcess = localOrders.filter((_, i) => selectedIndices!.has(i));
        }

        const validOrders = ordersToProcess.filter((o) => !o.errors || o.errors.length === 0);
        if (validOrders.length === 0) {
            setError(i18n('pages.ordersImport.errors.noValidOrders'));

            return;
        }

        // Split into batches to stay under the server's body-size limit
        const allOrderData = validOrders.map((o) => o.data);
        const commitBatches: Array<typeof allOrderData> = [];
        for (let i = 0; i < allOrderData.length; i += COMMIT_BATCH_SIZE) {
            commitBatches.push(allOrderData.slice(i, i + COMMIT_BATCH_SIZE));
        }

        setError(null);
        setIsCommitting(true);
        setCommitProgress({ done: 0, total: commitBatches.length });
        try {
            let totalCreated = 0;
            let totalSkipped = 0;
            for (let i = 0; i < commitBatches.length; i++) {
                const response = await commitOrdersImport(commitBatches[i]!);
                totalCreated += response.createdCount;
                totalSkipped += response.skippedCount;
                setCommitProgress({ done: i + 1, total: commitBatches.length });
            }

            setCommitResult({ created: totalCreated, skipped: totalSkipped });
            queryClient.invalidateQueries({ queryKey: ['orders'] });

            if (selectedOnly && selectedIndices) {
                const validSelectedIndices = new Set(
                    localOrders
                        .map((o, i) => ({ o, i }))
                        .filter(({ o, i }) => selectedIndices!.has(i) && (!o.errors || o.errors.length === 0))
                        .map(({ i }) => i)
                );
                setLocalOrders((prev) => prev.filter((_, i) => !validSelectedIndices.has(i)));
            } else {
                setLocalOrders((prev) => prev.filter((o) => o.errors && o.errors.length > 0));
            }

            setRowSelection({});
            goTo('done');
        } catch (err) {
            setError(err instanceof Error ? err.message : i18n('pages.ordersImport.errors.importFailed'));
        } finally {
            setIsCommitting(false);
            setCommitProgress(null);
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

    // ── Derived state ──────────────────────────────────────────────────────────

    const selectedCount = useMemo(() => Object.values(rowSelection).filter(Boolean).length, [rowSelection]);

    const summary = useMemo(() => {
        if (localOrders.length === 0) {
            return null;
        }
        const invalid = localOrders.filter((o) => o.errors && o.errors.length > 0).length;

        return { total: localOrders.length, valid: localOrders.length - invalid, invalid };
    }, [localOrders]);

    const filterConfig = useMemo<FilterConfig>(
        () => ({
            issues: {
                options: [
                    { label: i18n('pages.ordersImport.filter.ok'), value: 'ok' },
                    { label: i18n('pages.ordersImport.filter.error'), value: 'error' },
                    { label: i18n('pages.ordersImport.filter.warning'), value: 'warning' },
                ],
            },
        }),
        [i18n]
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
                cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
            },
            {
                id: 'counter',
                size: 52,
                meta: { fixed: true },
                header: () => <span className="text-neutral-900">#</span>,
                cell: ({ row }) => <span className="text-xs tabular-nums text-neutral-900">{row.index + 1}</span>,
            },
            {
                id: 'source',
                size: 200,
                header: i18n('pages.ordersImport.table.source'),
                cell: ({ row }) => {
                    const hasErrors = !!row.original.errors?.length;
                    const hasWarnings = !!row.original.warnings?.length;

                    return (
                        <div className="flex w-full min-w-0 items-center gap-2">
                            <div className="shrink-0">
                                {hasErrors ? (
                                    <WarningCircleIcon size={15} weight="fill" className="text-error-500" />
                                ) : hasWarnings ? (
                                    <WarningIcon size={15} weight="fill" className="text-secondary-500" />
                                ) : (
                                    <CheckCircleIcon size={15} weight="fill" className="text-success-500" />
                                )}
                            </div>
                            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                                <FileTypeIcon filename={row.original.fileName} />
                                <span className="truncate text-xs font-medium" title={row.original.fileName}>
                                    {row.original.fileName}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'order',
                header: i18n('pages.ordersImport.table.order'),
                cell: ({ row }) => {
                    const data = row.original.data;

                    return (
                        <div className="w-full space-y-0.5">
                            <p className="font-mono text-xs font-semibold text-neutral-800">{data.id || '—'}</p>
                            <p className="text-xs text-neutral-900">{data.type || '—'}</p>
                        </div>
                    );
                },
            },
            {
                id: 'client',
                header: i18n('pages.ordersImport.table.client'),
                cell: ({ row }) => {
                    const data = row.original.data;
                    const fullName = [data.clientName, data.clientLastName].filter(Boolean).join(' ') || '—';

                    return (
                        <div className="w-full space-y-0.5">
                            <p className="text-xs font-semibold text-neutral-800">{fullName}</p>
                            <p className="font-mono text-xs text-neutral-900">{data.clientAccount || '—'}</p>
                            {data.meterId && <p className="font-mono text-xs text-neutral-900">{data.meterId}</p>}
                            {data.address && (
                                <p className="truncate text-xs text-neutral-900" title={data.address}>
                                    {data.address}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'issues',
                header: i18n('pages.ordersImport.table.issues'),
                filterFn: (row, _columnId, filterValue: string | undefined) => {
                    if (!filterValue) return true;
                    const hasErrors = !!row.original.errors?.length;
                    const hasWarnings = !!row.original.warnings?.length;
                    if (filterValue === 'error') return hasErrors;
                    if (filterValue === 'warning') return !hasErrors && hasWarnings;
                    if (filterValue === 'ok') return !hasErrors && !hasWarnings;
                    return true;
                },
                cell: ({ row }) => {
                    const errors = row.original.errors;
                    const warnings = row.original.warnings;

                    if (errors && errors.length > 0) {
                        return (
                            <div className="w-full space-y-1">
                                {errors.map((msg, i) => (
                                    <span
                                        key={i}
                                        className="block rounded bg-error-500/10 px-1.5 py-0.5 text-xs text-error-500"
                                    >
                                        {msg}
                                    </span>
                                ))}
                            </div>
                        );
                    }
                    if (warnings && warnings.length > 0) {
                        return (
                            <div className="w-full space-y-1">
                                {warnings.map((msg, i) => (
                                    <span
                                        key={i}
                                        className="block rounded bg-secondary-500/10 px-1.5 py-0.5 text-xs text-secondary-500"
                                    >
                                        {msg}
                                    </span>
                                ))}
                            </div>
                        );
                    }

                    return (
                        <span className="flex items-center gap-1 text-xs text-success-500">
                            <CheckCircleIcon size={14} weight="fill" />
                            {i18n('pages.ordersImport.ok')}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                size: 64,
                meta: { fixed: true },
                header: () => null,
                cell: ({ row }) => (
                    <button
                        type="button"
                        onClick={() => setEditingOrder(row.original)}
                        className="flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-neutral-900 transition hover:bg-neutral-700/60 hover:text-primary-500"
                        aria-label={i18n('pages.ordersImport.editOrderTitle')}
                    >
                        <PencilSimpleIcon size={16} weight="duotone" />
                    </button>
                ),
            },
        ],
        [i18n, setEditingOrder]
    );

    // ── Table setup ──────────────────────────────────────────────────────────

    const table = useReactTable({
        data: localOrders,
        columns,
        state: { rowSelection, pagination },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // ── Restricted access guard ────────────────────────────────────────────────

    if (isRestricted) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-600/60">
                <p className="text-neutral-900">{i18n('pages.ordersImport.restricted')}</p>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────────

    return (
        <Page id="orders-import" title={i18n('pages.ordersImport.title')} backRoute="/orders">
        <div className="space-y-5">

            {/* Step indicator */}
            <Stepper steps={stepperSteps} currentStep={currentIndex} />

            {/* ── Step 1: Upload ─────────────────────────────────────────────────────── */}
            {step === 'upload' && (
                <div className="space-y-3">
                    {/* Batch progress panel */}
                    {batches.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">
                                    {i18n('pages.ordersImport.batchingTitle', { total: batches.length })}
                                </p>
                                <span className="text-xs text-neutral-900">
                                    {i18n('pages.ordersImport.batchingProgress', {
                                        done: batches.filter((b) => b.status === 'done' || b.status === 'error').length,
                                        total: batches.length,
                                    })}
                                </span>
                            </div>
                            <div className="overflow-hidden rounded-lg border border-neutral-800 divide-y divide-neutral-800">
                                {batches.map((batch) => (
                                    <div key={batch.id} className="flex items-center gap-3 px-4 py-2.5">
                                        {/* Status icon */}
                                        <div className="shrink-0 w-4">
                                            {batch.status === 'pending' && (
                                                <ClockIcon size={15} className="text-neutral-900" />
                                            )}
                                            {batch.status === 'processing' && (
                                                <ArrowsClockwiseIcon
                                                    size={15}
                                                    className="animate-spin text-primary-500"
                                                />
                                            )}
                                            {batch.status === 'done' && (
                                                <CheckCircleIcon size={15} weight="fill" className="text-success-500" />
                                            )}
                                            {batch.status === 'error' && (
                                                <XCircleIcon size={15} weight="fill" className="text-error-500" />
                                            )}
                                        </div>
                                        {/* Label */}
                                        <span className="flex-1 text-sm font-medium">
                                            {i18n('pages.ordersImport.batchN', { n: batch.index })}
                                        </span>
                                        {/* File count */}
                                        <span className="text-xs text-neutral-900">
                                            {i18n('pages.ordersImport.batchFiles', { count: batch.fileCount })}
                                        </span>
                                        {/* Result */}
                                        {batch.status === 'done' && (
                                            <span className="text-xs text-success-500">
                                                {i18n('pages.ordersImport.batchOrders', {
                                                    count: batch.parsedCount ?? 0,
                                                })}
                                            </span>
                                        )}
                                        {batch.status === 'error' && (
                                            <span className="truncate text-xs text-error-500" title={batch.error}>
                                                {batch.error}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {error && <p className="text-xs text-error-500">{error}</p>}
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 space-y-1">
                                    {error && <p className="text-xs text-error-500">{error}</p>}
                                    {files.length > BATCH_SIZE && (
                                        <p className="text-xs text-neutral-900">
                                            {i18n('pages.ordersImport.willBatch', {
                                                count: files.length,
                                                batches: Math.ceil(files.length / BATCH_SIZE),
                                            })}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={parseFiles}
                                    disabled={isParsing || files.length === 0}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-md border border-primary-500 bg-primary-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <UploadSimpleIcon size={11} weight="duotone" />
                                    {isParsing
                                        ? i18n('pages.ordersImport.parsing')
                                        : i18n('pages.ordersImport.parseFiles')}
                                </button>
                            </div>

                            <FileUploader
                                files={files}
                                isDragging={isDragging}
                                onAdd={addFiles}
                                onRemove={removeFile}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={onDrop}
                            />
                        </>
                    )}
                </div>
            )}

            {/* ── Step 2: Review ────────────────────────────────────────────────────── */}
            {step === 'review' && (
                <div className="space-y-4">
                    {/* File-level errors */}
                    {preview && preview.fileErrors.length > 0 && (
                        <div className="rounded-lg border border-secondary-500/30 bg-secondary-500/10 px-4 py-3 text-sm text-secondary-500">
                            <p className="mb-2 font-semibold">{i18n('pages.ordersImport.fileWarnings')}</p>
                            <div className="space-y-1">
                                {preview.fileErrors.map((fe) => (
                                    <div key={fe.fileName} className="flex items-start gap-2">
                                        <WarningIcon size={14} weight="fill" className="mt-0.5 shrink-0" />
                                        <span>
                                            <span className="font-medium">{fe.fileName}:</span> {fe.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unified action toolbar */}
                    {summary && (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Left: stats */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                <span className="flex items-center gap-2">
                                    <ListBulletsIcon size={14} weight="duotone" className="text-neutral-900" />
                                    <span className="font-semibold">{summary.total}</span>
                                    <span className="text-xs text-neutral-900">
                                        {i18n('pages.ordersImport.totalParsed')}
                                    </span>
                                </span>
                                <span className="h-3 w-px bg-neutral-800" />
                                <span className="flex items-center gap-2">
                                    <CheckCircleIcon size={14} weight="duotone" className="text-success-500" />
                                    <span className="font-semibold text-success-500">{summary.valid}</span>
                                    <span className="text-xs text-neutral-900">
                                        {i18n('pages.ordersImport.validOrders')}
                                    </span>
                                </span>
                                <span className="h-3 w-px bg-neutral-800" />
                                <span className="flex items-center gap-2">
                                    <WarningCircleIcon
                                        size={14}
                                        weight="duotone"
                                        className={summary.invalid > 0 ? 'text-secondary-500' : 'text-neutral-900'}
                                    />
                                    <span
                                        className={classnames('font-semibold', {
                                            'text-secondary-500': summary.invalid > 0,
                                        })}
                                    >
                                        {summary.invalid}
                                    </span>
                                    <span className="text-xs text-neutral-900">
                                        {i18n('pages.ordersImport.needsReview')}
                                    </span>
                                </span>
                            </div>

                            {/* Right: filter toggle + actions */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                {selectedCount > 0 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => commitOrders(true)}
                                            disabled={isCommitting}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-primary-500 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-500 transition hover:bg-primary-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <CheckSquareIcon size={11} weight="duotone" />
                                            {i18n('pages.ordersImport.importSelected', { count: selectedCount })}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeSelected}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-800 px-3 py-1 text-xs font-medium text-neutral-900 transition hover:border-error-500/50 hover:text-error-500"
                                        >
                                            <TrashIcon size={11} weight="duotone" />
                                            {i18n('pages.ordersImport.removeFromBatch')}
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => commitOrders(false)}
                                    disabled={isCommitting || summary.valid === 0}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-md border border-primary-500 bg-primary-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <UploadSimpleIcon size={11} weight="duotone" />
                                    {isCommitting && commitProgress
                                        ? i18n('pages.ordersImport.commitBatching', {
                                              done: commitProgress.done,
                                              total: commitProgress.total,
                                          })
                                        : isCommitting
                                          ? i18n('pages.ordersImport.importing')
                                          : i18n('pages.ordersImport.importValid')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetWizard}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-800 px-3 py-1 text-xs font-medium text-neutral-900 transition hover:border-neutral-700 hover:text-neutral-800"
                                >
                                    <XIcon size={11} />
                                    {i18n('pages.ordersImport.cancel')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Preview table */}
                    <div className="overflow-hidden rounded-lg border border-neutral-800">
                        <Table table={table} total={localOrders.length} filterConfig={filterConfig} />
                    </div>

                    <OrderEditModal
                        order={editingOrder}
                        isOpen={editingOrder !== null}
                        onClose={() => setEditingOrder(null)}
                        onSave={handleSaveOrder}
                    />

                    {error && (
                        <div className="rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-500">
                            {error}
                        </div>
                    )}
                </div>
            )}

            {/* ── Step 3: Done ──────────────────────────────────────────────────────── */}
            {step === 'done' && (
                <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-neutral-800 bg-neutral-600/60 px-6 py-16">
                    <div className="rounded-full bg-success-500/20 p-5">
                        <CheckCircleIcon size={52} weight="fill" className="text-success-500" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold">
                            {i18n('pages.ordersImport.importedSuccess', { count: commitResult?.created ?? 0 })}
                        </h2>
                        {commitResult && commitResult.skipped > 0 && (
                            <p className="mt-1 text-sm text-neutral-900">
                                {i18n('pages.ordersImport.importedSkipped', { count: commitResult.skipped })}
                            </p>
                        )}
                        <p className="mt-1 text-sm text-neutral-900">{i18n('pages.ordersImport.doneSubtitle')}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button variant="outline" icon={UploadSimpleIcon} onClick={resetWizard}>
                            {i18n('pages.ordersImport.importMoreFiles')}
                        </Button>
                        <Button icon={ArrowRightIcon} as="a" to="/orders">
                            {i18n('pages.ordersImport.goToOrders')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
        </Page>
    );
}
