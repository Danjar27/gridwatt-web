import { CheckCircleIcon, ClockIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { getTechnicianStats } from '@lib/api/users.ts';

const SKELETON_COUNT = 3;

const TechnicianStatsWidget = () => {
    const i18n = useTranslations();

    const { data = [], isLoading } = useQuery({
        queryKey: ['users', 'technicians', 'stats'],
        queryFn: getTechnicianStats,
    });

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-neutral-800">
                <span className="text-xs font-medium text-neutral-900 uppercase tracking-wide">
                    {i18n('pages.dashboard.technicians.stats')}
                </span>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 s768:grid-cols-2 s1200:grid-cols-3 gap-3 p-3">
                    {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                        <div key={index} className="rounded-md border border-neutral-800 p-3 flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full shrink-0 animate-pulse bg-neutral-700" />
                                <div className="flex-1 h-3.5 rounded animate-pulse bg-neutral-700" />
                            </div>
                            <div className="h-1 rounded-full animate-pulse bg-neutral-700" />
                            <div className="h-3 w-3/4 rounded animate-pulse bg-neutral-700" />
                            <div className="h-3 w-full rounded animate-pulse bg-neutral-700" />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && data.length === 0 && (
                <p className="px-4 py-4 text-sm text-neutral-900">{i18n('pages.dashboard.technicians.empty')}</p>
            )}

            {!isLoading && data.length > 0 && (
                <div className="grid grid-cols-1 s768:grid-cols-2 s1200:grid-cols-3 gap-3 p-3">
                    {data.map((tech) => {
                        const rate =
                            tech.totalOrders > 0 ? Math.round((tech.completedOrders / tech.totalOrders) * 100) : 0;

                        return (
                            <div
                                key={tech.id}
                                className="rounded-md border border-neutral-800 bg-neutral-500/20 p-3 flex flex-col gap-2.5"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-primary-500/15 flex items-center justify-center text-[9px] font-bold uppercase shrink-0 text-primary-500 select-none">
                                        {tech.name[0]}
                                        {tech.lastName[0]}
                                    </div>
                                    <span className="text-sm font-medium truncate min-w-0">
                                        {tech.name} {tech.lastName}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-900">
                                            {i18n('pages.dashboard.technicians.orders')}
                                        </span>
                                        <div className="flex items-center gap-2 tabular-nums">
                                            <span className="flex items-center gap-0.5 text-success-500">
                                                <CheckCircleIcon weight="duotone" size={11} />
                                                {tech.completedOrders}
                                            </span>
                                            <span className="flex items-center gap-0.5 text-secondary-500">
                                                <ClockIcon weight="duotone" size={11} />
                                                {tech.pendingOrders}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1 rounded-full bg-neutral-800 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-success-500 transition-all duration-700"
                                            style={{ width: `${rate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-900">
                                        {i18n('pages.dashboard.technicians.seals')}
                                    </span>
                                    <div className="flex items-center gap-2 tabular-nums">
                                        <span>
                                            {tech.sealsAssigned}
                                            <span className="text-neutral-900 text-[10px] ml-0.5">
                                                {i18n('pages.dashboard.technicians.assigned').toLowerCase()}
                                            </span>
                                        </span>
                                        <span className="text-neutral-800">·</span>
                                        <span className="text-neutral-900">
                                            {tech.sealsUsed}
                                            <span className="text-[10px] ml-0.5">
                                                {i18n('pages.dashboard.technicians.used').toLowerCase()}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TechnicianStatsWidget;
