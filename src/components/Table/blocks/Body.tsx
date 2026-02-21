import type { Row } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

interface BodyProps<T> {
    rows: Row<T>[];
}

function Body<T>({ rows }: BodyProps<T>) {
    if (rows.length === 0) {
        return (
            <tbody>
                <tr>
                    <td colSpan={100} className="px-6 py-12 text-center text-muted-foreground">
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
                    className="grid border-b border-neutral-200"
                    style={{ gridTemplateColumns: `repeat(${row.getVisibleCells().length}, minmax(0, 1fr))` }}
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
