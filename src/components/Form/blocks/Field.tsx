import type { FieldProps } from '../Form.interface';
import type { FC } from 'react';

import { LABEL_CLASS, ERROR_CLASS } from '../utils/constants';
import { useFormContext } from 'react-hook-form';

const Field: FC<FieldProps> = ({ name, label, required, helpText, children }) => {
    const {
        formState: { errors },
    } = useFormContext();

    const error = errors[name];

    return (
        <div>
            <label htmlFor={name} className={LABEL_CLASS}>
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className={ERROR_CLASS}>{(error.message as string) || 'This field is required'}</p>}
            {helpText && !error && <p className="mt-1 text-xs text-muted-foreground">{helpText}</p>}
        </div>
    );
};

export default Field;
