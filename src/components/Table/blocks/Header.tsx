import type { HeaderProps } from '@components/Table/Table.interface.ts';

import { flexRender } from '@tanstack/react-table';
import FilterPopover from './FilterPopover';

const Header = ({ headerGroups, filterConfig }: HeaderProps) => (
    <thead>
        {headerGroups.map((headerGroup) => (
            <tr
                key={headerGroup.id}
                className="grid border-b border-neutral-800 bg-neutral-600"
                style={{
                    gridTemplateColumns: headerGroup.headers
                        .map((h) => {
                            const meta = h.column.columnDef.meta as { fixed?: boolean } | undefined;
                            return meta?.fixed ? `${h.getSize()}px` : 'minmax(0, 1fr)';
                        })
                        .join(' '),
                }}
            >
                {headerGroup.headers.map((header) => {
                    const colFilter = filterConfig?.[header.column.id];
                    const filterValue = header.column.getFilterValue() as string | undefined;
                    const isFiltered = !!filterValue;

                    return (
                        <th
                            key={header.id}
                            className={`flex items-center justify-center gap-1.5 px-6 py-3 text-sm font-semibold transition-colors ${
                                isFiltered ? 'bg-primary-500/10 text-primary-500' : ''
                            }`}
                        >
                            {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}

                            {colFilter && (
                                <FilterPopover
                                    options={colFilter.options}
                                    value={filterValue}
                                    onChange={(val) => header.column.setFilterValue(val)}
                                />
                            )}
                        </th>
                    );
                })}
            </tr>
        ))}
    </thead>
);

export default Header;
