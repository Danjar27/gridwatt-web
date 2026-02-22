import type { Order } from '@lib/api-client.ts';

import { EyeIcon } from '@phosphor-icons/react';
import { useTranslations } from 'use-intl';
import { Link } from 'react-router-dom';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'bg-success-500/20 text-success-500';
        case 'in_progress':
        case 'assigned':
            return 'bg-primary-500/20 text-primary-500';
        default:
            return 'bg-secondary-500/20 text-secondary-500';
    }
};

interface TechnicianViewProps {
    orders: Array<Order>;
}

const TechnicianView = ({ orders }: TechnicianViewProps) => {
    const i18n = useTranslations();

    if (orders.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-600/60">
                <p className="text-lg font-medium text-neutral-900">{i18n('pages.orders.empty')}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
                <thead>
                    <tr className="bg-neutral-600 rounded-md">
                        {[
                            i18n('pages.orders.table.order'),
                            i18n('pages.orders.table.customer'),
                            i18n('pages.orders.table.service'),
                            i18n('pages.orders.table.status'),
                            i18n('pages.orders.table.date'),
                            i18n('literal.actions'),
                        ].map((col) => (
                            <th key={col} className="px-6 py-3 text-left text-sm font-semibold">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="border-b border-neutral-800">
                            <td className="px-6 py-4 text-sm">
                                <div className="font-medium">#{order.id}</div>
                                <div className="text-sm text-neutral-900">{order.meterNumber}</div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <div>
                                    {order.firstName} {order.lastName}
                                </div>
                                <div className="text-sm text-neutral-900">{order.email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm">{order.serviceType}</td>
                            <td className="px-6 py-4 text-sm">
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                                >
                                    {order.orderStatus}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-900">
                                {new Date(order.issueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <Link
                                    to={`/orders/${order.id}`}
                                    className="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
                                >
                                    <EyeIcon weight="duotone" width={16} height={16} />
                                    {i18n('pages.orders.table.view')}
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TechnicianView;
