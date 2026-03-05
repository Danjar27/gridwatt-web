import type { FC } from 'react';

import { UploadSimpleIcon, CheckCircleIcon, WarningIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { useTranslations } from 'use-intl';
import { useRef, useState } from 'react';

import Window from '@components/Modal/blocks/Window';
import Modal from '@components/Modal/Modal';

interface PreviewRow {
    row: number;
    data: Record<string, unknown>;
    errors: Array<{ field: string; reason: string }>;
}

interface CommitResult {
    created: number;
    updated: number;
    errors: number;
    total: number;
}

export interface ColumnDef {
    key: string;
    label: string;
}

interface FullImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    queryKey: string;
    columns: Array<ColumnDef>;
    previewFn: (file: File) => Promise<Array<PreviewRow>>;
    commitFn: (rows: Array<Record<string, unknown>>) => Promise<CommitResult>;
}

type Step = 'upload' | 'review' | 'done';

const FullImportModal: FC<FullImportModalProps> = ({
    isOpen,
    onClose,
    title,
    queryKey,
    columns,
    previewFn,
    commitFn,
}) => {
    const i18n = useTranslations();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [previewRows, setPreviewRows] = useState<Array<PreviewRow>>([]);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [filterErrors, setFilterErrors] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [commitResult, setCommitResult] = useState<CommitResult | null>(null);

    const validRows = previewRows.filter((r) => r.errors.length === 0);
    const errorRows = previewRows.filter((r) => r.errors.length > 0);
    const displayedRows = filterErrors ? errorRows : previewRows;

    const previewMutation = useMutation({
        mutationFn: (f: File) => previewFn(f),
        onSuccess: (rows) => {
            setPreviewRows(rows);
            // Auto-select all valid rows
            setSelectedRows(new Set(rows.filter((r) => r.errors.length === 0).map((r) => r.row)));
            setStep('review');
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const commitMutation = useMutation({
        mutationFn: (rows: Array<Record<string, unknown>>) => commitFn(rows),
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({ queryKey: [queryKey] });
            setCommitResult(result);
            setStep('done');
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleClose = () => {
        setStep('upload');
        setFile(null);
        setPreviewRows([]);
        setSelectedRows(new Set());
        setFilterErrors(false);
        setError(null);
        setCommitResult(null);
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        setFile(selected);
        setError(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0] ?? null;
        if (dropped) {
            setFile(dropped);
            setError(null);
        }
    };

    const handlePreview = () => {
        if (!file) {
            setError(i18n('import.noFile'));

            return;
        }
        setError(null);
        previewMutation.mutate(file);
    };

    const handleCommit = () => {
        const rowsToCommit = previewRows
            .filter((r) => selectedRows.has(r.row) && r.errors.length === 0)
            .map((r) => r.data);
        setError(null);
        commitMutation.mutate(rowsToCommit);
    };

    const toggleRow = (rowNum: number) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            if (next.has(rowNum)) {
                next.delete(rowNum);
            } else {
                next.add(rowNum);
            }

            return next;
        });
    };

    const toggleAll = () => {
        if (selectedRows.size === validRows.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(validRows.map((r) => r.row)));
        }
    };

    const steps: Array<Step> = ['upload', 'review', 'done'];
    const stepLabels: Record<Step, string> = {
        upload: i18n('import.wizard.upload'),
        review: i18n('import.wizard.review'),
        done: i18n('import.wizard.done'),
    };

    return (
        <Modal id={`full-import-${queryKey}`} isOpen={isOpen} onOpen={() => {}} onClose={handleClose}>
            <Window title={title} className="w-full max-w-3xl px-4" icon={UploadSimpleIcon}>
                {/* Step indicator */}
                <div className="mb-6 flex items-center gap-2">
                    {steps.map((s, idx) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={[
                                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                                    s === step ? 'bg-primary-600 text-white' : '',
                                    steps.indexOf(step) > idx && s !== step ? 'bg-green-600 text-white' : '',
                                    s !== step && steps.indexOf(step) <= idx ? 'bg-neutral-700 text-neutral-400' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                {idx + 1}
                            </div>
                            <span className={`text-sm ${s === step ? 'font-medium text-white' : 'text-neutral-400'}`}>
                                {stepLabels[s]}
                            </span>
                            {idx < steps.length - 1 && <div className="mx-1 h-px w-8 bg-neutral-700" />}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mb-4 rounded border border-red-400 bg-red-900/30 px-3 py-2 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Upload step */}
                {step === 'upload' && (
                    <div className="space-y-4">
                        <div
                            className="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-neutral-600 px-6 py-10 text-center transition-colors hover:border-primary-500"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UploadSimpleIcon className="mb-2 text-neutral-400" size={32} />
                            {file ? (
                                <p className="text-sm font-medium text-primary-400">{file.name}</p>
                            ) : (
                                <p className="text-sm text-neutral-400">{i18n('import.hint')}</p>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xls,.xlsx"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded px-4 py-2 text-sm text-neutral-400 hover:text-white"
                            >
                                {i18n('literal.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handlePreview}
                                disabled={previewMutation.isPending || !file}
                                className="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
                            >
                                {previewMutation.isPending ? i18n('import.previewing') : i18n('import.preview')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Review step */}
                {step === 'review' && (
                    <div className="space-y-4">
                        {/* Stats bar */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="text-neutral-300">
                                {i18n('import.rowsFound', { count: previewRows.length })}
                            </span>
                            <span className="text-green-400">
                                {i18n('import.rowsValid', { count: validRows.length })}
                            </span>
                            {errorRows.length > 0 && (
                                <span className="text-red-400">
                                    {i18n('import.rowsWithErrors', { count: errorRows.length })}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => setFilterErrors((v) => !v)}
                                className="ml-auto rounded border border-neutral-600 px-3 py-1 text-xs text-neutral-300 hover:border-neutral-400"
                            >
                                {filterErrors ? i18n('import.showAll') : i18n('import.filterErrors')}
                            </button>
                        </div>

                        {/* Table */}
                        <div className="max-h-80 overflow-auto rounded border border-neutral-700">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-neutral-800">
                                    <tr>
                                        <th className="px-3 py-2 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.size === validRows.length && validRows.length > 0}
                                                onChange={toggleAll}
                                                className="cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-neutral-400">#</th>
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                className="px-3 py-2 text-left font-medium text-neutral-400"
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                        <th className="px-3 py-2 text-left font-medium text-neutral-400" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedRows.map((row) => {
                                        const hasError = row.errors.length > 0;

                                        return (
                                            <tr
                                                key={row.row}
                                                className={`border-t border-neutral-700 ${hasError ? 'bg-red-950/30' : 'hover:bg-neutral-800/50'}`}
                                            >
                                                <td className="px-3 py-2">
                                                    {!hasError && (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.has(row.row)}
                                                            onChange={() => toggleRow(row.row)}
                                                            className="cursor-pointer"
                                                        />
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 font-mono text-xs text-neutral-400">
                                                    {row.row}
                                                </td>
                                                {columns.map((col) => (
                                                    <td key={col.key} className="px-3 py-2 text-neutral-200">
                                                        {String(row.data[col.key] ?? '')}
                                                    </td>
                                                ))}
                                                <td className="px-3 py-2">
                                                    {hasError ? (
                                                        <span
                                                            className="cursor-help text-red-400"
                                                            title={row.errors
                                                                .map((e) => `${e.field}: ${e.reason}`)
                                                                .join(', ')}
                                                        >
                                                            <WarningIcon size={16} weight="duotone" />
                                                        </span>
                                                    ) : (
                                                        <CheckCircleIcon
                                                            size={16}
                                                            weight="duotone"
                                                            className="text-green-500"
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => setStep('upload')}
                                className="rounded px-4 py-2 text-sm text-neutral-400 hover:text-white"
                            >
                                {i18n('literal.back')}
                            </button>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-400">
                                    {selectedRows.size} / {validRows.length} seleccionados
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCommit}
                                    disabled={commitMutation.isPending || selectedRows.size === 0}
                                    className="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
                                >
                                    {commitMutation.isPending ? i18n('import.committing') : i18n('import.commit')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Done step */}
                {step === 'done' && commitResult && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircleIcon size={32} weight="duotone" className="text-green-400" />
                            <div>
                                <p className="font-medium text-white">{i18n('import.done.title')}</p>
                                <p className="text-sm text-neutral-400">{i18n('import.done.subtitle')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center text-sm">
                            <div className="rounded bg-neutral-700 p-3">
                                <p className="text-lg font-bold text-primary-400">{commitResult.created}</p>
                                <p className="text-neutral-400">{i18n('import.created')}</p>
                            </div>
                            <div className="rounded bg-neutral-700 p-3">
                                <p className="text-lg font-bold text-yellow-400">{commitResult.updated}</p>
                                <p className="text-neutral-400">{i18n('import.updated')}</p>
                            </div>
                            <div className="rounded bg-neutral-700 p-3">
                                <p className="text-lg font-bold text-red-400">{commitResult.errors}</p>
                                <p className="text-neutral-400">{i18n('import.errors')}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('upload');
                                    setFile(null);
                                    setPreviewRows([]);
                                    setSelectedRows(new Set());
                                    setCommitResult(null);
                                    setError(null);
                                }}
                                className="rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:border-neutral-400"
                            >
                                {i18n('import.done.importMore')}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
                            >
                                {i18n('import.done.close')}
                            </button>
                        </div>
                    </div>
                )}
            </Window>
        </Modal>
    );
};

export default FullImportModal;
