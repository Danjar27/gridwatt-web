import type { Table } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

interface CardViewProps<T> {
    table: Table<T>;
}

function CardView<T>({ table }: CardViewProps<T>) {
    const headers = table.getHeaderGroups()[0]?.headers ?? [];
    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
        return (
            <div className="px-6 py-12 text-center text-sm text-neutral-900">
                No results found
            </div>
        );
    }

    return (
        <div className="space-y-3 p-3">
            {rows.map((row) => {
                const cells = row.getVisibleCells();
                const selectCell = cells.find((c) => c.column.id === 'select');
                const nonSelectCells = cells.filter((c) => c.column.id !== 'select');
                const primaryCell = nonSelectCells[0];
                const detailCells = nonSelectCells.slice(1).filter((c) => c.column.id !== 'actions');
                const actionCell = cells.find((c) => c.column.id === 'actions');

                return (
                    <div key={row.id} className="overflow-hidden rounded-lg border border-neutral-800">
                        {/* Primary identifier */}
                        {primaryCell && (
                            <div className="flex items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-600 px-4 py-3 text-sm font-semibold">
                                <div className="min-w-0 flex-1">
                                    {flexRender(primaryCell.column.columnDef.cell, primaryCell.getContext())}
                                </div>
                                {selectCell && (
                                    <div className="shrink-0">
                                        {flexRender(selectCell.column.columnDef.cell, selectCell.getContext())}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Detail rows */}
                        {detailCells.length > 0 && (
                            <div className="divide-y divide-neutral-700 bg-neutral-500 px-4">
                                {detailCells.map((cell) => {
                                    const header = headers.find((h) => h.id === cell.column.id);
                                    return (
                                        <div
                                            key={cell.id}
                                            className="flex items-center justify-between gap-4 py-2.5 text-sm"
                                        >
                                            <span className="shrink-0 text-xs text-neutral-900">
                                                {header && !header.isPlaceholder
                                                    ? flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )
                                                    : null}
                                            </span>
                                            <span className="text-right">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Actions footer */}
                        {actionCell && (
                            <div className="flex justify-end border-t border-neutral-800 bg-neutral-600/50 px-4 py-2.5">
                                {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default CardView;
