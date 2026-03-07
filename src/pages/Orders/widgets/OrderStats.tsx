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
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="rounded-lg  border border-neutral-800 bg-neutral-600/60 px-4 py-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                    {i18n('pages.orders.widgets.stats')}
                </span>
                {isLoading ? (
                    <div className="h-3 w-10 animate-pulse rounded bg-neutral-700" />
                ) : (
                    <span className="text-xs text-neutral-900 tabular-nums">
                        {total} {i18n('pages.orders.widgets.total').toLowerCase()}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-primary-500 transition-all duration-700"
                        style={{ width: isLoading ? '0%' : `${rate}%` }}
                    />
                </div>
                {isLoading ? (
                    <div className="h-3 w-28 animate-pulse rounded bg-neutral-700" />
                ) : (
                    <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums">
                        <span className="font-semibold text-primary-500">{rate}%</span>
                        <span className="flex items-center gap-1 text-success-500">
                            <CheckCircleIcon weight="duotone" size={12} />
                            {completed}
                        </span>
                        <span className="flex items-center gap-1 text-secondary-500">
                            <ClockIcon weight="duotone" size={12} />
                            {pending}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderStats;
