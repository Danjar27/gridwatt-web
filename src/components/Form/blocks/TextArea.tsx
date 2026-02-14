import type { TextAreaProps } from '../Form.interface';
import type { FC } from 'react';

import { useFormContext } from 'react-hook-form';
import { INPUT_CLASS } from '../utils/constants';

const TextArea: FC<TextAreaProps> = ({ name, rules, placeholder, disabled, className, rows = 3 }) => {
    const { register } = useFormContext();

    return (
        <textarea
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={className ?? INPUT_CLASS}
            {...register(name, rules)}
        />
    );
};

export default TextArea;
