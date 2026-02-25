import type { FC, InputHTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';
import { classnames } from '@utils/classnames.ts';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    indeterminate?: boolean;
}

const Checkbox: FC<CheckboxProps> = ({ indeterminate, className, checked, ...props }) => {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate ?? false;
        }
    }, [indeterminate]);

    const isChecked = checked;
    const isIndeterminate = indeterminate && !isChecked;

    return (
        <label className="group inline-flex cursor-pointer items-center align-middle">
            <input ref={ref} type="checkbox" checked={checked} className="peer sr-only" {...props} />
            <span
                className={classnames(
                    'relative flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-sm border-2 transition-all duration-150 select-none',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-1',
                    {
                        'border-primary-500 bg-primary-500': isChecked || isIndeterminate,
                        'border-neutral-800 bg-transparent group-hover:border-primary-500/60':
                            !isChecked && !isIndeterminate,
                    },
                    className
                )}
            >
                {isChecked && (
                    <svg
                        viewBox="0 0 12 10"
                        className="h-[9px] w-[9px] fill-none stroke-white stroke-[2.5px]"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="1,5 4.5,8.5 11,1" />
                    </svg>
                )}
                {isIndeterminate && <span className="h-[2px] w-[9px] rounded-full bg-white" />}
            </span>
        </label>
    );
};

export default Checkbox;
