export interface DropdownOption {
    label: string;
    value: string | number;
}

export interface DropdownProps {
    value: string | number;
    onChange: (value: string | number) => void;
    options: Array<DropdownOption>;
    disabled?: boolean;
}
