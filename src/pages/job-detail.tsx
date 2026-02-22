import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Job } from '@/lib/api-client';
import { isOnline } from '@/lib/offline-store';
import { useState, useEffect, useRef } from 'react';
import { Save, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { PendingSyncWrapper } from '@components/atoms/PendingSyncWrapper';
import { useOfflineContext } from '@context/offline/context.ts';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import { JobActivitiesSection } from './job-detail/JobActivitiesSection';
import { JobSealsSection } from './job-detail/JobSealsSection';
import { JobMaterialsSection } from './job-detail/JobMaterialsSection';
import { JobPhotosSection } from './job-detail/JobPhotosSection';
import * as leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { online } = useOfflineContext();

    const [notes, setNotes] = useState('');
    const [meterReading, setMeterReading] = useState('');

    const { data: job, isLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: () => apiClient.getJob(Number(id)),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: (data: { notes?: string; meterReading?: string; jobStatus?: string }) =>
            apiClient.updateJob(Number(id), data),
        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: ['job', id] });
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            const previousJob = queryClient.getQueryData<Job>(['job', id]);
            const pendingSync = !isOnline();
            const patchedData = { ...data, ...(pendingSync ? { _pendingSync: true } : {}) };

            queryClient.setQueryData<Job>(['job', id], (old) =>
                old ? { ...old, ...patchedData } : old
            );

            // Update ALL jobs list caches so navigation back shows the change
            // (covers ['jobs', 'my'], ['jobs', 'all', ...], etc.)
            const previousJobsCache = queryClient.getQueriesData<Array<Job>>({ queryKey: ['jobs'] });
            for (const [queryKey, cachedJobs] of previousJobsCache) {
                if (!Array.isArray(cachedJobs)) {continue;}
                queryClient.setQueryData<Array<Job>>(queryKey, (jobs) =>
                    jobs?.map((j) =>
                        j.id === Number(id) ? { ...j, ...patchedData } : j
                    )
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

    const handleSave = () => {
        updateMutation.mutate({
            notes: notes || job?.notes,
            meterReading: meterReading || job?.meterReading,
        });
    };

    const handleComplete = () => {
        updateMutation.mutate({
            notes: notes || job?.notes,
            meterReading: meterReading || job?.meterReading,
            jobStatus: 'completed',
        });
        navigate('/jobs');
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
                <p className="text-neutral-900">Job not found</p>
            </div>
        );
    }

    const hasPendingSync = !!job._pendingSync;

    return (
        <PendingSyncWrapper pending={hasPendingSync}>
        <div className="space-y-6">
            <div className="flex flex-col s425:flex-row items-start s425:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl s768:text-2xl font-bold">Job #{job.id}</h1>
                    <p className="text-neutral-900">{job.jobType}</p>
                </div>
                <div className="flex flex-col s425:flex-row gap-2">
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        Save
                    </button>
                    {job.jobStatus !== 'completed' && (
                        <button
                            onClick={handleComplete}
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            Complete Job
                        </button>
                    )}
                </div>
            </div>

            {!online && (
                <div className="flex items-center gap-2 rounded-lg bg-secondary-500/10 p-4 text-secondary-500">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                        <p className="font-medium">You're offline</p>
                        <p className="text-sm">
                            Camera is not available offline. Please select images from your library instead.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 grid-cols-1 s992:grid-cols-2">
                {/* Order Info */}
                {job.order && (
                    <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                        <h2 className="mb-4 text-lg font-semibold">Order Details</h2>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="text-neutral-900">Customer:</span> {job.order.firstName}{' '}
                                {job.order.lastName}
                            </p>
                            <p>
                                <span className="text-neutral-900">Service Type:</span> {job.order.serviceType}
                            </p>
                            <p>
                                <span className="text-neutral-900">Meter Number:</span> {job.order.meterNumber}
                            </p>
                            <p>
                                <span className="text-neutral-900">Location:</span> {job.order.orderLocation}
                            </p>
                            {job.order.latitude && job.order.longitude && (
                                <a
                                    href={`https://maps.google.com/?q=${job.order.latitude},${job.order.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-primary-500 hover:underline"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Open in Maps
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Job Summary */}
                <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                    <h2 className="mb-4 text-lg font-semibold">Job Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-900">Meter Reading</label>
                            <input
                                type="text"
                                value={meterReading || job.meterReading || ''}
                                onChange={(e) => setMeterReading(e.target.value)}
                                className={`mt-1 ${INPUT_CLASS}`}
                                placeholder="Enter meter reading"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-900">Notes</label>
                            <textarea
                                value={notes || job.notes || ''}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className={`mt-1 ${INPUT_CLASS}`}
                                placeholder="Enter notes..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Photos */}
            <JobPhotosSection jobId={job.id} photos={job.photos ?? []} />

            {/* Activities */}
            <JobActivitiesSection jobId={job.id} jobActivities={job.jobActivities ?? []} />

            {/* Seals */}
            <JobSealsSection jobId={job.id} jobSeals={job.jobSeals ?? []} />

            {/* Materials */}
            <JobMaterialsSection jobId={job.id} workMaterials={job.workMaterials ?? []} />

            {/* Location Mini Map */}
            {job.order?.latitude && job.order?.longitude && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
                    <h2 className="mb-4 text-lg font-semibold">Location</h2>
                    <JobLocationMap lat={job.order.latitude} lng={job.order.longitude} />
                    <a
                        href={
                            /iPhone|iPad|iPod/i.test(navigator.userAgent)
                                ? `maps://maps.apple.com/?q=${job.order.latitude},${job.order.longitude}`
                                : `https://maps.google.com/?q=${job.order.latitude},${job.order.longitude}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Open in Maps
                    </a>
                </div>
            )}
        </div>
        </PendingSyncWrapper>
    );
}

function JobLocationMap({ lat, lng }: { lat: number; lng: number }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<leaflet.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) {return;}
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
