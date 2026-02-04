import type { FC, PropsWithChildren } from 'react';

type VisibleProps = PropsWithChildren & {
    when: boolean;
};

export const Visible: FC<VisibleProps> = ({ when: conditionSatisfied, children }) =>
    conditionSatisfied ? children : null;

export default Visible;
