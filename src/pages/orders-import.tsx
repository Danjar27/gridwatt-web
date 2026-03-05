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
    FunnelIcon,
    PencilSimpleIcon,
} from '@phosphor-icons/react';
import OrderEditModal from './OrdersImport/OrderEditModal';
import { useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/react-table';
import type { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';
import { commitOrdersImport, previewOrdersImport } from '@lib/api/orders.ts';
import { classnames } from '@utils/classnames.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';
import Button from '@components/Button/Button';
import FileUploader from '@components/FileUploader/FileUploader';
import Table from '@components/Table/Table';
import Checkbox from '@components/atoms/Checkbox';
import Stepper from '@components/Stepper/Stepper.tsx';
import { useStepper } from '@hooks/useStepper.ts';
import type { OrderImportPreviewItem, OrdersImportPreviewResponse } from '@interfaces/order.interface.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep = 'upload' | 'review' | 'done';

const WIZARD_STEP_IDS = ['upload', 'review', 'done'] as const satisfies ReadonlyArray<WizardStep>;

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
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<OrdersImportPreviewResponse | null>(null);
    const [localOrders, setLocalOrders] = useState<Array<OrderImportPreviewItem>>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [error, setError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isCommitting, setIsCommitting] = useState(false);
    const [commitResult, setCommitResult] = useState<number | null>(null);
    const [filterErrors, setFilterErrors] = useState(false);
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
        try {
            const result = await previewOrdersImport(files);
            setPreview(result);
            goTo('review');
        } catch (err) {
            setError(err instanceof Error ? err.message : i18n('pages.ordersImport.errors.parseFiles'));
        } finally {
            setIsParsing(false);
        }
    };

    const resetWizard = () => {
        resetStep();
        setFiles([]);
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

        setError(null);
        setIsCommitting(true);
        try {
            const response = await commitOrdersImport(validOrders.map((o) => o.data));
            setCommitResult(response.createdCount);
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

    const tableData = useMemo(
        () => (filterErrors ? localOrders.filter((o) => o.errors && o.errors.length > 0) : localOrders),
        [localOrders, filterErrors]
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
                id: 'source',
                size: 170,
                header: i18n('pages.ordersImport.table.source'),
                cell: ({ row }) => {
                    const hasErrors = !!row.original.errors?.length;
                    const hasWarnings = !!row.original.warnings?.length;

                    return (
                        <div className="flex w-full min-w-0 items-start gap-2">
                            <div className="mt-0.5 shrink-0">
                                {hasErrors ? (
                                    <WarningCircleIcon size={15} weight="fill" className="text-error-500" />
                                ) : hasWarnings ? (
                                    <WarningIcon size={15} weight="fill" className="text-secondary-500" />
                                ) : (
                                    <CheckCircleIcon size={15} weight="fill" className="text-success-500" />
                                )}
                            </div>
                            <div className="min-w-0 overflow-hidden">
                                <div className="flex items-center gap-1 overflow-hidden">
                                    <FileTypeIcon filename={row.original.fileName} />
                                    <span className="truncate text-xs font-medium" title={row.original.fileName}>
                                        {row.original.fileName}
                                    </span>
                                </div>
                                <div className="text-xs text-neutral-900">
                                    {i18n('pages.ordersImport.row')} {row.original.rowNumber ?? '—'}
                                </div>
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
                    const fullName = [data.clientName, data.clientLastName].filter(Boolean).join(' ') || '—';

                    return (
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-neutral-800">{fullName}</p>
                            <p className="text-xs text-neutral-900">{data.type || '—'}</p>
                            <p className="font-mono text-xs text-neutral-900">{data.clientAccount || '—'}</p>
                        </div>
                    );
                },
            },
            {
                id: 'issues',
                header: i18n('pages.ordersImport.table.issues'),
                cell: ({ row }) => {
                    const errors = row.original.errors;
                    const warnings = row.original.warnings;

                    if (errors && errors.length > 0) {
                        return (
                            <div className="space-y-1">
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
                            <div className="space-y-1">
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
        data: tableData,
        columns,
        state: { rowSelection, pagination },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
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
        <div className="space-y-5">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold">{i18n('pages.ordersImport.title')}</h1>
                <p className="mt-0.5 text-sm text-neutral-900">{i18n('pages.ordersImport.subtitle')}</p>
            </div>

            {/* Step indicator */}
            <Stepper steps={stepperSteps} currentStep={currentIndex} />

            {/* ── Step 1: Upload ─────────────────────────────────────────────────────── */}
            {step === 'upload' && (
                <div className="space-y-3">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">{error && <p className="text-xs text-error-500">{error}</p>}</div>
                        <button
                            type="button"
                            onClick={parseFiles}
                            disabled={isParsing || files.length === 0}
                            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-primary-500 bg-primary-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <UploadSimpleIcon size={11} weight="duotone" />
                            {isParsing ? i18n('pages.ordersImport.parsing') : i18n('pages.ordersImport.parseFiles')}
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
                                <button
                                    type="button"
                                    onClick={() => setFilterErrors((v) => !v)}
                                    className={classnames(
                                        'flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium transition',
                                        {
                                            'border-secondary-500 bg-secondary-500/10 text-secondary-500': filterErrors,
                                            'border-neutral-800 text-neutral-900 hover:border-neutral-700 hover:text-neutral-800':
                                                !filterErrors,
                                        }
                                    )}
                                >
                                    <FunnelIcon size={11} weight={filterErrors ? 'fill' : 'duotone'} />
                                    {filterErrors
                                        ? i18n('pages.ordersImport.showAll')
                                        : i18n('pages.ordersImport.filterErrors')}
                                </button>
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
                                    {isCommitting
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
                        <Table table={table} total={localOrders.length} />
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
                            {i18n('pages.ordersImport.importedSuccess', { count: commitResult ?? 0 })}
                        </h2>
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
    );
}
