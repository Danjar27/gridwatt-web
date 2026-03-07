import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { getOrderStats } from '@lib/api/orders.ts';

const OrdersByTechnician = () => {
    const i18n = useTranslations();

    const { data, isLoading } = useQuery({
        queryKey: ['orders', 'stats'],
        queryFn: getOrderStats,
    });

    const rows = (data?.byTechnician ?? [])
        .filter((tech) => tech.assigned > 0)
        .sort((a, b) => (b.assigned - b.resolved) - (a.assigned - a.resolved));

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-neutral-800">
                <h3 className="text-xs font-medium text-neutral-900 uppercase tracking-wide">
                    {i18n('pages.orders.widgets.byTechnician')}
                </h3>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center p-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                </div>
            )}

            {!isLoading && rows.length === 0 && (
                <p className="px-4 py-4 text-sm text-neutral-900">{i18n('pages.orders.widgets.noOrders')}</p>
            )}

            {!isLoading && rows.length > 0 && (
                <div className="max-h-56 overflow-y-auto divide-y divide-neutral-800">
                    {rows.map((row) => {
                        const rate = row.assigned > 0 ? Math.round((row.resolved / row.assigned) * 100) : 0;
                        return (
                            <div key={row.technicianId} className="flex items-center gap-3 px-4 py-2.5">
                                <span className="text-sm min-w-0 flex-1 truncate">
                                    {row.name} {row.lastName}
                                </span>
                                <div className="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden shrink-0">
                                    <div
                                        className="h-full rounded-full bg-primary-500"
                                        style={{ width: `${rate}%` }}
                                    />
                                </div>
                                <span className="text-xs tabular-nums text-neutral-900 shrink-0 w-8 text-right">
                                    {row.resolved}/{row.assigned}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrdersByTechnician;
