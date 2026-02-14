import type { InputProps } from '../Form.interface';
import { type FC, useState } from 'react';

import { useFormContext } from 'react-hook-form';
import { INPUT_CLASS } from '../utils/constants';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput: FC<InputProps> = ({ name, rules, placeholder, disabled, autoFocus }) => {
    const { register } = useFormContext();
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <input
                id={name}
                type={show ? 'text' : 'password'}
                placeholder={placeholder ?? '••••••••'}
                disabled={disabled}
                autoFocus={autoFocus}
                className={INPUT_CLASS}
                {...register(name, rules)}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
};

export default PasswordInput;
