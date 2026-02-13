import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import type { InputProps } from '../Form.interface';
import { INPUT_CLASS } from '../utils/constants';

const EmailInput: FC<InputProps> = ({ name, rules, placeholder, disabled, className, autoFocus }) => {
    const { register } = useFormContext();

    return (
        <input
            id={name}
            type="email"
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={className ?? INPUT_CLASS}
            {...register(name, rules)}
        />
    );
};

export default EmailInput;
