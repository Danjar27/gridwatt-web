import { useState } from 'react';
import { AlertTriangle, CheckCircle, UploadCloud } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { OrdersImportPreviewResponse, OrderImportPreviewItem, OrderImportData } from '@/lib/api-client';
import { apiClient } from '@/lib/api-client';
import { classnames } from '@utils/classnames.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';

export function OrdersImportPage() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const i18n = useTranslations();
    const userRole = user?.role?.name;
    const isRestricted = userRole === 'technician' || userRole === 'admin';

    const [files, setFiles] = useState<Array<File>>([]);
    const [preview, setPreview] = useState<OrdersImportPreviewResponse | null>(null);
    // Track edits for each order (by index)
    const [edits, setEdits] = useState<Record<number, Partial<OrderImportPreviewItem['data']>>>({});
    const [error, setError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isCommitting, setIsCommitting] = useState(false);
    const [commitResult, setCommitResult] = useState<number | null>(null);

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
            const result = await apiClient.previewOrdersImport(files);
            setPreview(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : i18n('pages.ordersImport.errors.parseFiles'));
        } finally {
            setIsParsing(false);
        }
    };

    const commitOrders = async () => {
        if (!preview) {
            return;
        }
        // Apply edits to orders before filtering valid ones
        const editedOrders = preview.orders.map((order, idx) => ({
            ...order,
            data: { ...order.data, ...edits[idx] },
        }));
        const validOrders = editedOrders.filter((order) => !order.errors || order.errors.length === 0);
        if (validOrders.length === 0) {
            setError(i18n('pages.ordersImport.errors.noValidOrders'));

            return;
        }
        setError(null);
        setIsCommitting(true);
        try {
            const response = await apiClient.commitOrdersImport(validOrders.map((order) => order.data));
            setCommitResult(response.createdCount);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        } catch (err) {
            setError(err instanceof Error ? err.message : i18n('pages.ordersImport.errors.importFailed'));
        } finally {
            setIsCommitting(false);
        }
    };

    const summary = preview
        ? {
              total: preview.orders.length,
              invalid: preview.orders.filter((order) => order.errors && order.errors.length > 0).length,
          }
        : null;

    if (isRestricted) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border bg-card">
                <p className="text-muted-foreground">{i18n('pages.ordersImport.restricted')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{i18n('pages.ordersImport.title')}</h1>
                <p className="text-muted-foreground">{i18n('pages.ordersImport.subtitle')}</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="text-sm font-medium">{i18n('pages.ordersImport.selectFiles')}</div>
                        <p className="text-sm text-muted-foreground">{i18n('pages.ordersImport.supported')}</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary">
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
                    <div className="mt-4 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                        {files.map((file) => (
                            <div key={file.name}>{file.name}</div>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={parseFiles}
                        disabled={isParsing}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isParsing ? i18n('pages.ordersImport.parsing') : i18n('pages.ordersImport.parseFiles')}
                    </button>
                    {preview && (
                        <button
                            type="button"
                            onClick={commitOrders}
                            disabled={isCommitting}
                            className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCommitting ? i18n('pages.ordersImport.importing') : i18n('pages.ordersImport.importValid')}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {commitResult !== null && (
                    <div className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        {i18n('pages.ordersImport.importedSuccess', { count: commitResult })}
                    </div>
                )}
            </div>

            {preview && (
                <div className="space-y-4">
                    {preview.fileErrors.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <div className="mb-2 font-medium">{i18n('pages.ordersImport.fileWarnings')}</div>
                            {preview.fileErrors.map((fileError) => (
                                <div key={fileError.fileName}>
                                    {fileError.fileName}: {fileError.message}
                                </div>
                            ))}
                        </div>
                    )}

                    {summary && (
                        <div className="flex flex-wrap gap-4">
                            <div className="rounded-lg border bg-card px-4 py-3">
                                <div className="text-sm text-muted-foreground">{i18n('pages.ordersImport.totalParsed')}</div>
                                <div className="text-xl font-semibold">{summary.total}</div>
                            </div>
                            <div className="rounded-lg border bg-card px-4 py-3">
                                <div className="text-sm text-muted-foreground">{i18n('pages.ordersImport.validOrders')}</div>
                                <div className="text-xl font-semibold">{summary.total - summary.invalid}</div>
                            </div>
                            <div className="rounded-lg border bg-card px-4 py-3">
                                <div className="text-sm text-muted-foreground">{i18n('pages.ordersImport.needsReview')}</div>
                                <div className="text-xl font-semibold">{summary.invalid}</div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">{i18n('pages.ordersImport.table.source')}</th>
                                    <th className="px-4 py-3 text-left font-medium">{i18n('pages.ordersImport.table.customer')}</th>
                                    <th className="px-4 py-3 text-left font-medium">{i18n('pages.ordersImport.table.accountMeter')}</th>
                                    <th className="px-4 py-3 text-left font-medium">{i18n('pages.ordersImport.table.service')}</th>
                                    <th className="px-4 py-3 text-left font-medium">{i18n('pages.ordersImport.table.issueDate')}</th>
                                    <th className="px-4 py-3 text-left font-medium">{i18n('pages.ordersImport.table.issues')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {preview.orders.map((order, index) => (
                                    <ImportRow
                                        key={`${order.fileName}-${order.rowNumber || index}`}
                                        order={order}
                                        edits={edits[index] || {}}
                                        onEdit={(field, value) =>
                                            setEdits((prev) => ({
                                                ...prev,
                                                [index]: { ...prev[index], [field]: value },
                                            }))
                                        }
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// Editable row for import preview
function ImportRow({
    order,
    edits,
    onEdit,
}: {
    order: OrderImportPreviewItem;
    edits: Partial<OrderImportPreviewItem['data']>;
    onEdit: (field: string, value: string) => void;
}) {
    const i18n = useTranslations();
    const hasErrors = !!order.errors && order.errors.length > 0;
    const hasWarnings = !!order.warnings && order.warnings.length > 0;
    const getValue = (field: keyof OrderImportData): string => {
        const editValue = edits[field];
        const dataValue = order.data[field];
        if (editValue !== undefined) {
            return String(editValue);
        }
        if (dataValue !== undefined && dataValue !== null) {
            return String(dataValue);
        }

        return '';
    };

    return (
        <tr
            className={classnames('transition', {
                'bg-red-50': hasErrors,
                'bg-amber-50': !hasErrors && hasWarnings,
            })}
        >
            <td className="px-4 py-3 align-top">
                <div className="font-medium">{order.fileName}</div>
                <div className="text-xs text-muted-foreground">{i18n('pages.ordersImport.row')} {order.rowNumber ?? 'n/a'}</div>
            </td>
            <td className="px-4 py-3 align-top">
                <input
                    className="mb-1 w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('firstName')}
                    onChange={(e) => onEdit('firstName', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.firstName')}
                />
                <input
                    className="w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('lastName')}
                    onChange={(e) => onEdit('lastName', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.lastName')}
                />
                <input
                    className="mt-1 w-full rounded border px-1 py-0.5 text-xs"
                    value={getValue('email')}
                    onChange={(e) => onEdit('email', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.email')}
                />
                <input
                    className="mt-1 w-full rounded border px-1 py-0.5 text-xs"
                    value={getValue('phone')}
                    onChange={(e) => onEdit('phone', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.phone')}
                />
            </td>
            <td className="px-4 py-3 align-top">
                <input
                    className="mb-1 w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('accountNumber')}
                    onChange={(e) => onEdit('accountNumber', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.accountNumber')}
                />
                <input
                    className="w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('meterNumber')}
                    onChange={(e) => onEdit('meterNumber', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.meterNumber')}
                />
            </td>
            <td className="px-4 py-3 align-top">
                <input
                    className="mb-1 w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('serviceType')}
                    onChange={(e) => onEdit('serviceType', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.serviceType')}
                />
                <input
                    className="w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('orderStatus')}
                    onChange={(e) => onEdit('orderStatus', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.orderStatus')}
                />
            </td>
            <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                <input
                    className="mb-1 w-full rounded border px-1 py-0.5 text-xs"
                    value={getValue('issueDate')}
                    onChange={(e) => onEdit('issueDate', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.issueDate')}
                />
                <input
                    className="w-full rounded border px-1 py-0.5 text-xs"
                    value={getValue('issueTime')}
                    onChange={(e) => onEdit('issueTime', e.target.value)}
                    placeholder={i18n('pages.ordersImport.placeholders.issueTime')}
                />
            </td>
            <td className="px-4 py-3 align-top">
                {hasErrors && (
                    <div className="flex items-start gap-2 text-xs text-red-700">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
                        <div>{order.errors?.join(' ')}</div>
                    </div>
                )}
                {!hasErrors && hasWarnings && <div className="text-xs text-amber-700">{order.warnings?.join(' ')}</div>}
                {!hasErrors && !hasWarnings && <div className="text-xs text-muted-foreground">{i18n('pages.ordersImport.ok')}</div>}
            </td>
        </tr>
    );
}
