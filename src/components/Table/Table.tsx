import type { TableProps } from './Table.interface';

import Header from './blocks/Header';
import Body from './blocks/Body';
import CardView from './blocks/CardView';
import Pagination from './blocks/Pagination';

function Table<T>({ table, isLoading, total, filterConfig }: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div>
            {/* Desktop: standard table with horizontal scroll */}
            <div className="hidden s768:block overflow-x-auto">
                <table className="w-full min-w-150">
                    <Header headerGroups={table.getHeaderGroups()} filterConfig={filterConfig} />
                    <Body rows={table.getRowModel().rows} />
                </table>
            </div>

            {/* Mobile: card list */}
            <div className="s768:hidden">
                <CardView table={table} />
            </div>

            <Pagination table={table} total={total} />
        </div>
    );
}

export default Table;
