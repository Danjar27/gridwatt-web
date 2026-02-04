import { Briefcase, ClipboardList, CheckCircle, Clock, Plus, Users } from 'lucide-react';
import { useAuthContext } from '@context/auth/context.ts';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const { user } = useAuthContext();
    const userRole = user?.role?.name || user?.roleName;
    const isTechnician = userRole === 'technician';
    const isAdminOrManager = userRole === 'admin' || userRole === 'manager';

    const { data: jobs = [] } = useQuery({
        queryKey: ['jobs', isTechnician ? 'my' : 'all'],
        queryFn: () => (isTechnician ? apiClient.getMyJobs() : apiClient.getJobs()),
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['orders', isTechnician ? 'my' : 'all'],
        queryFn: () => (isTechnician ? apiClient.getMyOrders() : apiClient.getOrders()),
    });

    const pendingJobs = jobs.filter((j) => j.jobStatus !== 'completed');
    const completedJobs = jobs.filter((j) => j.jobStatus === 'completed');
    const pendingOrders = orders.filter((o) => o.orderStatus === 'pending');

    const stats = [
        {
            name: 'Total Jobs',
            value: jobs.length,
            icon: Briefcase,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            name: 'Pending Jobs',
            value: pendingJobs.length,
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600',
        },
        {
            name: 'Completed Jobs',
            value: completedJobs.length,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600',
        },
        {
            name: 'Pending Orders',
            value: pendingOrders.length,
            icon: ClipboardList,
            color: 'bg-purple-100 text-purple-600',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
                    <p className="text-muted-foreground">Here's an overview of your work.</p>
                </div>
                {isAdminOrManager && (
                    <div className="flex flex-wrap gap-2">
                        <Link
                            to="/users"
                            className="flex items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                        >
                            <Users className="h-4 w-4" />
                            Manage Users
                        </Link>
                        <Link
                            to="/users?add=true"
                            className="flex items-center gap-2 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add New User
                        </Link>
                    </div>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`rounded-lg p-3 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.name}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Recent Jobs</h2>
                    {pendingJobs.length === 0 ? (
                        <p className="text-muted-foreground">No pending jobs</p>
                    ) : (
                        <div className="space-y-3">
                            {pendingJobs.slice(0, 5).map((job) => (
                                <div
                                    key={job.id}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                                >
                                    <div>
                                        <p className="font-medium">Job #{job.id}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {job.order?.serviceType} - {job.order?.meterNumber}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                                        {job.jobStatus || 'In Progress'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Pending Orders</h2>
                    {pendingOrders.length === 0 ? (
                        <p className="text-muted-foreground">No pending orders</p>
                    ) : (
                        <div className="space-y-3">
                            {pendingOrders.slice(0, 5).map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {order.firstName} {order.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.serviceType} - {order.meterNumber}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                                        {order.orderStatus}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
