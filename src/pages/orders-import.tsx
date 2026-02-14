import { useState } from 'react';
import { AlertTriangle, CheckCircle, UploadCloud } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, OrdersImportPreviewResponse, OrderImportPreviewItem } from '@/lib/api-client';
import { classnames } from '@utils/classnames.ts';
import { useAuthContext } from '@context/auth/context.ts';

export function OrdersImportPage() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const userRole = user?.role?.name;
    const isRestricted = userRole === 'technician';

    const [files, setFiles] = useState<File[]>([]);
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
            setError('Select at least one file to parse.');
            return;
        }

        setError(null);
        setIsParsing(true);
        setCommitResult(null);

        try {
            const result = await apiClient.previewOrdersImport(files);
            setPreview(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse files.');
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
            setError('No valid orders to import.');
            return;
        }
        setError(null);
        setIsCommitting(true);
        try {
            const response = await apiClient.commitOrdersImport(validOrders.map((order) => order.data));
            setCommitResult(response.createdCount);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import orders.');
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
                <p className="text-muted-foreground">You do not have access to import orders.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Import Orders</h1>
                <p className="text-muted-foreground">Upload CSV, Excel, XML, or PDF files to create orders in bulk.</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="text-sm font-medium">Select files</div>
                        <p className="text-sm text-muted-foreground">Supported: .csv, .xlsx, .xls, .xml, .pdf</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary">
                        <UploadCloud className="h-4 w-4" />
                        Choose files
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
                        {isParsing ? 'Parsing...' : 'Parse files'}
                    </button>
                    {preview && (
                        <button
                            type="button"
                            onClick={commitOrders}
                            disabled={isCommitting}
                            className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCommitting ? 'Importing...' : 'Import valid orders'}
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
                        {commitResult} orders imported successfully.
                    </div>
                )}
            </div>

            {preview && (
                <div className="space-y-4">
                    {preview.fileErrors.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <div className="mb-2 font-medium">File warnings</div>
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
                                <div className="text-sm text-muted-foreground">Total parsed</div>
                                <div className="text-xl font-semibold">{summary.total}</div>
                            </div>
                            <div className="rounded-lg border bg-card px-4 py-3">
                                <div className="text-sm text-muted-foreground">Valid orders</div>
                                <div className="text-xl font-semibold">{summary.total - summary.invalid}</div>
                            </div>
                            <div className="rounded-lg border bg-card px-4 py-3">
                                <div className="text-sm text-muted-foreground">Needs review</div>
                                <div className="text-xl font-semibold">{summary.invalid}</div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Source</th>
                                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                                    <th className="px-4 py-3 text-left font-medium">Account / Meter</th>
                                    <th className="px-4 py-3 text-left font-medium">Service</th>
                                    <th className="px-4 py-3 text-left font-medium">Issue Date</th>
                                    <th className="px-4 py-3 text-left font-medium">Issues</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {preview.orders.map((order, index) => (
                                    <ImportRow
                                        key={`${order.fileName}-${order.rowNumber || index}`}
                                        order={order}
                                        index={index}
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
    index,
    edits,
    onEdit,
}: {
    order: OrderImportPreviewItem;
    index: number;
    edits: Partial<OrderImportPreviewItem['data']>;
    onEdit: (field: string, value: string) => void;
}) {
    const hasErrors = !!order.errors && order.errors.length > 0;
    const hasWarnings = !!order.warnings && order.warnings.length > 0;
    // Editable fields: firstName, lastName, email, phone, accountNumber, meterNumber, serviceType, orderStatus, issueDate, issueTime
    const editableFields = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'accountNumber',
        'meterNumber',
        'serviceType',
        'orderStatus',
        'issueDate',
        'issueTime',
    ];
    const getValue = (field: string) => {
        return (edits as Record<string, unknown>)[field] !== undefined
            ? (edits as Record<string, unknown>)[field]
            : (order.data as Record<string, unknown>)[field] || '';
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
                <div className="text-xs text-muted-foreground">Row {order.rowNumber ?? 'n/a'}</div>
            </td>
            <td className="px-4 py-3 align-top">
                <input
                    className="mb-1 w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('firstName')}
                    onChange={(e) => onEdit('firstName', e.target.value)}
                    placeholder="First Name"
                />
                <input
                    className="w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('lastName')}
                    onChange={(e) => onEdit('lastName', e.target.value)}
                    placeholder="Last Name"
                />
                <input
                    className="mt-1 w-full rounded border px-1 py-0.5 text-xs"
                    value={getValue('email')}
                    onChange={(e) => onEdit('email', e.target.value)}
                    placeholder="Email"
                />
                <input
                    className="mt-1 w-full rounded border px-1 py-0.5 text-xs"
                    value={getValue('phone')}
                    onChange={(e) => onEdit('phone', e.target.value)}
                    placeholder="Phone"
                />
            </td>
            <td className="px-4 py-3 align-top">
                <input
                    className="mb-1 w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('accountNumber')}
                    onChange={(e) => onEdit('accountNumber', e.target.value)}
                    placeholder="Account Number"
                />
                <input
                    className="w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('meterNumber')}
                    onChange={(e) => onEdit('meterNumber', e.target.value)}
                    placeholder="Meter Number"
                />
            </td>
            <td className="px-4 py-3 align-top">
                <input
                    className="mb-1 w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('serviceType')}
                    onChange={(e) => onEdit('serviceType', e.target.value)}
                    placeholder="Service Type"
                />
                <input
                    className="w-full rounded border px-1 py-0.5 text-sm"
                    value={getValue('orderStatus')}
                    onChange={(e) => onEdit('orderStatus', e.target.value)}
                    placeholder="Order Status"
                />
            </td>
            <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                <input
                    className="mb-1 w-full rounded border px-1 py-0.5 text-xs"
                    value={getValue('issueDate')}
                    onChange={(e) => onEdit('issueDate', e.target.value)}
                    placeholder="Issue Date"
                />
                <input
                    className="w-full rounded border px-1 py-0.5 text-xs"
                    value={getValue('issueTime')}
                    onChange={(e) => onEdit('issueTime', e.target.value)}
                    placeholder="Issue Time"
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
                {!hasErrors && !hasWarnings && <div className="text-xs text-muted-foreground">OK</div>}
            </td>
        </tr>
    );
}
