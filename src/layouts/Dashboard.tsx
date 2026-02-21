import { Outlet } from 'react-router-dom';
import { useState } from 'react';

import MobileNav from '@components/MobileNav/MobileNav.tsx';
import Sidebar from '@components/Sidebar/Sidebar';

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSidebarClose = () => setSidebarOpen(false);

    return (
        <div className="h-dvh flex flex-col bg-neutral-600 overflow-hidden">
            <div className="flex flex-1 overflow-hidden max-w-480 w-full m-auto p-4 gap-4">
                <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
                <main className="no-scrollbar flex flex-col flex-1 overflow-y-auto overscroll-none bg-neutral-500 rounded-lg p-4 s768:p-6 s992:p-10 border border-neutral-800">
                    <Outlet />
                </main>
            </div>

            {/* Bottom navigation for mobile */}
            <MobileNav onMenuOpen={() => setSidebarOpen(true)} />
        </div>
    );
};

export default Dashboard;
