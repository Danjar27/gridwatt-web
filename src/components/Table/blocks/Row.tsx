import type { FC, PropsWithChildren } from 'react';
import { Children } from 'react';

const Row: FC<PropsWithChildren> = ({ children }) => (
    <tr
        className="grid w-full justify-items-center items-center"
        style={{ gridTemplateColumns: `repeat(${Children.count(children)}, minmax(0, 1fr))` }}
    >
        {Children.map(children, (cell, i) => (
            <td key={i}>{cell}</td>
        ))}
    </tr>
);

export default Row;
