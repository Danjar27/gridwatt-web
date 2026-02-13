import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { Eye, MapPin } from 'lucide-react';
import { useAuthContext } from '@context/auth/context.ts';

export function JobsPage() {
    const { user } = useAuthContext();
    const userRole = user?.role?.name || user?.roleName;
    const isTechnician = userRole === 'technician';

    const { data: jobs = [], isLoading } = useQuery({
        queryKey: ['jobs', isTechnician ? 'my' : 'all'],
        queryFn: () => (isTechnician ? apiClient.getMyJobs() : apiClient.getJobs()),
    });

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Jobs</h1>
                    <p className="text-muted-foreground">{isTechnician ? 'Your assigned jobs' : 'Manage all jobs'}</p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border bg-card">
                    <p className="text-lg font-medium text-muted-foreground">No jobs found</p>
                    <p className="text-sm text-muted-foreground">
                        {isTechnician ? 'You have no assigned jobs' : 'No jobs in the system yet'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 s425:grid-cols-2 s992:grid-cols-3">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold">Job #{job.id}</h3>
                                    <p className="text-sm text-muted-foreground">{job.jobType}</p>
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
                                        <span className="text-muted-foreground">Customer:</span> {job.order.firstName}{' '}
                                        {job.order.lastName}
                                    </p>
                                    <p>
                                        <span className="text-muted-foreground">Meter:</span> {job.order.meterNumber}
                                    </p>
                                    {job.order.latitude && job.order.longitude && (
                                        <p className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">Has location</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t pt-3">
                                <p className="text-xs text-muted-foreground">
                                    {new Date(job.startDateTime).toLocaleDateString()}
                                </p>
                                <Link
                                    to={`/jobs/${job.id}`}
                                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                    <Eye className="h-4 w-4" />
                                    View
                                </Link>
                            </div>

                            {!job.synchronized && (
                                <div className="mt-2 rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                                    Not synced
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
