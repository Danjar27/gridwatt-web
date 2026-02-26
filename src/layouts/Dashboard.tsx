import { Outlet } from 'react-router-dom';

import SidebarProvider from '@context/sidebar/provider';
import MobileNav from '@components/MobileNav/MobileNav';
import Sidebar from '@components/Sidebar/Sidebar';

const Dashboard = () => (
    <SidebarProvider>
        <div className="h-dvh flex flex-col bg-neutral-600 overflow-hidden">
            <div className="flex flex-1 overflow-hidden max-w-480 w-full m-auto p-2 s992:p-4 gap-2 s992:gap-4">
                <Sidebar />
                <main className="no-scrollbar flex flex-col flex-1 overflow-y-auto overscroll-none bg-neutral-500 rounded-lg p-4 pt-8 s768:p-6 s992:p-10 border border-neutral-800">
                    <Outlet />
                </main>
            </div>
            <MobileNav />
        </div>
    </SidebarProvider>
);

export default Dashboard;
