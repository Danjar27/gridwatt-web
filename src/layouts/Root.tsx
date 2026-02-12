import { Outlet } from 'react-router-dom';

import OfflineProvider from '@context/offline/provider.tsx';

const Root = () => (
    <OfflineProvider>
        <div className="min-h-screen bg-background">
            <Outlet />
        </div>
    </OfflineProvider>
);

export default Root;
