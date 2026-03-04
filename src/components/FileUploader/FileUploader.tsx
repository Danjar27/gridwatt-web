import type { FileUploaderProps } from '@components/FileUploader/FileUploader.interface';

import { FileCsvIcon, FilePdfIcon, FileXlsIcon, PlusIcon, UploadSimpleIcon, XIcon } from '@phosphor-icons/react';
import { classnames } from '@utils/classnames.ts';
import { formatFileSize } from './utils/format';
import { useTranslations } from 'use-intl';
import { useRef } from 'react';

const FileTypeIcon = ({ filename }: { filename: string }) => {
    const ext = filename.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
        return <FilePdfIcon size={13} weight="fill" className="shrink-0 text-error-500" />;
    }
    if (ext === 'csv') {
        return <FileCsvIcon size={13} weight="fill" className="shrink-0 text-success-500" />;
    }

    return <FileXlsIcon size={13} weight="fill" className="shrink-0 text-secondary-500" />;
};

const FileUploader = ({
    files,
    isDragging,
    onAdd,
    onRemove,
    onDragOver,
    onDragLeave,
    onDrop,
}: FileUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const i18n = useTranslations();
    const hasFiles = files.length > 0;

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onAdd(Array.from(e.target.files ?? []));
        e.target.value = '';
    };

    const getUploadText = () => {
        if (isDragging) {
            return i18n('pages.ordersImport.dropHere');
        }
        if (hasFiles) {
            return i18n('pages.ordersImport.addMore');
        }

        return i18n('pages.ordersImport.selectFiles');
    };

    return (
        <div className="space-y-3">
            {/* ── Main panel ───────────────────────────────────────────── */}
            <div
                className={classnames('grid gap-3 transition-all duration-300', {
                    'grid-cols-1': !hasFiles,
                    'grid-cols-1 s768:grid-cols-[1fr_160px]': hasFiles,
                })}
            >
                {/* ── File list (only when files are staged) ───────────── */}
                {hasFiles && (
                    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-600/30">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-600/60 px-3.5 py-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold">
                                    {i18n('pages.ordersImport.filesSelected', { count: files.length })}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => files.forEach((f) => onRemove(f.name))}
                                className="cursor-pointer text-xs text-neutral-900 transition hover:text-error-500"
                            >
                                {i18n('pages.ordersImport.clearAll')}
                            </button>
                        </div>

                        {/* Rows */}
                        <ul className="max-h-52 divide-y divide-neutral-800 overflow-y-auto">
                            {files.map((file) => (
                                <li key={file.name} className="flex items-center gap-2.5 px-3.5 py-2.5">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-700/60">
                                        <FileTypeIcon filename={file.name} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium leading-tight">{file.name}</p>
                                        <p className="text-[10px] text-neutral-900">{formatFileSize(file.size)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(file.name)}
                                        className="shrink-0 rounded p-1 text-neutral-900 transition hover:bg-neutral-700 hover:text-error-500"
                                        aria-label={i18n('pages.ordersImport.removeFile')}
                                    >
                                        <XIcon size={11} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── Drop zone ────────────────────────────────────────── */}
                <div
                    role="presentation"
                    className={classnames(
                        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all duration-200',
                        {
                            /* condensed (right panel) */
                            'px-4 py-6': hasFiles,
                            /* full-width empty state */
                            'px-6 py-14': !hasFiles,
                        },
                        {
                            'border-primary-500 bg-primary-500/5': isDragging,
                            'border-neutral-800 bg-neutral-600/30 hover:border-primary-500/40 hover:bg-neutral-600/50':
                                !isDragging,
                        }
                    )}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    {/* Icon */}
                    <div
                        className={classnames('rounded-xl transition-colors', {
                            'p-2': hasFiles,
                            'p-3': !hasFiles,
                            'bg-primary-500/15': isDragging,
                            'bg-neutral-700/50': !isDragging,
                        })}
                    >
                        {hasFiles ? (
                            <PlusIcon
                                size={18}
                                weight="bold"
                                className={classnames('transition-colors', {
                                    'text-primary-500': isDragging,
                                    'text-neutral-900': !isDragging,
                                })}
                            />
                        ) : (
                            <UploadSimpleIcon
                                size={22}
                                weight="duotone"
                                className={classnames('transition-colors', {
                                    'text-primary-500': isDragging,
                                    'text-neutral-900': !isDragging,
                                })}
                            />
                        )}
                    </div>

                    {/* Text */}
                    <div className="text-center">
                        <p className={classnames('font-semibold', { 'text-xs': hasFiles, 'text-sm': !hasFiles })}>
                            {getUploadText()}
                        </p>
                        {!hasFiles && (
                            <p className="mt-0.5 text-xs text-neutral-900">{i18n('pages.ordersImport.supported')}</p>
                        )}
                    </div>

                    {/* Browse label */}
                    <label
                        className={classnames(
                            'cursor-pointer rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all',
                            {
                                'border-primary-500/60 text-primary-500': isDragging,
                                'border-neutral-800 text-neutral-900 hover:border-primary-500/60 hover:text-primary-500':
                                    !isDragging,
                            }
                        )}
                    >
                        {hasFiles ? i18n('pages.ordersImport.addMore') : i18n('pages.ordersImport.chooseFiles')}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".csv,.xlsx,.xls,.pdf"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

        </div>
    );
};

export default FileUploader;
