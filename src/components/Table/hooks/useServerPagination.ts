import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    type ColumnDef,
    type PaginationState,
} from '@tanstack/react-table';
import type { PaginatedResponse } from '@/lib/api-client';

interface UseServerPaginationOptions<T> {
    queryKey: string[];
    fetchFn: (params: { limit: number; offset: number }) => Promise<PaginatedResponse<T>>;
    columns: ColumnDef<T, any>[];
    defaultPageSize?: number;
    enabled?: boolean;
}

export function useServerPagination<T>({
    queryKey,
    fetchFn,
    columns,
    defaultPageSize = 10,
    enabled = true,
}: UseServerPaginationOptions<T>) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: defaultPageSize,
    });

    const { data: response, isLoading } = useQuery({
        queryKey: [...queryKey, pagination.pageIndex, pagination.pageSize],
        queryFn: () =>
            fetchFn({
                limit: pagination.pageSize,
                offset: pagination.pageIndex * pagination.pageSize,
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
