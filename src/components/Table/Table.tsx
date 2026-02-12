import type { TableProps } from './Table.interface.ts';
import type { FC, PropsWithChildren } from 'react';

import Header from './blocks/Header.tsx';

const Table: FC<PropsWithChildren<TableProps>> = ({ children, columns = [] }) => (
    <table className="grid w-full">
        <Header row={columns} />
        {children}
    </table>
);

export default Table;
