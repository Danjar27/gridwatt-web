import { Briefcase, ClipboardList, CheckCircle, Clock, Download, LayoutDashboard } from 'lucide-react';
import { useAuthContext } from '@context/auth/context.ts';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import { useState } from 'react';
import Papa from 'papaparse';
import Page from '@layouts/Page.tsx';
import { useTranslations } from 'use-intl';
import Summary from '@components/Summary/Summary.tsx';
import DatePicker from '@components/DatePicker/DatePicker';
import { INPUT_CLASS } from '@components/Form/utils/constants';

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
    const [isExporting, setIsExporting] = useState(false);

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

    const handleDownloadCSV = async () => {
        setIsExporting(true);
        try {
            const targets = selectedTargets.length > 0 ? selectedTargets : exportTargets.map((t) => t.value);
            const dateParams = { from: startDate || undefined, to: endDate || undefined, limit: 10000 };

            for (const target of targets) {
                let data: Array<Record<string, unknown>> = [];
                let fields: Array<string> = [];

                if (target === 'orders') {
                    const response = await apiClient.getOrders(dateParams);
                    data = response.data;
                    fields = orderFields;
                } else if (target === 'jobs') {
                    const response = await apiClient.getJobs(dateParams);
                    data = response.data;
                    fields = jobFields;
                } else if (target === 'materials') {
                    const response = await apiClient.getMaterials(dateParams);
                    data = response.data;
                    fields = materialFields;
                } else if (target === 'activities') {
                    const response = await apiClient.getActivities(dateParams);
                    data = response.data;
                    fields = activityFields;
                } else if (target === 'seals') {
                    const response = await apiClient.getSeals(dateParams);
                    data = response.data;
                    fields = sealFields;
                }

                const rows = data.map((item) => {
                    const row: Record<string, unknown> = {};
                    fields.forEach((field) => {
                        row[field] = (item as Record<string, unknown>)[field];
                    });

                    return row;
                });
                downloadCsv(`${target}.csv`, rows);
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const stats = [
        {
            name: 'Total Jobs',
            value: jobs.length,
            icon: Briefcase,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        },
        {
            name: 'Pending Jobs',
            value: pendingJobs.length,
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
        },
        {
            name: 'Completed Jobs',
            value: completedJobs.length,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        },
        {
            name: 'Pending Orders',
            value: pendingOrders.length,
            icon: ClipboardList,
            color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        },
    ];

    return (
        <Page
            id="dashboard"
            title={i18n('pages.dashboard.title')}
            subtitle={i18n('pages.dashboard.subtitle', { name: user?.name || '' })}
        >
            <div className="flex flex-col gap-4 s768:gap-6 s992:gap-10">
                <div className="grid gap-4 s425:grid-cols-2 s992:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.name}
                            className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-4 s768:p-5"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-900">{stat.name}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 s768:gap-6 s992:grid-cols-2">
                    <Summary
                        icon={Briefcase}
                        title={i18n('pages.dashboard.recentJobs.title')}
                        subtitle={i18n('pages.dashboard.recentJobs.subtitle')}
                    >
                        {pendingJobs.length === 0 ? (
                            <p className="text-sm text-neutral-900 py-2">No pending jobs</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {pendingJobs.slice(0, 5).map((job) => (
                                    <div
                                        key={job.id}
                                        className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-600/40 p-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">Job #{job.id}</p>
                                            <p className="text-xs text-neutral-900">
                                                {job.order?.serviceType} - {job.order?.meterNumber}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
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
                            <p className="text-sm text-neutral-900 py-2">No pending orders</p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {pendingOrders.slice(0, 5).map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-600/40 p-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {order.firstName} {order.lastName}
                                            </p>
                                            <p className="text-xs text-neutral-900">
                                                {order.serviceType} - {order.meterNumber}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
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
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-4 s425:grid-cols-2 s992:grid-cols-3">
                                <DatePicker
                                    id="export-start-date"
                                    label="From"
                                    value={startDate}
                                    onChange={setStartDate}
                                    placeholder="Start Date"
                                />
                                <DatePicker
                                    id="export-end-date"
                                    label="To"
                                    value={endDate}
                                    onChange={setEndDate}
                                    min={startDate || undefined}
                                    placeholder="End Date"
                                />
                                <div className="flex flex-col s425:col-span-2 s992:col-span-1">
                                    <label className="block text-sm font-medium mb-1" htmlFor="export-targets">
                                        Data
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
                                        className={INPUT_CLASS + ' h-[7.5rem]'}
                                    >
                                        {exportTargets.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => void handleDownloadCSV()}
                                    disabled={isExporting}
                                    className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <Download className="h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Download CSV'}
                                </button>
                            </div>
                        </div>
                    </Summary>
                )}
            </div>
        </Page>
    );
};

export default DashboardPage;
