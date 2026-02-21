import type { HeaderProps } from '@components/Table/Table.interface.ts';
import type { FC } from 'react';

import { flexRender } from '@tanstack/react-table';

const Header: FC<HeaderProps> = ({ headerGroups }) => (
    <thead>
        {headerGroups.map((headerGroup) => (
            <tr
                key={headerGroup.id}
                className="grid bg-neutral-600 border-b border-neutral-800"
                style={{ gridTemplateColumns: `repeat(${headerGroup.headers.length}, minmax(0, 1fr))` }}
            >
                {headerGroup.headers.map((header) => (
                    <th key={header.id} className="flex items-center justify-center px-6 py-3 text-sm font-semibold">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                ))}
            </tr>
        ))}
    </thead>
);

export default Header;
