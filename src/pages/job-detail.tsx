import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { addOfflineMutation, addPendingPhoto } from '@/lib/offline-store';
import { useState } from 'react';
import { Camera, Save, MapPin, AlertCircle } from 'lucide-react';
import { useOfflineContext } from '@context/offline/context.ts';

export function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { online } = useOfflineContext();

    const [notes, setNotes] = useState('');
    const [meterReading, setMeterReading] = useState('');
    const [_selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: job, isLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: () => apiClient.getJob(Number(id)),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { notes?: string; meterReading?: string; jobStatus?: string }) => {
            if (online) {
                return apiClient.updateJob(Number(id), data);
            } else {
                // Queue for offline sync
                await addOfflineMutation({
                    type: 'job',
                    action: 'update',
                    data,
                    endpoint: `/api/jobs/${id}`,
                    method: 'PUT',
                });

                return { ...job, ...data };
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job', id] });
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
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
    };

    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        setSelectedFile(file);

        if (!online) {
            // Store file reference for later upload
            await addPendingPhoto({
                jobId: Number(id),
                localPath: file.name, // Store name as reference
                type: 'photo',
                notes: '',
            });
            alert('Photo saved for upload when you are back online.');
        } else {
            // Upload immediately
            try {
                const result = await apiClient.uploadFile(file);
                await apiClient.addJobPhoto(Number(id), result.path, 'photo');
                queryClient.invalidateQueries({ queryKey: ['job', id] });
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">Job not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Job #{job.id}</h1>
                    <p className="text-muted-foreground">{job.jobType}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
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
                <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-4 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                        <p className="font-medium">You're offline</p>
                        <p className="text-sm">
                            Camera is not available offline. Please select images from your library instead.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Order Info */}
                {job.order && (
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="mb-4 text-lg font-semibold">Order Details</h2>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">Customer:</span> {job.order.firstName}{' '}
                                {job.order.lastName}
                            </p>
                            <p>
                                <span className="text-muted-foreground">Service Type:</span> {job.order.serviceType}
                            </p>
                            <p>
                                <span className="text-muted-foreground">Meter Number:</span> {job.order.meterNumber}
                            </p>
                            <p>
                                <span className="text-muted-foreground">Location:</span> {job.order.orderLocation}
                            </p>
                            {job.order.latitude && job.order.longitude && (
                                <a
                                    href={`https://maps.google.com/?q=${job.order.latitude},${job.order.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-primary hover:underline"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Open in Maps
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Job Form */}
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Job Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Meter Reading</label>
                            <input
                                type="text"
                                value={meterReading || job.meterReading || ''}
                                onChange={(e) => setMeterReading(e.target.value)}
                                className="mt-1 block w-full rounded-lg border px-3 py-2"
                                placeholder="Enter meter reading"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground">Notes</label>
                            <textarea
                                value={notes || job.notes || ''}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-lg border px-3 py-2"
                                placeholder="Enter notes..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Photos */}
            <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Photos</h2>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                        <Camera className="h-4 w-4" />
                        {online ? 'Add Photo' : 'Select from Library'}
                        <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                    </label>
                </div>

                {job.photos && job.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {job.photos.map((photo) => (
                            <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg">
                                <img src={photo.path} alt={photo.type} className="h-full w-full object-cover" />
                                <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                                    {photo.type}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground">No photos yet</p>
                )}
            </div>

            {/* Activities */}
            {job.jobActivities && job.jobActivities.length > 0 && (
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Activities</h2>
                    <div className="flex flex-wrap gap-2">
                        {job.jobActivities.map((ja) => (
                            <span key={ja.id} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                {ja.activity?.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Materials */}
            {job.workMaterials && job.workMaterials.length > 0 && (
                <div className="rounded-lg border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Materials Used</h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 text-left">Material</th>
                                <th className="py-2 text-right">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {job.workMaterials.map((wm) => (
                                <tr key={wm.id} className="border-b">
                                    <td className="py-2">{wm.material?.name}</td>
                                    <td className="py-2 text-right">
                                        {wm.quantity} {wm.material?.unit}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
