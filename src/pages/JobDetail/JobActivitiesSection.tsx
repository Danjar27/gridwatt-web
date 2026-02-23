import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from '@phosphor-icons/react';
import { apiClient, type Job, type JobActivity } from '@lib/api-client';
import { isOnline } from '@lib/offline-store';
import Modal from '@components/Modal/Modal';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import Button from '@components/Button/Button';
import { markJobPendingInLists } from './utils';
import { useTranslations } from 'use-intl';

interface Props {
    jobId: number;
    jobActivities: Array<JobActivity>;
}

export function JobActivitiesSection({ jobId, jobActivities }: Props) {
    const queryClient = useQueryClient();
    const i18n = useTranslations();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedActivityId, setSelectedActivityId] = useState('');

    const { data: activitiesData } = useQuery({
        queryKey: ['activities'],
        queryFn: () => apiClient.getActivities({ limit: 200 }),
    });

    const jobKey = ['job', String(jobId)];

    const addMutation = useMutation({
        mutationFn: (activityId: string) => apiClient.addJobActivity(jobId, activityId),
        onMutate: async (activityId) => {
            await queryClient.cancelQueries({ queryKey: jobKey });
            const previous = queryClient.getQueryData<Job>(jobKey);
            const activity = activitiesData?.data.find((a) => a.id === activityId);
            const tempJobActivity: JobActivity = {
                id: `temp-${Date.now()}`,
                jobId,
                activityId,
                activity: activity ?? undefined,
            };
            const pendingSync = !isOnline();
            queryClient.setQueryData<Job>(jobKey, (old) =>
                old
                    ? {
                          ...old,
                          jobActivities: [...(old.jobActivities ?? []), tempJobActivity],
                          ...(pendingSync ? { _pendingSync: true } : {}),
                      }
                    : old
            );
            if (pendingSync) markJobPendingInLists(queryClient, jobId);
            setSelectedActivityId('');
            setModalOpen(false);
            return { previous };
        },
        onError: (_err, _data, context) => {
            if (context?.previous) queryClient.setQueryData(jobKey, context.previous);
        },
        onSettled: () => {
            if (isOnline()) queryClient.invalidateQueries({ queryKey: jobKey });
        },
    });

    const removeMutation = useMutation({
        mutationFn: (jobActivityId: string) => apiClient.removeJobActivity(jobActivityId),
        onMutate: async (jobActivityId) => {
            await queryClient.cancelQueries({ queryKey: jobKey });
            const previous = queryClient.getQueryData<Job>(jobKey);
            const pendingSync = !isOnline();
            queryClient.setQueryData<Job>(jobKey, (old) =>
                old
                    ? {
                          ...old,
                          jobActivities: old.jobActivities?.filter((ja) => ja.id !== jobActivityId),
                          ...(pendingSync ? { _pendingSync: true } : {}),
                      }
                    : old
            );
            if (pendingSync) markJobPendingInLists(queryClient, jobId);
            return { previous };
        },
        onError: (_err, _data, context) => {
            if (context?.previous) queryClient.setQueryData(jobKey, context.previous);
        },
        onSettled: () => {
            if (isOnline()) queryClient.invalidateQueries({ queryKey: jobKey });
        },
    });

    const addedIds = new Set(jobActivities.map((ja) => ja.activityId));
    const availableActivities = activitiesData?.data.filter((a) => a.isActive && !addedIds.has(a.id)) ?? [];

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{i18n('pages.jobDetail.activities.title')}</h2>
                <Button variant="solid" icon={Plus} onClick={() => setModalOpen(true)}>
                    {i18n('literal.add')}
                </Button>
            </div>

            {jobActivities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {jobActivities.map((ja) => (
                        <span
                            key={ja.id}
                            className="flex items-center gap-1 rounded-full bg-primary-500/20 px-3 py-1 text-sm text-primary-500"
                        >
                            {ja.activity?.name}
                            <button
                                onClick={() => removeMutation.mutate(ja.id)}
                                disabled={removeMutation.isPending}
                                className="ml-1 rounded-full p-0.5 hover:bg-primary-500/30"
                            >
                                <X width={12} height={12} />
                            </button>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-center text-neutral-900">{i18n('pages.jobDetail.activities.empty')}</p>
            )}

            <Modal onOpen={modalOpen} onClose={() => setModalOpen(false)} title={i18n('pages.jobDetail.activities.modal')}>
                <div className="space-y-4">
                    <select
                        value={selectedActivityId}
                        onChange={(e) => setSelectedActivityId(e.target.value)}
                        className={INPUT_CLASS}
                    >
                        <option value="">{i18n('pages.jobDetail.activities.select')}</option>
                        {availableActivities.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        variant="solid"
                        disabled={!selectedActivityId || addMutation.isPending}
                        onClick={() => selectedActivityId && addMutation.mutate(selectedActivityId)}
                    >
                        {i18n('literal.add')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
