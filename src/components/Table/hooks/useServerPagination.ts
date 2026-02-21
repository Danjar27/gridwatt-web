import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import type { PaginatedResponse } from '@/lib/api-client';

import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

interface UseServerPaginationOptions<T> {
    queryKey: Array<string>;
    fetchFn: (params: { limit: number; offset: number } & Record<string, any>) => Promise<PaginatedResponse<T>>;
    columns: Array<ColumnDef<T, any>>;
    defaultPageSize?: number;
    enabled?: boolean;
    extraParams?: Record<string, any>;
}

export function useServerPagination<T>({
    queryKey,
    fetchFn,
    columns,
    defaultPageSize = 10,
    enabled = true,
    extraParams,
}: UseServerPaginationOptions<T>) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: defaultPageSize,
    });

    const { data: response, isLoading } = useQuery({
        queryKey: [...queryKey, pagination.pageIndex, pagination.pageSize, extraParams],
        queryFn: () =>
            fetchFn({
                limit: pagination.pageSize,
                offset: pagination.pageIndex * pagination.pageSize,
                ...extraParams,
            }),
        enabled,
    });

    const data = useMemo(() => response?.data ?? [], [response]);
    const total = response?.total ?? 0;

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(total / pagination.pageSize),
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    return { table, isLoading, total, data };
}
