import type { ReactNode } from 'react';
import type { Table as TanStackTable } from '@tanstack/react-table';

export interface TableProps<T = unknown> {
    table: TanStackTable<T>;
    isLoading?: boolean;
    columns?: Array<ReactNode>;
}

export interface RowProps {
    row: Array<ReactNode>;
}

export interface PaginationProps {
    table: TanStackTable<any>;
    total: number;
}
