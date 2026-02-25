import type { Cell, Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

interface BodyProps<T> {
    rows: Array<Row<T>>;
}

function colTemplate<T>(cells: Array<Cell<T, unknown>>): string {
    return cells
        .map((cell) => {
            const meta = cell.column.columnDef.meta as { fixed?: boolean } | undefined;
            return meta?.fixed ? `${cell.column.getSize()}px` : 'minmax(0, 1fr)';
        })
        .join(' ');
}

function Body<T>({ rows }: BodyProps<T>) {
    if (rows.length === 0) {
        return (
            <tbody>
                <tr>
                    <td colSpan={100} className="px-6 py-12 text-center text-neutral-900">
                        No results found
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {rows.map((row) => (
                <tr
                    key={row.id}
                    className="grid border-b last:border-none border-neutral-300 dark:border-neutral-700"
                    style={{ gridTemplateColumns: colTemplate(row.getVisibleCells()) }}
                >
                    {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="flex items-center justify-center px-6 py-4 text-sm">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}

export default Body;
