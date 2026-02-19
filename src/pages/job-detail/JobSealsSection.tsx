import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Plus } from 'lucide-react';
import { apiClient, type Job, type JobSeal } from '@/lib/api-client';
import { isOnline } from '@/lib/offline-store';
import Modal from '@components/Modal/Modal';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import { markJobPendingInLists } from './utils';

interface Props {
    jobId: number;
    jobSeals: JobSeal[];
}

export function JobSealsSection({ jobId, jobSeals }: Props) {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSealId, setSelectedSealId] = useState('');

    const { data: sealsData } = useQuery({
        queryKey: ['seals'],
        queryFn: () => apiClient.getSeals({ limit: 200 }),
    });

    const jobKey = ['job', String(jobId)];

    const addMutation = useMutation({
        mutationFn: (sealId: string) => apiClient.addJobSeal(jobId, sealId),
        onMutate: async (sealId) => {
            await queryClient.cancelQueries({ queryKey: jobKey });
            const previous = queryClient.getQueryData<Job>(jobKey);
            const seal = sealsData?.data.find((s) => s.id === sealId);
            const tempJobSeal: JobSeal = {
                id: `temp-${Date.now()}`,
                jobId,
                sealId,
                seal: seal ?? undefined,
            };
            const pendingSync = !isOnline();
            queryClient.setQueryData<Job>(jobKey, (old) =>
                old ? { ...old, jobSeals: [...(old.jobSeals ?? []), tempJobSeal], ...(pendingSync ? { _pendingSync: true } : {}) } : old
            );
            if (pendingSync) {
                markJobPendingInLists(queryClient, jobId);
            }
            setSelectedSealId('');
            setModalOpen(false);
            return { previous };
        },
        onError: (_err, _data, context) => {
            if (context?.previous) {
                queryClient.setQueryData(jobKey, context.previous);
            }
        },
        onSettled: () => {
            if (isOnline()) {
                queryClient.invalidateQueries({ queryKey: jobKey });
            }
        },
    });

    const removeMutation = useMutation({
        mutationFn: (jobSealId: string) => apiClient.removeJobSeal(jobSealId),
        onMutate: async (jobSealId) => {
            await queryClient.cancelQueries({ queryKey: jobKey });
            const previous = queryClient.getQueryData<Job>(jobKey);
            const pendingSync = !isOnline();
            queryClient.setQueryData<Job>(jobKey, (old) =>
                old ? { ...old, jobSeals: old.jobSeals?.filter((js) => js.id !== jobSealId), ...(pendingSync ? { _pendingSync: true } : {}) } : old
            );
            if (pendingSync) {
                markJobPendingInLists(queryClient, jobId);
            }
            return { previous };
        },
        onError: (_err, _data, context) => {
            if (context?.previous) {
                queryClient.setQueryData(jobKey, context.previous);
            }
        },
        onSettled: () => {
            if (isOnline()) {
                queryClient.invalidateQueries({ queryKey: jobKey });
            }
        },
    });

    const addedIds = new Set(jobSeals.map((js) => js.sealId));
    const availableSeals = sealsData?.data.filter((s) => s.isActive && !addedIds.has(s.id)) ?? [];

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Seals</h2>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </button>
            </div>

            {jobSeals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {jobSeals.map((js) => (
                        <span
                            key={js.id}
                            className="flex items-center gap-1 rounded-full bg-primary-500/20 px-3 py-1 text-sm text-primary-500"
                        >
                            {js.seal?.name}
                            <button
                                onClick={() => removeMutation.mutate(js.id)}
                                disabled={removeMutation.isPending}
                                className="ml-1 rounded-full p-0.5 hover:bg-primary-500/30"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-center text-neutral-900">No seals added</p>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Seal">
                <div className="space-y-4">
                    <select
                        value={selectedSealId}
                        onChange={(e) => setSelectedSealId(e.target.value)}
                        className={INPUT_CLASS}
                    >
                        <option value="">Select a seal...</option>
                        {availableSeals.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => selectedSealId && addMutation.mutate(selectedSealId)}
                        disabled={!selectedSealId || addMutation.isPending}
                        className="w-full rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </Modal>
        </div>
    );
}
