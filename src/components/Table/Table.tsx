import type { TableProps } from './Table.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import Header from './blocks/Header.tsx';

const Table: FC<PropsWithChildren<TableProps>> = ({ children, columns = [] }) => (
    <div className="overflow-x-auto">
        <table className="grid w-full min-w-[600px]">
            <Header row={columns} />
            {children}
        </table>
    </div>
);

export default Table;
