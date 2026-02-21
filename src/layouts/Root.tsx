import { Outlet } from 'react-router-dom';

import OfflineProvider from '@context/offline/provider.tsx';

const Root = () => (
    <OfflineProvider>
        <Outlet />
    </OfflineProvider>
);

export default Root;
