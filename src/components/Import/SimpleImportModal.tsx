import type { FC } from 'react';

import { UploadSimpleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/query-client';
import { useTranslations } from 'use-intl';
import { useRef, useState } from 'react';

import Window from '@components/Modal/blocks/Window';
import Modal from '@components/Modal/Modal';

interface ImportResult {
    created: number;
    updated: number;
    errors: Array<{ row: number; reason: string }>;
    total: number;
}

interface SimpleImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    queryKey: string;
    mutationFn: (file: File) => Promise<ImportResult>;
}

const SimpleImportModal: FC<SimpleImportModalProps> = ({ isOpen, onClose, title, queryKey, mutationFn }) => {
    const i18n = useTranslations();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const importMutation = useMutation({
        mutationFn: (f: File) => mutationFn(f),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: [queryKey] });
            setResult(data);
        },
        onError: (err: Error) => setError(err.message || i18n('errors.common')),
    });

    const handleClose = () => {
        setFile(null);
        setResult(null);
        setError(null);
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        setFile(selected);
        setResult(null);
        setError(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0] ?? null;
        if (dropped) {
            setFile(dropped);
            setResult(null);
            setError(null);
        }
    };

    const handleSubmit = () => {
        if (!file) {
            setError(i18n('import.noFile'));
            return;
        }
        importMutation.mutate(file);
    };

    return (
        <Modal id={`import-${queryKey}`} isOpen={isOpen} onOpen={() => {}} onClose={handleClose}>
            <Window title={title} className="w-full max-w-lg px-4" icon={UploadSimpleIcon}>
                {!result ? (
                    <div className="space-y-4">
                        {error && (
                            <div className="rounded border border-red-400 bg-red-900/30 px-3 py-2 text-sm text-red-400">
                                {error}
                            </div>
                        )}

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
                                onClick={handleSubmit}
                                disabled={importMutation.isPending || !file}
                                className="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
                            >
                                {importMutation.isPending ? '...' : i18n('import.submit')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="font-medium text-green-400">{i18n('import.success')}</p>

                        <div className="grid grid-cols-3 gap-3 text-center text-sm">
                            <div className="rounded bg-neutral-700 p-3">
                                <p className="text-lg font-bold text-primary-400">{result.created}</p>
                                <p className="text-neutral-400">{i18n('import.created')}</p>
                            </div>
                            <div className="rounded bg-neutral-700 p-3">
                                <p className="text-lg font-bold text-yellow-400">{result.updated}</p>
                                <p className="text-neutral-400">{i18n('import.updated')}</p>
                            </div>
                            <div className="rounded bg-neutral-700 p-3">
                                <p className="text-lg font-bold text-red-400">{result.errors.length}</p>
                                <p className="text-neutral-400">{i18n('import.errors')}</p>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <ul className="max-h-40 overflow-y-auto rounded border border-neutral-700 text-sm">
                                {result.errors.map((err, idx) => (
                                    <li key={idx} className="border-b border-neutral-700 px-3 py-2 text-red-400 last:border-0">
                                        Fila {err.row}: {err.reason}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
                            >
                                {i18n('literal.close')}
                            </button>
                        </div>
                    </div>
                )}
            </Window>
        </Modal>
    );
};

export default SimpleImportModal;
