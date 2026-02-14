import type { FieldValues, DefaultValues, UseFormReturn, RegisterOptions } from 'react-hook-form';
import type { ReactNode } from 'react';

export interface FormProps<T extends FieldValues> {
    onSubmit: (data: T) => void | Promise<void>;
    defaultValues?: DefaultValues<T>;
    children: ReactNode | ((methods: UseFormReturn<T>) => ReactNode);
    className?: string;
}

export interface FieldProps {
    name: string;
    label: string;
    required?: boolean;
    helpText?: string;
    children: ReactNode;
}

export interface InputProps {
    name: string;
    rules?: RegisterOptions;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    autoFocus?: boolean;
}

export interface SelectOption {
    label: string;
    value: string | number;
}

export interface SelectProps extends InputProps {
    options: Array<SelectOption>;
}

export interface NumberInputProps extends InputProps {
    step?: string;
    min?: number;
    max?: number;
}

export interface PrefixedIdInputProps {
    name: string;
    prefix: string;
    rules?: RegisterOptions;
    disabled?: boolean;
    autoFocus?: boolean;
}

export interface TextAreaProps extends InputProps {
    rows?: number;
}

export interface ActionsProps {
    submitLabel: string;
    onCancel?: () => void;
    isLoading?: boolean;
}
