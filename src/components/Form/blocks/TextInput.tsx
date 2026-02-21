import type { InputProps } from '../Form.interface';
import type { FC } from 'react';

import { useFormContext } from 'react-hook-form';
import { classnames } from '@utils/classnames.ts';

const TextInput: FC<InputProps> = ({ name, rules, placeholder, disabled, className, autoFocus }) => {
    const { register } = useFormContext();

    return (
        <input
            id={name}
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={classnames(
                'w-full rounded border border-neutral-800 bg-neutral-600 px-3 py-2 text-sm overscroll-none',
                className
            )}
            {...register(name, rules)}
        />
    );
};

export default TextInput;
