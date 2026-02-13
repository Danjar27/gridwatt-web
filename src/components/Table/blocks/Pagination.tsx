import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationProps } from '../Table.interface';

const Pagination: FC<PaginationProps> = ({ table, total }) => {
    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = table.getPageCount();
    const from = pageIndex * pageSize + 1;
    const to = Math.min((pageIndex + 1) * pageSize, total);

    if (total === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3">
            <span className="text-sm text-muted-foreground">
                Showing {from}–{to} of {total}
            </span>

            <div className="flex items-center gap-2">
                <select
                    value={pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="rounded-md border px-2 py-1 text-sm"
                >
                    {[10, 25, 50].map((size) => (
                        <option key={size} value={size}>
                            {size} / page
                        </option>
                    ))}
                </select>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="rounded-md border p-1.5 text-sm disabled:opacity-40 hover:bg-neutral-100"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: pageCount }, (_, i) => i).map((page) => (
                        <button
                            key={page}
                            onClick={() => table.setPageIndex(page)}
                            className={`min-w-[2rem] rounded-md border px-2 py-1 text-sm ${
                                page === pageIndex
                                    ? 'bg-primary-500 text-white border-primary-500'
                                    : 'hover:bg-neutral-100'
                            }`}
                        >
                            {page + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="rounded-md border p-1.5 text-sm disabled:opacity-40 hover:bg-neutral-100"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
