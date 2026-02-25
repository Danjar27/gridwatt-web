import type { FilterOption } from '@components/Table/Table.interface';

import { FunnelSimpleIcon, CheckIcon } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { classnames } from '@utils/classnames.ts';
import Visible from '@components/atoms/Visible.tsx';

interface FilterPopoverProps {
    options: Array<FilterOption> | (() => Promise<Array<FilterOption>>);
    value: string | undefined;
    onChange: (value: string | undefined) => void;
}

const FilterPopover = ({ options: optionsDef, value, onChange }: FilterPopoverProps) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Array<FilterOption>>([]);
    const [loading, setLoading] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!open) {
            return;
        }
        if (typeof optionsDef === 'function') {
            setLoading(true);
            optionsDef().then((opts) => {
                setOptions(opts);
                setLoading(false);
            });
        } else {
            setOptions(optionsDef);
        }
    }, [open]);

    useEffect(() => {
        if (!open || !buttonRef.current) {
            return;
        }
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({ top: rect.bottom + 4, left: rect.left });
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }
        const onMouseDown = (e: MouseEvent) => {
            if (!buttonRef.current?.contains(e.target as Node) && !popoverRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const isActive = !!value;

    const select = (val: string | undefined) => {
        onChange(val);
        setOpen(false);
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={classnames('rounded p-0.5 transition-colors hover:bg-neutral-700', {
                    'text-primary-500': isActive,
                    'text-neutral-900 opacity-50 hover:opacity-100': !isActive,
                })}
            >
                <FunnelSimpleIcon weight={isActive ? 'fill' : 'regular'} width={13} height={13} />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={popoverRef}
                        style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 9999 }}
                        className="text-black dark:text-white min-w-48 rounded-lg border border-neutral-800 bg-neutral-500 shadow-lg"
                    >
                        <div className="max-h-60 overflow-y-auto py-1">
                            <button
                                type="button"
                                onClick={() => select(undefined)}
                                className={classnames(
                                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-700 text-primary-500',
                                    {
                                        'bg-neutral-700/50 font-medium ': !value,
                                    }
                                )}
                            >
                                <span className="flex w-4 shrink-0 items-center justify-center">
                                    {!value && <CheckIcon weight="bold" width={11} height={11} />}
                                </span>
                                —
                            </button>

                            <Visible when={loading}>
                                <div className="flex items-center justify-center py-4">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                                </div>
                            </Visible>
                            <Visible when={!loading}>
                                {options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => select(opt.value)}
                                        className={classnames(
                                            'flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-neutral-700',
                                            {
                                                'bg-primary-500/10 font-medium text-primary-500': value === opt.value,
                                                'text-primary-500': value !== opt.value,
                                            }
                                        )}
                                    >
                                        <span className="flex w-4 shrink-0 items-center justify-center">
                                            {value === opt.value && <CheckIcon weight="bold" width={11} height={11} />}
                                        </span>
                                        {opt.label}
                                    </button>
                                ))}
                            </Visible>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default FilterPopover;
