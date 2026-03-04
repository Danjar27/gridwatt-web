import type { DropdownProps } from '@components/Dropdown/Dropdown.interface.ts';
import type { FC } from 'react';

import { CaretDownIcon } from '@phosphor-icons/react';
import { classnames } from '@utils/classnames.ts';
import { useEffect, useRef, useState } from 'react';

const Dropdown: FC<DropdownProps> = ({ value, onChange, options, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', onMouseDown);

        return () => document.removeEventListener('mousedown', onMouseDown);
    }, []);

    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative w-full" ref={ref}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={classnames(
                    'w-full flex items-center justify-between gap-2',
                    'rounded-lg border border-neutral-800 bg-neutral-600 px-3 py-2 text-sm transition-colors',
                    'disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
                    isOpen && 'border-primary-500'
                )}
            >
                <span className={classnames(!selected || selected.value === '' ? 'text-neutral-900' : '')}>
                    {selected?.label ?? ''}
                </span>
                <CaretDownIcon
                    width={13}
                    height={13}
                    weight="bold"
                    className={classnames(
                        'shrink-0 text-neutral-900 transition-transform duration-150',
                        isOpen && 'rotate-180 text-primary-500'
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-neutral-600 border border-neutral-700 rounded-xl shadow-lg overflow-hidden py-1">
                    {options.map((option) => (
                        <button
                            key={String(option.value)}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={classnames(
                                'w-full flex items-center px-3 py-2 text-sm text-left transition-colors cursor-pointer',
                                'hover:bg-neutral-700',
                                option.value === value ? 'text-primary-500 font-medium' : 'text-neutral-900'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
