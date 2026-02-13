import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@components/Sidebar/Sidebar';
import Toolbar from '@components/Toolbar/Toolbar.tsx';
import MobileNav from '@components/MobileNav/MobileNav.tsx';
import MobileHeader from '@components/Toolbar/MobileHeader.tsx';

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-dvh flex flex-col bg-neutral-600 overflow-hidden">
            <MobileHeader className="flex s992:hidden" />

            <div className="flex flex-1 overflow-hidden max-w-480 w-full m-auto p-3 s425:p-5 s768:p-7.5 gap-5">
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <section className="flex flex-col flex-1 overflow-hidden gap-5">
                    <Toolbar className="hidden s992:flex" />
                    <main className="flex-1 overflow-y-auto bg-neutral-500 rounded-lg p-4 s768:p-6 s992:p-10 border border-neutral-800">
                        <Outlet />
                    </main>
                </section>
            </div>

            {/* Bottom navigation for mobile */}
            <MobileNav onMenuOpen={() => setSidebarOpen(true)} />
        </div>
    );
};

export default Dashboard;
