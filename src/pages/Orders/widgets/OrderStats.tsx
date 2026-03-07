import { CheckCircleIcon, ClockIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { getOrderStats } from '@lib/api/orders.ts';

const OrderStats = () => {
    const i18n = useTranslations();

    const { data, isLoading } = useQuery({
        queryKey: ['orders', 'stats'],
        queryFn: getOrderStats,
    });

    const total = data?.total ?? 0;
    const completed = data?.completed ?? 0;
    const pending = data?.pending ?? 0;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800">
                <span className="text-xs font-medium text-neutral-900 uppercase tracking-wide">
                    {i18n('pages.orders.widgets.stats')}
                </span>
                {isLoading ? (
                    <div className="h-3 w-12 animate-pulse rounded bg-neutral-700" />
                ) : (
                    <span className="text-xs text-neutral-900 tabular-nums">
                        {total} {i18n('pages.orders.widgets.total').toLowerCase()}
                    </span>
                )}
            </div>

            <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-success-500 transition-all duration-700"
                        style={{ width: isLoading ? '0%' : `${rate}%` }}
                    />
                </div>
                {isLoading ? (
                    <div className="h-3 w-32 animate-pulse rounded bg-neutral-700" />
                ) : (
                    <div className="flex items-center gap-3 text-xs tabular-nums">
                        <span className="font-semibold text-success-500">{rate}%</span>
                        <span className="flex items-center gap-1 text-success-500">
                            <CheckCircleIcon weight="duotone" size={12} />
                            {completed} {i18n('pages.orders.widgets.completed').toLowerCase()}
                        </span>
                        <span className="flex items-center gap-1 text-secondary-500">
                            <ClockIcon weight="duotone" size={12} />
                            {pending} {i18n('pages.orders.widgets.pending').toLowerCase()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderStats;
