import { Outlet } from 'react-router-dom';
import Sidebar from '@components/Sidebar/Sidebar';
import Toolbar from '@components/Toolbar/Toolbar.tsx';

const Dashboard = () => (
    <div className="h-screen bg-neutral-600">
        <div className="flex max-w-400 h-full m-auto p-7.5 gap-7.5">
            <Sidebar />
            <section className="flex flex-col items-end gap-7.5 w-full">
                <Toolbar />
                <main className="h-full w-full bg-neutral-500 rounded-[20px]">
                    <Outlet />
                </main>
            </section>
        </div>
    </div>
);

export default Dashboard;
