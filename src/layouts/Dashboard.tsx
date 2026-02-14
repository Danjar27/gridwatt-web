import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@components/Sidebar/Sidebar';
import MobileNav from '@components/MobileNav/MobileNav.tsx';
import MobileHeader from '@components/Toolbar/MobileHeader.tsx';
import PageTitleProvider from '@context/page-title/provider.tsx';

const DashboardContent = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-dvh flex flex-col bg-neutral-600 overflow-hidden">
            <MobileHeader className="flex s992:hidden" />

            <div className="flex flex-1 overflow-hidden max-w-480 w-full m-auto p-3 s425:p-5 s768:p-7.5 gap-5">
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex flex-col flex-1 overflow-y-auto bg-neutral-500 rounded-lg p-4 s768:p-6 s992:p-10 border border-neutral-800">
                    <Outlet />
                </main>
            </div>

            {/* Bottom navigation for mobile */}
            <MobileNav onMenuOpen={() => setSidebarOpen(true)} />
        </div>
    );
};

const Dashboard = () => (
    <PageTitleProvider>
        <DashboardContent />
    </PageTitleProvider>
);

export default Dashboard;
