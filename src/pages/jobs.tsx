import { useQuery } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { apiClient, type Job } from '@/lib/api-client';
import { Eye, MapPin } from 'lucide-react';
import { PendingSyncWrapper } from '@components/atoms/PendingSyncWrapper';
import { useAuthContext } from '@context/auth/context.ts';
import { useState } from 'react';
import { INPUT_CLASS } from '@components/Form/utils/constants';

export function JobsPage() {
    const { user } = useAuthContext();
    const userRole = user?.role?.name;
    const isTechnician = userRole === 'technician';

    if (userRole === 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const [filterTechnicianId, setFilterTechnicianId] = useState<number | null>(null);

    const { data: technicians = [] } = useQuery({
        queryKey: ['technicians'],
        queryFn: () => apiClient.getTechnicians(),
        enabled: !isTechnician,
    });

    const { data: jobs = [], isLoading } = useQuery<Array<Job>, Error>({
        queryKey: ['jobs', isTechnician ? 'my' : 'all', filterTechnicianId],
        queryFn: async () => {
            if (isTechnician) {
                return await apiClient.getMyJobs();
            } else {
                const res = await apiClient.getJobs({
                    limit: 10000,
                    ...(filterTechnicianId ? { technicianId: filterTechnicianId } : {}),
                });

                return res.data;
            }
        },
    });

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'bg-success-500/20 text-success-500';
            case 'in_progress':
                return 'bg-primary-500/20 text-primary-500';
            default:
                return 'bg-secondary-500/20 text-secondary-500';
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Jobs</h1>
                    <p className="text-neutral-900">{isTechnician ? 'Your assigned jobs' : 'Manage all jobs'}</p>
                </div>
                {!isTechnician && (
                    <select
                        className={INPUT_CLASS}
                        value={filterTechnicianId ?? ''}
                        onChange={(e) => setFilterTechnicianId(e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">All technicians</option>
                        {technicians.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                                {tech.name} {tech.lastName}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {jobs.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-600/60">
                    <p className="text-lg font-medium text-neutral-900">No jobs found</p>
                    <p className="text-sm text-neutral-900">
                        {isTechnician ? 'You have no assigned jobs' : 'No jobs in the system yet'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 s425:grid-cols-2 s992:grid-cols-3">
                    {jobs.map((job) => (
                        <PendingSyncWrapper key={job.id} pending={!!job._pendingSync}>
                            <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-4 shadow-sm transition-shadow hover:shadow-md">
                                <div className="mb-3 flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">Job #{job.id}</h3>
                                        <p className="text-sm text-neutral-900">{job.jobType}</p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(job.jobStatus)}`}
                                    >
                                        {job.jobStatus || 'pending'}
                                    </span>
                                </div>

                                {job.order && (
                                    <div className="mb-3 space-y-1 text-sm">
                                        <p>
                                            <span className="text-neutral-900">Customer:</span> {job.order.firstName}{' '}
                                            {job.order.lastName}
                                        </p>
                                        <p>
                                            <span className="text-neutral-900">Meter:</span> {job.order.meterNumber}
                                        </p>
                                        {job.order.latitude && job.order.longitude && (
                                            <p className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-neutral-900" />
                                                <span className="text-neutral-900">Has location</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                                    <p className="text-xs text-neutral-900">
                                        {new Date(job.startDateTime).toLocaleDateString()}
                                    </p>
                                    <Link
                                        to={`/jobs/${job.id}`}
                                        className="flex items-center gap-1 text-sm text-primary-500 hover:underline"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View
                                    </Link>
                                </div>
                            </div>
                        </PendingSyncWrapper>
                    ))}
                </div>
            )}
        </div>
    );
}
