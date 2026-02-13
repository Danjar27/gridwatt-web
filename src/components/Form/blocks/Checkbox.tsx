import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import type { InputProps } from '../Form.interface';

const Checkbox: FC<InputProps & { label?: string }> = ({ name, rules, disabled, label }) => {
    const { register } = useFormContext();

    return (
        <label className="flex items-center gap-2 text-sm">
            <input
                id={name}
                type="checkbox"
                disabled={disabled}
                className="h-4 w-4 rounded border-neutral-300"
                {...register(name, rules)}
            />
            {label && <span>{label}</span>}
        </label>
    );
};

export default Checkbox;
