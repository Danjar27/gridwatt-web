import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { getTechnicianStats } from '@lib/api/users.ts';

const OrdersByTechnician = () => {
    const i18n = useTranslations();

    const { data = [], isLoading } = useQuery({
        queryKey: ['users', 'technicians', 'stats'],
        queryFn: getTechnicianStats,
    });

    const rows = data.filter((tech) => tech.totalOrders > 0);

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
                    {rows.map((tech) => {
                        const rate =
                            tech.totalOrders > 0 ? Math.round((tech.completedOrders / tech.totalOrders) * 100) : 0;
                        return (
                            <div key={tech.id} className="flex items-center gap-3 px-4 py-2.5">
                                <span className="text-sm min-w-0 flex-1 truncate">
                                    {tech.name} {tech.lastName}
                                </span>
                                <div className="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden shrink-0">
                                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${rate}%` }} />
                                </div>
                                <span className="text-xs tabular-nums text-neutral-900 shrink-0 w-10 text-right">
                                    {tech.completedOrders}/{tech.totalOrders}
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
