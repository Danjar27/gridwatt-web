import type { TableProps } from './Table.interface';

import Header from './blocks/Header';
import Body from './blocks/Body';
import Pagination from './blocks/Pagination';

function Table<T>({ table, isLoading, total }: TableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-150 overflow-x-auto">
                <Header headerGroups={table.getHeaderGroups()} />
                <Body rows={table.getRowModel().rows} />
            </table>
            <Pagination table={table} total={total} />
        </div>
    );
};

export default Table;
