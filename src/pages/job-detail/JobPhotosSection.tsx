import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Photo } from '@/lib/api-client';
import { addPendingPhoto, getPendingPhotos, type PendingPhoto } from '@/lib/offline-store';
import { useOfflineContext } from '@context/offline/context.ts';
import { PendingSyncWrapper } from '@components/atoms/PendingSyncWrapper';
import { Camera, X } from 'lucide-react';

interface Props {
    jobId: number;
    photos: Photo[];
}

type SlotType = 'antes' | 'despues';

export function JobPhotosSection({ jobId, photos }: Props) {
    const queryClient = useQueryClient();
    const { online } = useOfflineContext();
    const [pendingPhotos, setPendingPhotos] = useState<Record<string, Blob>>({});
    const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        let cancelled = false;
        getPendingPhotos(jobId).then((pending: PendingPhoto[]) => {
            if (cancelled) return;
            const map: Record<string, Blob> = {};
            for (const p of pending) {
                map[p.type] = p.blob;
            }
            setPendingPhotos(map);
        });
        return () => { cancelled = true; };
    }, [jobId]);

    // Manage object URLs for pending blobs
    useEffect(() => {
        const urls: Record<string, string> = {};
        for (const [type, blob] of Object.entries(pendingPhotos)) {
            urls[type] = URL.createObjectURL(blob);
        }
        setObjectUrls(urls);
        return () => {
            for (const url of Object.values(urls)) {
                URL.revokeObjectURL(url);
            }
        };
    }, [pendingPhotos]);

    const removePhotoMutation = useMutation({
        mutationFn: (photoId: string) => apiClient.removeJobPhoto(photoId),
        onMutate: async (photoId) => {
            await queryClient.cancelQueries({ queryKey: ['job', String(jobId)] });
            const previous = queryClient.getQueryData<{ photos?: Photo[] }>(['job', String(jobId)]);
            queryClient.setQueryData(['job', String(jobId)], (old: any) =>
                old ? { ...old, photos: old.photos?.filter((p: Photo) => p.id !== photoId) } : old
            );
            return { previous };
        },
        onError: (_err, _data, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['job', String(jobId)], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['job', String(jobId)] });
        },
    });

    const handleCapture = async (file: File, type: SlotType) => {
        if (online) {
            try {
                const photo = await apiClient.uploadJobPhoto(file, jobId, type);
                queryClient.setQueryData(['job', String(jobId)], (old: any) =>
                    old ? { ...old, photos: [...(old.photos || []), photo] } : old
                );
            } catch (error) {
                console.error('Upload failed:', error);
            }
        } else {
            await addPendingPhoto({ jobId, blob: file, type });
            setPendingPhotos((prev) => ({ ...prev, [type]: file }));
        }
    };

    const renderSlot = (type: SlotType, label: string) => {
        const serverPhoto = photos.find((p) => p.type === type);
        const pendingBlob = pendingPhotos[type];
        const fileInputRef = useRef<HTMLInputElement>(null);

        return (
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-900">{label}</h3>

                {serverPhoto ? (
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                        <img src={serverPhoto.path} alt={label} className="h-full w-full object-cover" />
                        <button
                            onClick={() => removePhotoMutation.mutate(serverPhoto.id)}
                            disabled={removePhotoMutation.isPending}
                            className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : pendingBlob ? (
                    <PendingSyncWrapper pending={true}>
                        <div className="relative aspect-square overflow-hidden rounded-lg">
                            <img
                                src={objectUrls[type]}
                                alt={`${label} (pending)`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </PendingSyncWrapper>
                ) : (
                    <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-neutral-800 text-neutral-900">
                        No photo
                    </div>
                )}

                {!serverPhoto && !pendingBlob && (
                    <>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                        >
                            <Camera className="h-4 w-4" />
                            {online ? 'Add Photo' : 'Select from Library'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleCapture(file, type);
                                e.target.value = '';
                            }}
                        />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">Fotos</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {renderSlot('antes', 'Antes')}
                {renderSlot('despues', 'Despues')}
            </div>
        </div>
    );
}
