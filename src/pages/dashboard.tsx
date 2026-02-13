import { Briefcase, ClipboardList, CheckCircle, Clock, LayoutDashboard } from 'lucide-react';
import { useAuthContext } from '@context/auth/context.ts';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import { useState } from 'react';
import Papa from 'papaparse';
import Page from '@layouts/Page.tsx';
import { useTranslations } from 'use-intl';
import Summary from '@components/Summary/Summary.tsx';

const DashboardPage = () => {
    const i18n = useTranslations();
    const { user } = useAuthContext();

    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';
    const isAdmin = userRole === 'admin' || userRole === 'manager';

    const { data: jobs = [] } = useQuery({
        queryKey: ['jobs', isTechnician ? 'my' : 'all'],
        queryFn: () => (isTechnician ? apiClient.getMyJobs() : apiClient.getJobs()),
        select: (d) => (Array.isArray(d) ? d : d.data),
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['orders', isTechnician ? 'my' : 'all'],
        queryFn: () => (isTechnician ? apiClient.getMyOrders() : apiClient.getOrders()),
        select: (d) => (Array.isArray(d) ? d : d.data),
    });

    const { data: materials = [] } = useQuery({
        queryKey: ['materials'],
        queryFn: () => apiClient.getMaterials(),
        select: (d) => (Array.isArray(d) ? d : d.data),
        enabled: isAdmin,
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['activities'],
        queryFn: () => apiClient.getActivities(),
        select: (d) => (Array.isArray(d) ? d : d.data),
        enabled: isAdmin,
    });

    const { data: seals = [] } = useQuery({
        queryKey: ['seals'],
        queryFn: () => apiClient.getSeals(),
        select: (d) => (Array.isArray(d) ? d : d.data),
        enabled: isAdmin,
    });

    const pendingJobs = jobs.filter((j) => j.jobStatus !== 'completed');
    const completedJobs = jobs.filter((j) => j.jobStatus === 'completed');
    const pendingOrders = orders.filter((o) => o.orderStatus === 'pending');

    const exportTargets = [
        { value: 'orders', label: 'Orders' },
        { value: 'jobs', label: 'Jobs' },
        { value: 'materials', label: 'Materials' },
        { value: 'activities', label: 'Activities' },
        { value: 'seals', label: 'Seals' },
    ] as const;

    const orderFields = [
        'id',
        'firstName',
        'lastName',
        'email',
        'serviceType',
        'orderStatus',
        'issueDate',
        'issueTime',
        'meterNumber',
        'accountNumber',
    ];

    const jobFields = [
        'id',
        'orderId',
        'jobType',
        'jobStatus',
        'startDateTime',
        'endDateTime',
        'technicianId',
        'gpsLocation',
        'meterReading',
        'notes',
    ];

    const materialFields = ['id', 'name', 'type', 'description', 'unit', 'allowsDecimals', 'isActive'];
    const activityFields = ['id', 'name', 'description', 'isActive'];
    const sealFields = ['id', 'name', 'type', 'description', 'isActive'];

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedTargets, setSelectedTargets] = useState<Array<(typeof exportTargets)[number]['value']>>([]);

    const isWithinRange = (dateValue?: string) => {
        if (!dateValue) {
            return false;
        }
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return false;
        }
        if (startDate) {
            const start = new Date(startDate);
            if (!Number.isNaN(start.getTime()) && date < start) {
                return false;
            }
        }
        if (endDate) {
            const end = new Date(endDate);
            if (!Number.isNaN(end.getTime()) && date > end) {
                return false;
            }
        }

        return true;
    };

    const filteredOrders = orders.filter((order) => {
        if (!startDate && !endDate) {
            return true;
        }

        return isWithinRange(order.issueDate);
    });

    const filteredJobs = jobs.filter((job) => {
        if (!startDate && !endDate) {
            return true;
        }

        return isWithinRange(job.startDateTime);
    });

    const downloadCsv = (filename: string, rows: Array<Record<string, unknown>>) => {
        const csv = Papa.unparse(rows);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleDownloadCSV = () => {
        const targets = selectedTargets.length > 0 ? selectedTargets : exportTargets.map((t) => t.value);

        targets.forEach((target) => {
            if (target === 'orders') {
                const rows = filteredOrders.map((order) => {
                    const row: Record<string, unknown> = {};
                    orderFields.forEach((field) => {
                        row[field] = (order as Record<string, unknown>)[field];
                    });

                    return row;
                });
                downloadCsv('orders.csv', rows);

                return;
            }

            if (target === 'jobs') {
                const rows = filteredJobs.map((job) => {
                    const row: Record<string, unknown> = {};
                    jobFields.forEach((field) => {
                        row[field] = (job as Record<string, unknown>)[field];
                    });

                    return row;
                });
                downloadCsv('jobs.csv', rows);

                return;
            }

            if (target === 'materials') {
                const rows = materials.map((material) => {
                    const row: Record<string, unknown> = {};
                    materialFields.forEach((field) => {
                        row[field] = (material as Record<string, unknown>)[field];
                    });

                    return row;
                });
                downloadCsv('materials.csv', rows);

                return;
            }

            if (target === 'activities') {
                const rows = activities.map((activity) => {
                    const row: Record<string, unknown> = {};
                    activityFields.forEach((field) => {
                        row[field] = (activity as Record<string, unknown>)[field];
                    });

                    return row;
                });
                downloadCsv('activities.csv', rows);

                return;
            }

            if (target === 'seals') {
                const rows = seals.map((seal) => {
                    const row: Record<string, unknown> = {};
                    sealFields.forEach((field) => {
                        row[field] = (seal as Record<string, unknown>)[field];
                    });

                    return row;
                });
                downloadCsv('seals.csv', rows);
            }
        });
    };

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
        <Page id="dashboard" title={i18n('pages.dashboard.title')} subtitle={i18n('pages.dashboard.subtitle', { name: user?.name || '' })}>
            <div className="space-y-6">
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
                    <Summary
                        icon={Briefcase}
                        title={i18n('pages.dashboard.recentJobs.title')}
                        subtitle={i18n('pages.dashboard.recentJobs.subtitle')}
                    >
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
                    </Summary>

                    <Summary
                        icon={ClipboardList}
                        title={i18n('pages.dashboard.pendingOrders.title')}
                        subtitle={i18n('pages.dashboard.pendingOrders.subtitle')}
                    >
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
                    </Summary>
                </div>

                {isAdmin && (
                    <Summary
                        icon={LayoutDashboard}
                        title={i18n('pages.dashboard.dataExport.title')}
                        subtitle={i18n('pages.dashboard.dataExport.subtitle')}
                    >
                        <div className="flex flex-col s768:flex-row flex-wrap items-stretch s768:items-center gap-3">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                                className="rounded-md border px-2 py-1 text-sm font-medium text-muted-foreground"
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                                min={startDate || undefined}
                                className="rounded-md border px-2 py-1 text-sm font-medium text-muted-foreground"
                                placeholder="End Date"
                            />
                            <div className="w-full s768:min-w-[260px] s768:w-auto">
                                <label className="sr-only" htmlFor="export-targets">
                                    Select node types to export
                                </label>
                                <select
                                    id="export-targets"
                                    multiple
                                    value={selectedTargets}
                                    onChange={(event) => {
                                        const values = Array.from(event.target.selectedOptions).map(
                                            (option) => option.value as (typeof exportTargets)[number]['value']
                                        );
                                        setSelectedTargets(values);
                                    }}
                                    className="h-28 w-full rounded-md border px-2 py-1 text-sm font-medium text-muted-foreground"
                                >
                                    {exportTargets.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleDownloadCSV}
                                className="rounded-md border border-primary px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
                            >
                                Download CSV
                            </button>
                        </div>
                    </Summary>
                )}
            </div>
        </Page>
    );
};

export default DashboardPage;
