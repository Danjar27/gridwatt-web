import { Outlet } from 'react-router-dom';
import OfflineProvider from '@context/offline/provider.tsx';

export function RootLayout() {
    return (
        <OfflineProvider>
            <div className="min-h-screen bg-background">
                <Outlet />
            </div>
        </OfflineProvider>
    );
}
