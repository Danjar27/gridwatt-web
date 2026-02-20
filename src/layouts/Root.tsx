import { Outlet } from 'react-router-dom';

import OfflineProvider from '@context/offline/provider.tsx';
import ModalProvider from '@context/modal/provider.tsx';

const Root = () => (
    <ModalProvider>
        <OfflineProvider>
            <Outlet />
        </OfflineProvider>
    </ModalProvider>
);

export default Root;
