import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';
import { useQuery } from '@tanstack/react-query';
import { MapPinIcon } from '@phosphor-icons/react';

import { useAuthContext } from '@context/auth/context.ts';
import { getMyJobs } from '@lib/api/jobs.ts';
import TechnicianOrdersMap from '@components/orders/TechnicianOrdersMap';
import Modal from '@components/Modal/Modal';
import Window from '@components/Modal/blocks/Window';
import type { Job } from '@interfaces/job.interface.ts';

const Inventory = () => {
    const i18n = useTranslations();

    const { user } = useAuthContext();
    const isTechnician = user?.role?.name === 'technician';

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const { data: jobs = [], isLoading } = useQuery<Array<Job>>({
        queryKey: ['jobs', 'my'],
        queryFn: getMyJobs,
        enabled: isTechnician,
    });

    if (!isTechnician) {
        return <Navigate to="/dashboard" replace />;
    }

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    const order = selectedJob?.order;

    return (
        <>
            <div className="flex-1 min-h-0">
                <TechnicianOrdersMap jobs={jobs} onJobClick={setSelectedJob} />
            </div>

            <Modal
                id="technician-order-detail"
                isOpen={selectedJob !== null}
                onOpen={() => {}}
                onClose={() => setSelectedJob(null)}
            >
                <Window
                    title={i18n('pages.technicianMap.order.title', { id: order?.id ?? '' })}
                    icon={MapPinIcon}
                    className="w-full max-w-sm px-4"
                >
                    {selectedJob && order && (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-neutral-900">
                                        {i18n('pages.technicianMap.order.customer')}
                                    </span>
                                    <span className="font-medium text-right">
                                        {order.clientName} {order.clientLastName}
                                    </span>
                                </div>
                                {order.type && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-neutral-900">
                                            {i18n('pages.technicianMap.order.type')}
                                        </span>
                                        <span className="font-medium text-right">{order.type}</span>
                                    </div>
                                )}
                                {order.address && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-neutral-900">
                                            {i18n('pages.technicianMap.order.address')}
                                        </span>
                                        <span className="font-medium text-right">{order.address}</span>
                                    </div>
                                )}
                                {order.meterId && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-neutral-900">
                                            {i18n('pages.technicianMap.order.meter')}
                                        </span>
                                        <span className="font-medium text-right">{order.meterId}</span>
                                    </div>
                                )}
                                {order.clientAccount && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-neutral-900">
                                            {i18n('pages.technicianMap.order.account')}
                                        </span>
                                        <span className="font-medium text-right">{order.clientAccount}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-neutral-800 pt-4">
                                <Link
                                    to={`/jobs/${selectedJob.id}`}
                                    className="block w-full rounded-md bg-primary-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-primary-600 transition"
                                >
                                    {i18n('pages.technicianMap.order.review')}
                                </Link>
                            </div>
                        </div>
                    )}
                </Window>
            </Modal>
        </>
    );
};

export default Inventory;
