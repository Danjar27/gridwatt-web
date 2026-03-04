import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignOrder, getOrder } from '@lib/api/orders.ts';
import { getTechnicians } from '@lib/api/users.ts';
import { useState } from 'react';
import {
    ArrowLeftIcon,
    EnvelopeIcon,
    PhoneIcon,
    IdentificationCardIcon,
    HashIcon,
    MapPinIcon,
    ArrowSquareOutIcon,
    WrenchIcon,
    PlugIcon,
    CalendarIcon,
    UserCircleDashedIcon,
    CaretDownIcon,
    ArrowRightIcon,
    CheckCircleIcon,
} from '@phosphor-icons/react';
import { useAuthContext } from '@context/auth/context.ts';
import { useTranslations } from 'use-intl';
import type { User as UserType } from '@interfaces/user.interface.ts';
import type { Order } from '@interfaces/order.interface.ts';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import { classnames } from '@utils/classnames.ts';
import Button from '@components/Button/Button';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusColors(status: string): string {
    switch (status) {
        case 'completed':
            return 'bg-success-500/20 text-success-500';
        case 'in_progress':
        case 'assigned':
            return 'bg-primary-500/20 text-primary-500';
        default:
            return 'bg-secondary-500/20 text-secondary-500';
    }
}

function getJobDotColor(status: string | undefined): string {
    switch (status) {
        case 'completed':
            return 'bg-success-500';
        case 'in_progress':
        case 'assigned':
            return 'bg-primary-500';
        default:
            return 'bg-secondary-500';
    }
}

function getInitials(firstName?: string, lastName?: string): string {
    return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 rounded-md bg-neutral-700/50 p-1.5">
                <Icon size={14} weight="duotone" className="text-neutral-900" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-neutral-900">{label}</p>
                <p className="break-words text-sm font-medium">{value || '—'}</p>
            </div>
        </div>
    );
}

function SectionCard({
    title,
    accentColor,
    children,
}: {
    title: string;
    accentColor: string;
    children: React.ReactNode;
}) {
    return (
        <div className={classnames('overflow-hidden rounded-lg border border-neutral-800 border-l-4', accentColor)}>
            <div className="bg-neutral-600/60 px-5 py-4">
                <h2 className="text-base font-semibold">{title}</h2>
            </div>
            <div className="border-t border-neutral-800 bg-neutral-600/30 px-5 py-4">{children}</div>
        </div>
    );
}

function TechnicalDetailsSection({ order }: { order: Order }) {
    const [open, setOpen] = useState(false);
    const i18n = useTranslations();

    const fields: Array<{ label: string; value: string | number | undefined }> = [
        { label: i18n('pages.orders.form.fields.panelTowerBlock'), value: order.panelTowerBlock },
        { label: i18n('pages.orders.form.fields.coordinateX'), value: order.coordinateX },
        { label: i18n('pages.orders.form.fields.coordinateY'), value: order.coordinateY },
        { label: i18n('pages.orders.form.fields.appliedTariff'), value: order.appliedTariff },
        { label: i18n('pages.orders.form.fields.transformerNumber'), value: order.transformerNumber },
        { label: i18n('pages.orders.form.fields.distributionNetwork'), value: order.distributionNetwork },
        { label: i18n('pages.orders.form.fields.transformerOwnership'), value: order.transformerOwnership },
        { label: i18n('pages.orders.form.fields.sharedSubstation'), value: order.sharedSubstation },
        { label: i18n('pages.orders.form.fields.normalLoad'), value: order.normalLoad },
        { label: i18n('pages.orders.form.fields.fluctuatingLoad'), value: order.fluctuatingLoad },
        { label: i18n('pages.orders.form.fields.plannerGroup'), value: order.plannerGroup },
        { label: i18n('pages.orders.form.fields.workPosition'), value: order.workPosition },
        { label: i18n('pages.orders.form.fields.lockerSequence'), value: order.lockerSequence },
    ];

    const available = fields.filter((f) => f.value !== undefined && f.value !== '');
    if (available.length === 0) {
        return null;
    }

    return (
        <div className="rounded-lg border border-neutral-800">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-neutral-700/30"
            >
                <span className="text-sm font-semibold">{i18n('pages.orderDetail.technicalDetails')}</span>
                <CaretDownIcon
                    size={16}
                    weight="bold"
                    className={classnames('text-neutral-900 transition-transform duration-200', {
                        'rotate-180': open,
                    })}
                />
            </button>

            {open && (
                <div className="border-t border-neutral-800 bg-neutral-600/30 px-5 py-4">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 s768:grid-cols-2">
                        {available.map((f) => (
                            <div key={f.label}>
                                <p className="text-xs text-neutral-900">{f.label}</p>
                                <p className="text-sm font-medium">{String(f.value)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
        queryFn: () => getOrder(id!),  
        enabled: !!id,
    });

    const { data: techniciansResponse } = useQuery({
        queryKey: ['technicians'],
        queryFn: () => getTechnicians(),
        enabled: canAssign,
    });
    const technicians = Array.isArray(techniciansResponse)
        ? techniciansResponse
        : ((techniciansResponse as unknown as { data?: Array<UserType> })?.data ?? []);

    const assignMutation = useMutation({
        mutationFn: (technicianId: number | null) => assignOrder(id!, technicianId),
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

    const formattedDate = new Date(order.issueDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="space-y-5">
            {/* Hero header */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 px-5 py-4">
                <div className="flex flex-col gap-4 s425:flex-row s425:items-center s425:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/orders"
                            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-900 transition hover:border-primary-500 hover:text-primary-500"
                        >
                            <ArrowLeftIcon size={13} weight="bold" />
                            {i18n('literal.back')}
                        </Link>
                        <div className="h-5 w-px bg-neutral-800" />
                        <div>
                            <h1 className="text-lg font-bold s768:text-xl">
                                {i18n('pages.orderDetail.orderTitle', { id: order.id })}
                            </h1>
                            <p className="text-xs text-neutral-900">{order.serviceType}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className={classnames(
                                'rounded-full px-3 py-1 text-xs font-semibold',
                                getStatusColors(order.status)
                            )}
                        >
                            {order.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-neutral-900">{formattedDate}</span>
                    </div>
                </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 gap-4 s992:grid-cols-2">
                {/* Customer */}
                <SectionCard title={i18n('pages.orderDetail.customerInfo')} accentColor="border-l-primary-500">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-sm font-semibold text-primary-500">
                                {getInitials(order.firstName, order.lastName)}
                            </div>
                            <div>
                                <p className="font-semibold">
                                    {order.firstName} {order.lastName}
                                </p>
                                <p className="text-xs text-neutral-900">{i18n('pages.orderDetail.customerInfo')}</p>
                            </div>
                        </div>
                        <div className="space-y-2.5 pt-1">
                            <InfoRow icon={EnvelopeIcon} label={i18n('pages.orderDetail.email')} value={order.email} />
                            <InfoRow icon={PhoneIcon} label={i18n('pages.orderDetail.phone')} value={order.phone} />
                            <InfoRow
                                icon={IdentificationCardIcon}
                                label={i18n('pages.orderDetail.idNumber')}
                                value={order.idNumber}
                            />
                            <InfoRow
                                icon={HashIcon}
                                label={i18n('pages.orderDetail.account')}
                                value={order.accountNumber}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* Location */}
                <SectionCard title={i18n('pages.orderDetail.location')} accentColor="border-l-neutral-800">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0 rounded-md bg-neutral-700/50 p-1.5">
                                <MapPinIcon size={14} weight="duotone" className="text-neutral-900" />
                            </div>
                            <p className="text-sm">{order.orderLocation || '—'}</p>
                        </div>
                        {order.latitude && order.longitude && (
                            <a
                                href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-1.5 text-xs font-medium text-primary-500 transition hover:border-primary-500 hover:bg-primary-500/10"
                            >
                                <ArrowSquareOutIcon size={13} weight="bold" />
                                {i18n('pages.orderDetail.openInMaps')}
                            </a>
                        )}
                    </div>
                </SectionCard>

                {/* Order Details */}
                <SectionCard title={i18n('pages.orderDetail.orderDetails')} accentColor="border-l-secondary-500">
                    <div className="space-y-2.5">
                        <InfoRow
                            icon={WrenchIcon}
                            label={i18n('pages.orderDetail.serviceType')}
                            value={order.serviceType}
                        />
                        <InfoRow icon={PlugIcon} label={i18n('pages.orderDetail.meterNumber')} value={order.meterNumber} />
                        <InfoRow
                            icon={CalendarIcon}
                            label={i18n('pages.orderDetail.issueDate')}
                            value={`${formattedDate}${order.issueTime ? ` · ${order.issueTime}` : ''}`}
                        />
                        {order.observations && (
                            <div className="rounded-lg bg-neutral-700/30 px-3 py-2.5 text-sm italic text-neutral-900">
                                {order.observations}
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* Assignment */}
                <SectionCard title={i18n('pages.orderDetail.assignment')} accentColor="border-l-success-500">
                    {order.technician ? (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-500/20 text-sm font-semibold text-success-500">
                                {getInitials(order.technician.name, order.technician.lastName)}
                            </div>
                            <div>
                                <p className="font-medium">
                                    {order.technician.name} {order.technician.lastName}
                                </p>
                                <p className="text-xs text-neutral-900">{order.technician.email}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-neutral-900">
                            <UserCircleDashedIcon size={32} weight="duotone" />
                            <p className="text-sm">{i18n('pages.orderDetail.notAssigned')}</p>
                        </div>
                    )}

                    {canAssign && (
                        <div className="mt-4 flex gap-2">
                            <select
                                value={selectedTechnician ?? ''}
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
                </SectionCard>
            </div>

            {/* Technical Details (collapsible) */}
            <TechnicalDetailsSection order={order} />

            {/* Jobs timeline */}
            {order.jobs && order.jobs.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-neutral-800">
                    <div className="border-b border-neutral-800 bg-neutral-600 px-5 py-3">
                        <h2 className="text-base font-semibold">{i18n('pages.orderDetail.jobs')}</h2>
                    </div>
                    <div className="bg-neutral-600/30 px-5 py-4">
                        <div className="relative space-y-0">
                            {/* Vertical timeline line */}
                            <div className="absolute left-[5px] top-3 bottom-3 w-0.5 bg-neutral-800" />

                            {order.jobs.map((job) => (
                                <Link
                                    key={job.id}
                                    to={`/jobs/${job.id}`}
                                    className="group relative flex items-center justify-between gap-4 py-3 pl-7 pr-2 transition hover:pl-8"
                                >
                                    {/* Timeline dot */}
                                    <div
                                        className={classnames(
                                            'absolute left-0 h-3 w-3 rounded-full border-2 border-neutral-600 transition-transform group-hover:scale-125',
                                            getJobDotColor(job.jobStatus)
                                        )}
                                    />

                                    <div className="min-w-0">
                                        <p className="font-medium">
                                            {i18n('pages.orderDetail.jobItem', { id: job.id })}
                                        </p>
                                        <p className="text-xs text-neutral-900">
                                            {i18n('pages.orderDetail.started')}:{' '}
                                            {new Date(job.startDateTime).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        {job.jobStatus === 'completed' && (
                                            <CheckCircleIcon size={14} weight="fill" className="text-success-500" />
                                        )}
                                        <span
                                            className={classnames(
                                                'rounded-full px-2 py-0.5 text-xs font-medium',
                                                job.jobStatus === 'completed'
                                                    ? 'bg-success-500/20 text-success-500'
                                                    : 'bg-primary-500/20 text-primary-500'
                                            )}
                                        >
                                            {job.jobStatus ?? 'in_progress'}
                                        </span>
                                        <ArrowRightIcon
                                            size={14}
                                            weight="bold"
                                            className="text-neutral-900 transition group-hover:text-primary-500"
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
