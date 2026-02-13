import type { HeaderGroup } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

interface HeaderProps<T> {
    headerGroups: HeaderGroup<T>[];
}

function Header<T>({ headerGroups }: HeaderProps<T>) {
    return (
        <thead>
            {headerGroups.map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-neutral-600 rounded-md">
                    {headerGroup.headers.map((header) => (
                        <th key={header.id} className="px-6 py-3 text-left text-sm font-semibold">
                            {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                    ))}
                </tr>
            ))}
        </thead>
    );
}

export default Header;
