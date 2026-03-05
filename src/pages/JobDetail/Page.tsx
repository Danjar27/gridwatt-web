import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowSquareOut, CheckCircle, FloppyDisk, MapPin, Warning } from '@phosphor-icons/react';
import { getJob, updateJob, uploadJobPhoto, reopenJob } from '@lib/api/jobs.ts';
import { isOnline, getPendingPhotos, removePhoto } from '@lib/offline-store';
import { useOfflineContext } from '@context/offline/context.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { INPUT_CLASS, LABEL_CLASS } from '@components/Form/utils/constants';
import { PendingSyncWrapper } from '@components/atoms/PendingSyncWrapper';
import { useTranslations } from 'use-intl';
import * as leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { JobActivitiesSection } from './JobActivitiesSection';
import { JobSealsSection } from './JobSealsSection';
import { JobMaterialsSection } from './JobMaterialsSection';
import { JobPhotosSection } from './JobPhotosSection';
import Button from '@components/Button/Button';
import Page from '@layouts/Page';
import type { Job } from '@interfaces/job.interface.ts';

export function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { online } = useOfflineContext();
    const { user } = useAuthContext();
    const i18n = useTranslations();

    const isTechnician = user?.role?.name === 'technician';

    const [notes, setNotes] = useState('');
    const [meterReading, setMeterReading] = useState('');
    const [confirmAction, setConfirmAction] = useState<'complete' | 'reopen' | null>(null);

    const { data: job, isLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: () => getJob(Number(id)),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: (data: { notes?: string; meterReading?: string; jobStatus?: string }) =>
            updateJob(Number(id), data),
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: ['job', id] });
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            const previousJob = queryClient.getQueryData<Job>(['job', id]);
            const pendingSync = !isOnline();
            const patchedData = { ...data, ...(pendingSync ? { _pendingSync: true } : {}) };

            queryClient.setQueryData<Job>(['job', id], (old) => (old ? { ...old, ...patchedData } : old));

            const previousJobsCache = queryClient.getQueriesData<Array<Job>>({ queryKey: ['jobs'] });
            for (const [queryKey, cachedJobs] of previousJobsCache) {
                if (!Array.isArray(cachedJobs)) {
                    continue;
                }
                queryClient.setQueryData<Array<Job>>(queryKey, (jobs) =>
                    jobs?.map((j) => (j.id === Number(id) ? { ...j, ...patchedData } : j))
                );
            }

            return { previousJob, previousJobsCache };
        },
        onError: (_err, _data, context) => {
            if (context?.previousJob) {
                queryClient.setQueryData(['job', id], context.previousJob);
            }
            if (context?.previousJobsCache) {
                for (const [queryKey, cachedJobs] of context.previousJobsCache) {
                    queryClient.setQueryData(queryKey, cachedJobs);
                }
            }
        },
        onSettled: () => {
            if (isOnline()) {
                queryClient.invalidateQueries({ queryKey: ['job', id] });
                queryClient.invalidateQueries({ queryKey: ['jobs'] });
            }
        },
    });

    const reopenMutation = useMutation({
        mutationFn: () => reopenJob(Number(id)),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['job', id] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['orders', 'map-points'] });
        },
    });

    const handleSave = () => {
        updateMutation.mutate({
            notes: notes || job?.notes,
            meterReading: meterReading || job?.meterReading,
        });
    };

    const handleComplete = () => {
        getPendingPhotos(job?.id).then((pending) =>
            Promise.all(
                pending.map(async (pendingPhoto) => {
                    try {
                        const file = new File([pendingPhoto.blob], `${pendingPhoto.type}.jpg`, { type: pendingPhoto.blob.type || 'image/jpeg' });
                        await uploadJobPhoto(file, job!.id, pendingPhoto.type);
                        await removePhoto(pendingPhoto.id);
                    } catch (err) {
                        console.error('Failed to upload photo:', err);
                    }
                })
            )
        );

        updateMutation.mutate({
            notes: notes || job?.notes,
            meterReading: meterReading || job?.meterReading,
            jobStatus: 'completed',
        });
        navigate('/jobs');
    };

    const handleReopen = () => {
        reopenMutation.mutate();
        setConfirmAction(null);
    };

    const handleConfirm = () => {
        if (confirmAction === 'complete') {
            handleComplete();
        } else if (confirmAction === 'reopen') {
            handleReopen();
        }

        setConfirmAction(null);
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-neutral-900">{i18n('pages.jobDetail.notFound')}</p>
            </div>
        );
    }

    return (
        <Page id="job-detail" title={`Job #${job.id}`} subtitle={job.jobType} backRoute="/jobs">
            <PendingSyncWrapper pending={!!job._pendingSync}>
                <div className="space-y-6">
                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 s425:flex-row s425:justify-end">
                        {job.jobStatus === 'completed' ? (
                            <div className="flex items-center gap-2 rounded-lg bg-success-500/10 px-4 py-2 text-success-500">
                                <CheckCircle width={18} height={18} weight="fill" />
                                <span className="text-sm font-medium">{i18n('pages.jobDetail.completedBadge')}</span>
                            </div>
                        ) : (
                            <>
                                {!isTechnician && (
                                    <Button
                                        variant="outline"
                                        icon={FloppyDisk}
                                        disabled={updateMutation.isPending}
                                        onClick={handleSave}
                                    >
                                        {i18n('pages.jobDetail.save')}
                                    </Button>
                                )}
                                <Button
                                    variant="solid"
                                    disabled={updateMutation.isPending}
                                    onClick={() => setConfirmAction('complete')}
                                >
                                    {i18n('pages.jobDetail.complete')}
                                </Button>
                            </>
                        )}
                        {job.jobStatus === 'completed' && !isTechnician && (
                            <Button
                                variant="outline"
                                disabled={reopenMutation.isPending}
                                onClick={() => setConfirmAction('reopen')}
                            >
                                {i18n('pages.jobDetail.reopen')}
                            </Button>
                        )}
                    </div>

                    {/* Confirmation dialog */}
                    {confirmAction && (
                        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-4">
                            <p className="text-sm text-neutral-900 mb-4">
                                {confirmAction === 'complete'
                                    ? i18n('pages.jobDetail.confirmComplete')
                                    : i18n('pages.jobDetail.confirmReopen')}
                            </p>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setConfirmAction(null)}>
                                    {i18n('literal.cancel')}
                                </Button>
                                <Button variant="solid" onClick={handleConfirm}>
                                    {i18n('pages.jobDetail.confirmAction')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Offline warning */}
                    {!online && (
                        <div className="flex items-center gap-2 rounded-lg bg-secondary-500/10 p-4 text-secondary-500">
                            <Warning width={20} height={20} weight="fill" />
                            <div>
                                <p className="font-medium">{i18n('pages.jobDetail.offline')}</p>
                                <p className="text-sm">{i18n('pages.jobDetail.offlineCamera')}</p>
                            </div>
                        </div>
                    )}

                    {/* Order info + Job summary */}
                    <div className="grid grid-cols-1 gap-6 s992:grid-cols-2">
                        {job.order && (
                            <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                                <h2 className="mb-4 text-lg font-semibold">{i18n('pages.jobDetail.orderDetails')}</h2>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="text-neutral-900">{i18n('pages.jobDetail.customer')}:</span>{' '}
                                        {job.order.clientName} {job.order.clientLastName}
                                    </p>
                                    <p>
                                        <span className="text-neutral-900">{i18n('pages.jobDetail.serviceType')}:</span>{' '}
                                        {job.order.type}
                                    </p>
                                    <p>
                                        <span className="text-neutral-900">{i18n('pages.jobDetail.meterNumber')}:</span>{' '}
                                        {job.order.meterId}
                                    </p>
                                    <p>
                                        <span className="text-neutral-900">{i18n('pages.jobDetail.location')}:</span>{' '}
                                        {job.order.address}
                                    </p>
                                    {job.order.coordinateX && job.order.coordinateY && (
                                        <a
                                            href={`https://maps.google.com/?q=${job.order.coordinateY},${job.order.coordinateX}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary-500 hover:underline"
                                        >
                                            <MapPin width={16} height={16} />
                                            {i18n('pages.jobDetail.openInMaps')}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                            <h2 className="mb-4 text-lg font-semibold">{i18n('pages.jobDetail.jobInfo')}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className={LABEL_CLASS}>{i18n('pages.jobDetail.meterReading')}</label>
                                    <input
                                        type="text"
                                        value={meterReading || job.meterReading || ''}
                                        onChange={(e) => setMeterReading(e.target.value)}
                                        className={`mt-1 ${INPUT_CLASS}`}
                                        placeholder={i18n('pages.jobDetail.meterReadingPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>{i18n('pages.jobDetail.notes')}</label>
                                    <textarea
                                        value={notes || job.notes || ''}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={4}
                                        className={`mt-1 ${INPUT_CLASS}`}
                                        placeholder={i18n('pages.jobDetail.notesPlaceholder')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <JobPhotosSection jobId={job.id} photos={job.photos ?? []} />
                    <JobActivitiesSection jobId={job.id} jobActivities={job.jobActivities ?? []} />
                    <JobSealsSection jobId={job.id} jobSeals={job.jobSeals ?? []} />
                    <JobMaterialsSection jobId={job.id} workMaterials={job.workMaterials ?? []} />

                    {/* Location map */}
                    {job.order?.coordinateX && job.order?.coordinateY && (
                        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                            <h2 className="mb-4 text-lg font-semibold">{i18n('pages.jobDetail.location')}</h2>
                            <JobLocationMap lat={job.order.coordinateY} lng={job.order.coordinateX} />
                            <a
                                href={
                                    /iPhone|iPad|iPod/i.test(navigator.userAgent)
                                        ? `maps://maps.apple.com/?q=${job.order.coordinateY},${job.order.coordinateX}`
                                        : `https://maps.google.com/?q=${job.order.coordinateY},${job.order.coordinateX}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                            >
                                <ArrowSquareOut width={16} height={16} />
                                {i18n('pages.jobDetail.openInMaps')}
                            </a>
                        </div>
                    )}
                </div>
            </PendingSyncWrapper>
        </Page>
    );
}

function JobLocationMap({ lat, lng }: { lat: number; lng: number }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<leaflet.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) {
            return;
        }
        const map = leaflet.map(mapRef.current).setView([lat, lng], 15);
        leaflet
            .tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                attribution: '&copy; OSM &copy; CARTO',
                subdomains: 'abcd',
            })
            .addTo(map);
        leaflet.marker([lat, lng]).addTo(map);
        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [lat, lng]);

    return <div ref={mapRef} className="h-48 w-full rounded" />;
}
