import type { ColumnDef, ColumnFiltersState, InitialTableState, PaginationState, Updater } from '@tanstack/react-table';
import type { PaginatedResponse } from '@interfaces/api.interface.ts';
import type { FilterConfig } from '@components/Table/Table.interface';

import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

interface UseServerPaginationOptions<T> {
    initialState?: InitialTableState;
    queryKey: Array<string>;
    fetchFn: (params: { limit: number; offset: number } & Record<string, any>) => Promise<PaginatedResponse<T>>;
    columns: Array<ColumnDef<T, any>>;
    defaultPageSize?: number;
    enabled?: boolean;
    extraParams?: Record<string, any>;
    filterConfig?: FilterConfig;
}

export function useServerPagination<T>({
    queryKey,
    fetchFn,
    columns,
    defaultPageSize = 10,
    enabled = true,
    extraParams,
    initialState,
    filterConfig,
}: UseServerPaginationOptions<T>) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: defaultPageSize,
    });

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const handleColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
        const next = typeof updater === 'function' ? updater(columnFilters) : updater;
        setColumnFilters(next);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const columnFilterParams = useMemo(() => {
        if (!filterConfig) {
            return {};
        }

        return columnFilters.reduce(
            (acc, { id, value }) => {
                const paramKey = filterConfig[id]?.paramKey ?? id;

                return { ...acc, [paramKey]: value };
            },
            {} as Record<string, any>
        );
    }, [columnFilters, filterConfig]);

    const { data: response, isLoading } = useQuery({
        queryKey: [...queryKey, pagination.pageIndex, pagination.pageSize, extraParams, columnFilters],
        queryFn: () =>
            fetchFn({
                limit: pagination.pageSize,
                offset: pagination.pageIndex * pagination.pageSize,
                ...extraParams,
                ...columnFilterParams,
            }),
        enabled,
    });

    const data = useMemo(() => response?.data ?? [], [response]);
    const total = response?.total ?? 0;

    const table = useReactTable({
        initialState,
        data,
        columns,
        pageCount: Math.ceil(total / pagination.pageSize),
        state: { pagination, columnFilters },
        onPaginationChange: setPagination,
        onColumnFiltersChange: handleColumnFiltersChange,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
    });

    return { table, isLoading, total, data };
}
