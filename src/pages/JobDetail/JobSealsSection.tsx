import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from '@phosphor-icons/react';
import { apiClient } from '@lib/api-client';
import { isOnline } from '@lib/offline-store';
import Modal from '@components/Modal/Modal';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import Button from '@components/Button/Button';
import { markJobPendingInLists } from './utils';
import { useTranslations } from 'use-intl';
import type { Job } from "@interfaces/job.interface.ts";
import type { JobSeal } from '@interfaces/seal.interface.ts';

interface Props {
    jobId: number;
    jobSeals: Array<JobSeal>;
}

export function JobSealsSection({ jobId, jobSeals }: Props) {
    const queryClient = useQueryClient();
    const i18n = useTranslations();
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
                old
                    ? {
                          ...old,
                          jobSeals: [...(old.jobSeals ?? []), tempJobSeal],
                          ...(pendingSync ? { _pendingSync: true } : {}),
                      }
                    : old
            );
            if (pendingSync) {markJobPendingInLists(queryClient, jobId);}
            setSelectedSealId('');
            setModalOpen(false);

            return { previous };
        },
        onError: (_err, _data, context) => {
            if (context?.previous) {queryClient.setQueryData(jobKey, context.previous);}
        },
        onSettled: () => {
            if (isOnline()) {queryClient.invalidateQueries({ queryKey: jobKey });}
        },
    });

    const removeMutation = useMutation({
        mutationFn: (jobSealId: string) => apiClient.removeJobSeal(jobSealId),
        onMutate: async (jobSealId) => {
            await queryClient.cancelQueries({ queryKey: jobKey });
            const previous = queryClient.getQueryData<Job>(jobKey);
            const pendingSync = !isOnline();
            queryClient.setQueryData<Job>(jobKey, (old) =>
                old
                    ? {
                          ...old,
                          jobSeals: old.jobSeals?.filter((js) => js.id !== jobSealId),
                          ...(pendingSync ? { _pendingSync: true } : {}),
                      }
                    : old
            );
            if (pendingSync) {markJobPendingInLists(queryClient, jobId);}

            return { previous };
        },
        onError: (_err, _data, context) => {
            if (context?.previous) {queryClient.setQueryData(jobKey, context.previous);}
        },
        onSettled: () => {
            if (isOnline()) {queryClient.invalidateQueries({ queryKey: jobKey });}
        },
    });

    const addedIds = new Set(jobSeals.map((js) => js.sealId));
    const availableSeals = sealsData?.data.filter((s) => s.isActive && !addedIds.has(s.id)) ?? [];

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{i18n('pages.jobDetail.seals.title')}</h2>
                <Button variant="solid" icon={Plus} onClick={() => setModalOpen(true)}>
                    {i18n('literal.add')}
                </Button>
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
                                <X width={12} height={12} />
                            </button>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-center text-neutral-900">{i18n('pages.jobDetail.seals.empty')}</p>
            )}

            <Modal onOpen={modalOpen} onClose={() => setModalOpen(false)} title={i18n('pages.jobDetail.seals.modal')}>
                <div className="space-y-4">
                    <select
                        value={selectedSealId}
                        onChange={(e) => setSelectedSealId(e.target.value)}
                        className={INPUT_CLASS}
                    >
                        <option value="">{i18n('pages.jobDetail.seals.select')}</option>
                        {availableSeals.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        variant="solid"
                        disabled={!selectedSealId || addMutation.isPending}
                        onClick={() => selectedSealId && addMutation.mutate(selectedSealId)}
                    >
                        {i18n('literal.add')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
