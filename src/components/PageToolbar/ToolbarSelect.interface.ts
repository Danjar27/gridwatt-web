export interface ToolbarSelectOption<T> {
    label: string;
    value: T;
}

export interface ToolbarSelectProps<T> {
    value: T;
    onChange: (value: T) => void;
    options: Array<ToolbarSelectOption<T>>;
}
