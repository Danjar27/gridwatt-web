import { Outlet } from 'react-router-dom';
import { useState } from 'react';

import OfflineIndicator from '@components/molecules/OfflineIndicator.tsx';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';

export function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex flex-1 flex-col overflow-hidden bg-neutral-100">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <OfflineIndicator />
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
