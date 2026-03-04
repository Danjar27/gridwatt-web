import type { PaginationProps } from '../Table.interface';

import { useTranslations } from 'use-intl';

import Dropdown from '@components/Dropdown/Dropdown';
import Stepper from '@components/Table/blocks/Stepper';

const Pagination = <T, _C>({ table, total }: PaginationProps<T>) => {
    const i18n = useTranslations();

    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = table.getPageCount();

    if (total === 0) {
        return null;
    }

    return (
        <div className="flex items-center s992:justify-between justify-end bg-neutral-600 border-t border-neutral-800 px-5 py-1">
            <span className="hidden s992:inline text-xs font-medium">
                {i18n('table.pagination', {
                    from: pageIndex * pageSize + 1,
                    to: Math.min((pageIndex + 1) * pageSize, total),
                    total: total,
                })}
            </span>

            <div className="flex items-center gap-2">
                <Dropdown
                    className="border-none text-xs font-semibold text-primary-500 dark:text-white bg-none transition-none"
                    value={pageSize}
                    onChange={(v) => table.setPageSize(Number(v))}
                    options={[10, 30, 60].map((size) => ({ label: `${size} / page`, value: size }))}
                />

                <Stepper
                    selected={pageIndex}
                    total={pageCount}
                    onSelect={table.setPageIndex}
                    onNext={table.nextPage}
                    onPrevious={table.previousPage}
                    hasNext={table.getCanNextPage()}
                    hasPrevious={table.getCanPreviousPage()}
                />
            </div>
        </div>
    );
};

export default Pagination;
