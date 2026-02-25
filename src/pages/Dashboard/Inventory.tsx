import { Briefcase, ChartBar, ChartDonut, ClipboardText, Download, SquaresFour } from '@phosphor-icons/react';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import { useAuthContext } from '@context/auth/context.ts';
import { useQuery } from '@tanstack/react-query';
import { getActivities } from '@lib/api/activities.ts';
import { getJobs, getMyJobs } from '@lib/api/jobs.ts';
import { getMaterials } from '@lib/api/materials.ts';
import { getMyOrders, getOrders } from '@lib/api/orders.ts';
import { getSeals } from '@lib/api/seals.ts';
import { useTranslations } from 'use-intl';
import { useState } from 'react';

import DateRangePicker from '@components/DateRangePicker/DateRangePicker';
import Summary from '@components/Summary/Summary';
import Button from '@components/Button/Button';
import Papa from 'papaparse';
import type {User} from "@interfaces/user.interface.ts";
import type { Order } from '@interfaces/order.interface.ts';
import type { Job } from '@interfaces/job.interface.ts';

const exportTargets = ['orders', 'jobs', 'materials', 'activities', 'seals'] as const;
type ExportTarget = (typeof exportTargets)[number];

const exportTargetRouteKeys: Record<ExportTarget, 'routes.orders' | 'routes.jobs' | 'routes.materials' | 'routes.activities' | 'routes.seals'> = {
    orders: 'routes.orders',
    jobs: 'routes.jobs',
    materials: 'routes.materials',
    activities: 'routes.activities',
    seals: 'routes.seals',
};

const orderFields = ['id', 'firstName', 'lastName', 'email', 'serviceType', 'orderStatus', 'issueDate', 'issueTime', 'meterNumber', 'accountNumber'];
const jobFields = ['id', 'orderId', 'jobType', 'jobStatus', 'startDateTime', 'endDateTime', 'technicianId', 'gpsLocation', 'meterReading', 'notes'];
const materialFields = ['id', 'name', 'type', 'description', 'unit', 'allowsDecimals', 'isActive'];
const activityFields = ['id', 'name', 'description', 'isActive'];
const sealFields = ['id', 'name', 'type', 'description', 'isActive'];

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
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
}

// SVG Donut chart: completed vs pending
interface DonutChartProps {
    completed: number;
    total: number;
    completedLabel: string;
    pendingLabel: string;
}

function DonutChart({ completed, total, completedLabel, pendingLabel }: DonutChartProps) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const rate = total > 0 ? completed / total : 0;
    const completedDash = rate * circumference;
    const pendingDash = circumference - completedDash;

    return (
        <div className="flex items-center gap-6">
            <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90">
                {/* Background track */}
                <circle cx="50" cy="50" r={radius} fill="none" className="stroke-neutral-700" strokeWidth="14" />
                {/* Pending arc */}
                {pendingDash > 0 && (
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        className="stroke-neutral-600"
                        strokeWidth="14"
                        strokeDasharray={`${pendingDash} ${circumference}`}
                        strokeDashoffset={-completedDash}
                    />
                )}
                {/* Completed arc */}
                {completedDash > 0 && (
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        className="stroke-primary-500"
                        strokeWidth="14"
                        strokeDasharray={`${completedDash} ${circumference}`}
                    />
                )}
                {/* Center text — rotate back */}
                <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="rotate-90 fill-current text-[18px] font-bold"
                    style={{ transform: 'rotate(90deg)', transformOrigin: '50px 50px', fontSize: 18 }}
                >
                    {total > 0 ? `${Math.round(rate * 100)}%` : '–'}
                </text>
            </svg>
            <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary-500" />
                    <span>{completedLabel}: <strong>{completed}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-neutral-600" />
                    <span>{pendingLabel}: <strong>{total - completed}</strong></span>
                </div>
            </div>
        </div>
    );
}

// Horizontal bar chart for top technicians
interface BarChartProps {
    items: Array<{ label: string; value: number }>;
    maxValue: number;
    jobsLabel: (count: number) => string;
    emptyLabel: string;
}

function HorizontalBarChart({ items, maxValue, jobsLabel, emptyLabel }: BarChartProps) {
    if (items.length === 0) {
        return <p className="py-2 text-sm text-neutral-900">{emptyLabel}</p>;
    }

    return (
        <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-neutral-900">{jobsLabel(item.value)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-700">
                        <div
                            className="h-full rounded-full bg-primary-500 transition-all duration-500"
                            style={{ width: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%' }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Normalize response: some endpoints return Array directly, others return { data: Array }
function toArray<T>(res: unknown): Array<T> {
    if (Array.isArray(res)) {return res;}
    if (res && typeof res === 'object' && Array.isArray((res as { data?: unknown }).data)) {
        return (res as { data: Array<T> }).data;
    }

    return [];
}

function Inventory() {
    const i18n = useTranslations();
    const { user } = useAuthContext();

    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';
    const isManager = userRole === 'manager';
    const isAdmin = userRole === 'admin';

    const { data: rawJobs } = useQuery({
        queryKey: ['jobs', isTechnician ? 'my' : 'all'],
        queryFn: async () => {
            if (isTechnician) {return await getMyJobs();}

            return await getJobs();
        },
        enabled: !isAdmin,
    });

    const { data: rawOrders } = useQuery({
        queryKey: ['orders', isTechnician ? 'my' : 'all'],
        queryFn: async () => {
            if (isTechnician) {return await getMyOrders();}

            return await getOrders();
        },
        enabled: !isAdmin,
    });

    const jobs = toArray<Job>(rawJobs);
    const orders = toArray<Order>(rawOrders);

    const completedJobs = jobs.filter((j) => j.jobStatus === 'completed');
    const pendingJobs = jobs.filter((j) => j.jobStatus !== 'completed');
    const pendingOrders = orders.filter((o) => o.status === 'pending');

    // Jobs completed today
    const today = new Date().toISOString().slice(0, 10);
    const todayJobs = completedJobs.filter((j) => j.endDateTime?.slice(0, 10) === today);

    // Top technicians by completed jobs
    const techMap = new Map<number, { label: string; value: number }>();
    completedJobs.forEach((j) => {
        if (j.technician) {
            const tech = j.technician as User;
            const key = tech.id;
            const existing = techMap.get(key);
            if (existing) {
                existing.value += 1;
            } else {
                techMap.set(key, { label: `${tech.name} ${tech.lastName}`, value: 1 });
            }
        }
    });
    const topTechnicians = Array.from(techMap.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    const maxTechJobs = topTechnicians[0]?.value ?? 0;

    // Export state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTargets, setSelectedTargets] = useState<Array<ExportTarget>>([]);
    const [isExporting, setIsExporting] = useState(false);

    const handleDownloadCSV = async () => {
        setIsExporting(true);
        try {
            const targets = selectedTargets.length > 0 ? selectedTargets : [...exportTargets];
            const dateParams = { from: startDate || undefined, to: endDate || undefined, limit: 10000 };

            for (const target of targets) {
                let data: Array<unknown> = [];
                let fields: Array<string> = [];

                if (target === 'orders') {
                    data = (await getOrders(dateParams)).data;
                    fields = orderFields;
                } else if (target === 'jobs') {
                    data = (await getJobs(dateParams)).data;
                    fields = jobFields;
                } else if (target === 'materials') {
                    data = (await getMaterials(dateParams)).data;
                    fields = materialFields;
                } else if (target === 'activities') {
                    data = (await getActivities(dateParams)).data;
                    fields = activityFields;
                } else if (target === 'seals') {
                    data = (await getSeals(dateParams)).data;
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

    return (
        <div className="flex flex-col gap-4 s768:gap-6 s992:gap-10">
            {/* Stats row — not shown to admins */}
            {!isAdmin && (
                <div className="grid gap-4 s425:grid-cols-2 s992:grid-cols-4">
                    {[
                        { label: i18n('pages.dashboard.stats.totalJobs'), value: jobs.length },
                        { label: i18n('pages.dashboard.stats.pendingJobs'), value: pendingJobs.length },
                        { label: i18n('pages.dashboard.stats.completedJobs'), value: completedJobs.length },
                        { label: i18n('pages.dashboard.stats.pendingOrders'), value: pendingOrders.length },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-4 s768:p-5"
                        >
                            <p className="text-xs text-neutral-900">{stat.label}</p>
                            <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts row — manager only */}
            {isManager && (
                <div className="grid gap-4 s768:gap-6 s992:grid-cols-3">
                    {/* Today's completed jobs */}
                    <Summary
                        icon={Briefcase}
                        title={i18n('pages.dashboard.charts.todayJobs.title')}
                        subtitle={i18n('pages.dashboard.charts.todayJobs.subtitle')}
                    >
                        <div className="flex items-end gap-2 px-4 py-5">
                            <span className="text-5xl font-bold text-primary-500">{todayJobs.length}</span>
                            <span className="mb-1 text-sm text-neutral-900">/ {jobs.length}</span>
                        </div>
                    </Summary>

                    {/* Completion rate donut */}
                    <Summary
                        icon={ChartDonut}
                        title={i18n('pages.dashboard.charts.completionRate.title')}
                        subtitle={i18n('pages.dashboard.charts.completionRate.subtitle')}
                    >
                        <div className="px-4 py-4">
                            <DonutChart
                                completed={completedJobs.length}
                                total={jobs.length}
                                completedLabel={i18n('pages.dashboard.charts.completionRate.completed')}
                                pendingLabel={i18n('pages.dashboard.charts.completionRate.pending')}
                            />
                        </div>
                    </Summary>

                    {/* Top technicians bar chart */}
                    <Summary
                        icon={ChartBar}
                        title={i18n('pages.dashboard.charts.topTechnicians.title')}
                        subtitle={i18n('pages.dashboard.charts.topTechnicians.subtitle')}
                    >
                        <div className="px-4 py-4">
                            <HorizontalBarChart
                                items={topTechnicians}
                                maxValue={maxTechJobs}
                                jobsLabel={(count) => i18n('pages.dashboard.charts.topTechnicians.jobs', { count })}
                                emptyLabel={i18n('pages.dashboard.empty.technicians')}
                            />
                        </div>
                    </Summary>
                </div>
            )}

            {/* Recent jobs & pending orders — not shown to admins */}
            {!isAdmin && (
                <div className="grid gap-4 s768:gap-6 s992:grid-cols-2">
                    <Summary
                        icon={Briefcase}
                        title={i18n('pages.dashboard.recentJobs.title')}
                        subtitle={i18n('pages.dashboard.recentJobs.subtitle')}
                    >
                        <div className="divide-y divide-neutral-700 px-4">
                            {pendingJobs.length === 0 ? (
                                <p className="py-4 text-sm text-neutral-900">{i18n('pages.dashboard.empty.jobs')}</p>
                            ) : (
                                pendingJobs.slice(0, 5).map((job) => (
                                    <div key={job.id} className="flex items-center justify-between gap-3 py-3">
                                        <div>
                                            <p className="text-sm font-medium">#{job.id}</p>
                                            <p className="text-xs text-neutral-900">
                                                {job.order?.serviceType} — {job.order?.meterNumber}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full border border-secondary-500 px-2 py-0.5 text-xs font-medium text-secondary-500">
                                            {job.jobStatus ?? '–'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </Summary>

                    <Summary
                        icon={ClipboardText}
                        title={i18n('pages.dashboard.pendingOrders.title')}
                        subtitle={i18n('pages.dashboard.pendingOrders.subtitle')}
                    >
                        <div className="divide-y divide-neutral-700 px-4">
                            {pendingOrders.length === 0 ? (
                                <p className="py-4 text-sm text-neutral-900">{i18n('pages.dashboard.empty.orders')}</p>
                            ) : (
                                pendingOrders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {order.firstName} {order.lastName}
                                            </p>
                                            <p className="text-xs text-neutral-900">
                                                {order.serviceType} — {order.meterNumber}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full border border-primary-500 px-2 py-0.5 text-xs font-medium text-primary-500">
                                            {order.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </Summary>
                </div>
            )}

            {/* CSV export — manager only */}
            {isManager && (
                <Summary
                    icon={SquaresFour}
                    title={i18n('pages.dashboard.dataExport.title')}
                    subtitle={i18n('pages.dashboard.dataExport.subtitle')}
                >
                    <div className="flex flex-col gap-4 px-4 py-4 s768:px-6">
                        <div className="grid gap-4 s992:grid-cols-3">
                            <DateRangePicker
                                className="s992:col-span-2"
                                fromValue={startDate}
                                toValue={endDate}
                                onFromChange={setStartDate}
                                onToChange={setEndDate}
                                fromLabel={i18n('pages.dashboard.export.from')}
                                toLabel={i18n('pages.dashboard.export.to')}
                                fromPlaceholder={i18n('pages.dashboard.export.startPlaceholder')}
                                toPlaceholder={i18n('pages.dashboard.export.endPlaceholder')}
                            />
                            <div className="flex flex-col">
                                <label className="mb-1 block text-sm font-medium" htmlFor="export-targets">
                                    {i18n('pages.dashboard.export.data')}
                                </label>
                                <select
                                    id="export-targets"
                                    multiple
                                    value={selectedTargets}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions).map(
                                            (o) => o.value as ExportTarget,
                                        );
                                        setSelectedTargets(values);
                                    }}
                                    className={`${INPUT_CLASS} h-30`}
                                >
                                    {exportTargets.map((t) => (
                                        <option key={t} value={t}>
                                            {i18n(exportTargetRouteKeys[t])}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="solid"
                                icon={Download}
                                disabled={isExporting}
                                onClick={() => void handleDownloadCSV()}
                            >
                                {isExporting
                                    ? i18n('pages.dashboard.export.exporting')
                                    : i18n('pages.dashboard.export.download')}
                            </Button>
                        </div>
                    </div>
                </Summary>
            )}
        </div>
    );
}

export default Inventory;
