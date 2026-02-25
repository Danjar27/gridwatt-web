import type { HeaderGroup, Table } from '@tanstack/react-table';
import type { ReactNode } from 'react';

export interface FilterOption {
    label: string;
    value: string;
}

export interface ColumnFilterConfig {
    options: Array<FilterOption> | (() => Promise<Array<FilterOption>>);
    paramKey?: string;
}

export type FilterConfig = Record<string, ColumnFilterConfig>;

export interface TableProps<T = unknown> {
    table: Table<T>;
    isLoading?: boolean;
    columns?: Array<ReactNode>;
    total: number;
    filterConfig?: FilterConfig;
}

export interface RowProps {
    row: Array<ReactNode>;
}

export interface PaginationProps<T = unknown> {
    table: Table<T>;
    total: number;
}

export interface HeaderProps<T = unknown> {
    headerGroups: Array<HeaderGroup<T>>;
    filterConfig?: FilterConfig;
}

export interface StepperProps {
    selected: number;
    total: number;
    onSelect: (step: number) => void;
    onPrevious: () => void;
    onNext: () => void;
    hasPrevious: boolean;
    hasNext: boolean;
}
