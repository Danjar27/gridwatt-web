import { Briefcase, ClipboardList, CheckCircle, Clock, Download, LayoutDashboard } from 'lucide-react';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import { useAuthContext } from '@context/auth/context.ts';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

import DatePicker from '@components/DatePicker/DatePicker';
import Summary from '@components/Summary/Summary';
import Papa from 'papaparse';
import Page from '@layouts/Page';
import type {Order} from "@interfaces/order.interface.ts";
import type { Job } from '@interfaces/job.interface.ts';

const DashboardPage = () => {
    const i18n = useTranslations();
    const { user } = useAuthContext();

    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';
    const isManager = userRole === 'manager';
    const isAdminRole = userRole === 'admin';

    const { data: jobs = [] } = useQuery<Array<Job>, Error>({
        queryKey: ['jobs', isTechnician ? 'my' : 'all'],
        queryFn: async () => {
            if (isTechnician) {
                return await apiClient.getMyJobs();
            } else {
                const res = await apiClient.getJobs();

                return res.data;
            }
        },
        enabled: !isAdminRole,
    });

    const { data: orders = [] } = useQuery<Array<Order>, Error>({
        queryKey: ['orders', isTechnician ? 'my' : 'all'],
        queryFn: async () => {
            if (isTechnician) {
                return await apiClient.getMyOrders();
            } else {
                const res = await apiClient.getOrders();

                return res.data;
            }
        },
        enabled: !isAdminRole,
    });

    // const pendingJobs = jobs.filter((j: Job) => j.jobStatus !== 'completed');
    // const completedJobs = jobs.filter((j: Job) => j.jobStatus === 'completed');
    // const pendingOrders = orders.filter((o: Order) => o.status === 'pending');

    // TODO: FIX THIS
    const pendingJobs = [];
    const completedJobs = [];
    const pendingOrders = [];

    const exportTargets = [
        { value: 'orders', label: i18n('routes.orders') },
        { value: 'jobs', label: i18n('routes.jobs') },
        { value: 'materials', label: i18n('routes.materials') },
        { value: 'activities', label: i18n('routes.activities') },
        { value: 'seals', label: i18n('routes.seals') },
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
                let data: Array<unknown> = [];
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
                        row[field] = (item as unknown as Record<string, unknown>)[field];
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
            name: i18n('pages.dashboard.stats.totalJobs'),
            value: jobs.length,
            icon: Briefcase,
            color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        },
        {
            name: i18n('pages.dashboard.stats.pendingJobs'),
            value: pendingJobs.length,
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
        },
        {
            name: i18n('pages.dashboard.stats.completedJobs'),
            value: completedJobs.length,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        },
        {
            name: i18n('pages.dashboard.stats.pendingOrders'),
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
                {!isAdminRole && (
                    <>
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
                                    <p className="text-sm text-neutral-900 py-2">{i18n('pages.dashboard.empty.jobs')}</p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {pendingJobs.slice(0, 5).map((job: Job) => (
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
                                    <p className="text-sm text-neutral-900 py-2">{i18n('pages.dashboard.empty.orders')}</p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {pendingOrders.slice(0, 5).map((order: Order) => (
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
                                                    {order.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Summary>
                        </div>
                    </>
                )}

                {isManager && (
                    <Summary
                        icon={LayoutDashboard}
                        title={i18n('pages.dashboard.dataExport.title')}
                        subtitle={i18n('pages.dashboard.dataExport.subtitle')}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-4 s425:grid-cols-2 s992:grid-cols-3">
                                <DatePicker
                                    id="export-start-date"
                                    label={i18n('pages.dashboard.export.from')}
                                    value={startDate}
                                    onChange={setStartDate}
                                    placeholder={i18n('pages.dashboard.export.startPlaceholder')}
                                />
                                <DatePicker
                                    id="export-end-date"
                                    label={i18n('pages.dashboard.export.to')}
                                    value={endDate}
                                    onChange={setEndDate}
                                    min={startDate || undefined}
                                    placeholder={i18n('pages.dashboard.export.endPlaceholder')}
                                />
                                <div className="flex flex-col s425:col-span-2 s992:col-span-1">
                                    <label className="block text-sm font-medium mb-1" htmlFor="export-targets">
                                        {i18n('pages.dashboard.export.data')}
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
                                        className={INPUT_CLASS + ' h-30'}
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
                                    {isExporting ? i18n('pages.dashboard.export.exporting') : i18n('pages.dashboard.export.download')}
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
