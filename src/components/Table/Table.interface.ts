import type { ReactNode } from 'react';

export interface TableProps {
    columns: Array<ReactNode>;
}

export interface RowProps {
    row: Array<ReactNode>;
}
