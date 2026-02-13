import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import type { RegisterOptions } from 'react-hook-form';
import { INPUT_CLASS } from '../utils/constants';

interface PrefixedIdInputProps {
    name: string;
    prefix: string;
    rules?: RegisterOptions;
    disabled?: boolean;
    autoFocus?: boolean;
}

const PrefixedIdInput: FC<PrefixedIdInputProps> = ({ name, prefix, rules, disabled, autoFocus }) => {
    const { register } = useFormContext();

    return (
        <div className="flex">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-neutral-800 bg-neutral-700 px-3 text-sm font-mono text-neutral-900">
                {prefix}-
            </span>
            <input
                id={name}
                type="text"
                inputMode="numeric"
                placeholder="0001"
                disabled={disabled}
                autoFocus={autoFocus}
                className={`${INPUT_CLASS} rounded-l-none`}
                {...register(name, rules)}
            />
        </div>
    );
};

export default PrefixedIdInput;
