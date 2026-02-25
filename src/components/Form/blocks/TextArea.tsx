import type { TextAreaProps } from '../Form.interface';
import type { FC } from 'react';

import { useFormContext } from 'react-hook-form';
import { classnames } from '@utils/classnames.ts';

const TextArea: FC<TextAreaProps> = ({ name, rules, placeholder, disabled, className, rows = 3 }) => {
    const { register } = useFormContext();

    return (
        <textarea
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={classnames(
                'w-full rounded-lg border border-neutral-800 bg-neutral-600 px-3 py-2 text-sm focus:border-primary min-h-24 focus:ring-primary focus:outline-none overscroll-none no-scrollbar',
                className
            )}
            {...register(name, rules)}
        />
    );
};

export default TextArea;
