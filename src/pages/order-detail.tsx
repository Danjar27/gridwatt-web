import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignOrder, getOrder } from '@lib/api/orders.ts';
import { getTechnicians } from '@lib/api/users.ts';
import { MapPin, User, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';
import type { User as UserType } from '@interfaces/user.interface.ts';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import Button from '@components/Button/Button';

export function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthContext();
    const queryClient = useQueryClient();
    const i18n = useTranslations();
    const userRole = user?.role?.name;
    const canAssign = userRole === 'manager';

    if (userRole === 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const [selectedTechnician, setSelectedTechnician] = useState<number | null>(null);

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrder(Number(id)),
        enabled: !!id,
    });

    const { data: techniciansResponse } = useQuery({
        queryKey: ['technicians'],
        queryFn: () => getTechnicians(),
        enabled: canAssign,
    });
    const technicians = Array.isArray(techniciansResponse)
        ? techniciansResponse
        : ((techniciansResponse as any)?.data ?? []);

    const assignMutation = useMutation({
        mutationFn: (technicianId: number | null) => assignOrder(Number(id), technicianId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order', id] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    const handleAssign = () => {
        if (selectedTechnician) {
            assignMutation.mutate(selectedTechnician);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-neutral-900">{i18n('pages.orderDetail.notFound')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/orders" className="flex items-center gap-1 text-neutral-900 hover:text-primary-500">
                    <ArrowLeft className="h-4 w-4" />
                    {i18n('literal.back')}
                </Link>
            </div>

            <div className="flex flex-col s425:flex-row items-start s425:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl s768:text-2xl font-bold">Order #{order.id}</h1>
                    <p className="text-neutral-900">{order.serviceType}</p>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 s992:grid-cols-2">
                {/* Customer Info */}
                <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                    <h2 className="mb-4 text-lg font-semibold">{i18n('pages.orderDetail.customerInfo')}</h2>
                    <div className="space-y-2 text-sm">
                        <p>
                            <span className="text-neutral-900">{i18n('pages.orderDetail.name')}:</span>{' '}
                            {order.firstName} {order.lastName}
                        </p>
                        <p>
                            <span className="text-neutral-900">{i18n('pages.orderDetail.email')}:</span> {order.email}
                        </p>
                        <p>
                            <span className="text-neutral-900">{i18n('pages.orderDetail.phone')}:</span> {order.phone}
                        </p>
                        <p>
                            <span className="text-neutral-900">{i18n('pages.orderDetail.idNumber')}:</span>{' '}
                            {order.idNumber}
                        </p>
                        <p>
                            <span className="text-neutral-900">{i18n('pages.orderDetail.account')}:</span>{' '}
                            {order.accountNumber}
                        </p>
                    </div>
                </div>

                {/* Location */}
                <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                    <h2 className="mb-4 text-lg font-semibold">{i18n('pages.orderDetail.location')}</h2>
                    <div className="space-y-2 text-sm">
                        <p>{order.orderLocation}</p>
                        {order.latitude && order.longitude && (
                            <a
                                href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary-500 hover:underline"
                            >
                                <MapPin className="h-4 w-4" />
                                {i18n('pages.orderDetail.openInMaps')}
                            </a>
                        )}
                    </div>
                </div>

                {/* Order Details */}
                <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                    <h2 className="mb-4 text-lg font-semibold">{i18n('pages.orderDetail.orderDetails')}</h2>
                    <div className="space-y-2 text-sm">
                        <p>
                            <span className="text-neutral-900">{i18n('pages.orderDetail.serviceType')}:</span>{' '}
                            {order.serviceType}
                        </p>
                        <p>
                            <span className="text-neutral-900">{i18n('pages.orderDetail.meterNumber')}:</span>{' '}
                            {order.meterNumber}
                        </p>
                        <p>
                            <span className="text-neutral-900">{i18n('pages.orderDetail.status')}:</span>{' '}
                            <span className="rounded-full bg-secondary-500/20 px-2 py-1 text-xs text-secondary-500">
                                {order.status}
                            </span>
                        </p>
                        <p>
                            <span className="text-neutral-900">{i18n('pages.orderDetail.issueDate')}:</span>{' '}
                            {new Date(order.issueDate).toLocaleDateString()}
                        </p>
                        {order.observations && (
                            <p>
                                <span className="text-neutral-900">{i18n('pages.orderDetail.observations')}:</span>{' '}
                                {order.observations}
                            </p>
                        )}
                    </div>
                </div>

                {/* Assignment */}
                <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                    <h2 className="mb-4 text-lg font-semibold">{i18n('pages.orderDetail.assignment')}</h2>
                    {order.technician ? (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10">
                                <User className="h-5 w-5 text-primary-500" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {order.technician.name} {order.technician.lastName}
                                </p>
                                <p className="text-sm text-neutral-900">{order.technician.email}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-neutral-900">{i18n('pages.orderDetail.notAssigned')}</p>
                    )}

                    {canAssign && (
                        <div className="mt-4 flex gap-2">
                            <select
                                value={selectedTechnician || ''}
                                onChange={(e) => setSelectedTechnician(Number(e.target.value) || null)}
                                className={`flex-1 ${INPUT_CLASS}`}
                            >
                                <option value="">{i18n('pages.orderDetail.selectTechnician')}</option>
                                {technicians.map((tech: UserType) => (
                                    <option key={tech.id} value={tech.id}>
                                        {tech.name} {tech.lastName}
                                    </option>
                                ))}
                            </select>
                            <Button onClick={handleAssign} disabled={!selectedTechnician || assignMutation.isPending}>
                                {i18n('pages.orderDetail.assign')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Jobs */}
            {order.jobs && order.jobs.length > 0 && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                    <h2 className="mb-4 text-lg font-semibold">{i18n('pages.orderDetail.jobs')}</h2>
                    <div className="space-y-2">
                        {order.jobs.map((job) => (
                            <Link
                                key={job.id}
                                to={`/jobs/${job.id}`}
                                className="flex items-center justify-between rounded-lg bg-neutral-600/40 p-3 hover:bg-neutral-600"
                            >
                                <div>
                                    <p className="font-medium">Job #{job.id}</p>
                                    <p className="text-sm text-neutral-900">
                                        {i18n('pages.orderDetail.started')}:{' '}
                                        {new Date(job.startDateTime).toLocaleString()}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                        job.jobStatus === 'completed'
                                            ? 'bg-success-500/20 text-success-500'
                                            : 'bg-primary-500/20 text-primary-500'
                                    }`}
                                >
                                    {job.jobStatus || 'in_progress'}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
