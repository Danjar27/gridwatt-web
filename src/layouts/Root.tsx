import { Outlet } from 'react-router-dom';

import OfflineProvider from '@context/offline/provider';

const Root = () => (
    <OfflineProvider>
        <Outlet />
    </OfflineProvider>
);

export default Root;
