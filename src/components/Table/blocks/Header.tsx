import type { FC } from 'react';
import type { RowProps } from '@components/Table/Table.interface.ts';

const Header: FC<RowProps> = ({ row }) => (
    <th
        className="grid w-full justify-items-center bg-neutral-600 rounded-md "
        style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
    >
        {row.map((cell, index) => (
            <div key={index} className="px-6 py-3 text-left text-sm font-semibold uppsercase">
                {cell}
            </div>
        ))}
    </th>
);

export default Header;
