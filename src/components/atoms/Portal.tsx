import type { FC, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

const Portal: FC<PropsWithChildren> = ({ children }) => createPortal(children, document.body);

export default Portal;
