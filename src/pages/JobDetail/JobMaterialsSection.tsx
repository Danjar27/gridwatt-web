import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash } from '@phosphor-icons/react';
import { addJobMaterial, removeJobMaterial } from '@lib/api/jobs.ts';
import { getMaterials, getMyMaterials } from '@lib/api/materials.ts';
import { isOnline } from '@lib/offline-store';
import Modal from '@components/Modal/Modal';
import Window from '@components/Modal/blocks/Window';
import { INPUT_CLASS } from '@components/Form/utils/constants';
import Dropdown from '@components/Dropdown/Dropdown';
import Button from '@components/Button/Button';
import { markJobPendingInLists } from './utils';
import { useTranslations } from 'use-intl';
import { useAuthContext } from '@context/auth/context.ts';
import type { Job } from '@interfaces/job.interface.ts';
import type { WorkMaterial, AssignedMaterial, Material } from '@interfaces/material.interface.ts';

interface Props {
    jobId: number;
    workMaterials: Array<WorkMaterial>;
}

export function JobMaterialsSection({ jobId, workMaterials }: Props) {
    const queryClient = useQueryClient();
    const i18n = useTranslations();
    const { user } = useAuthContext();
    const isTechnician = user?.role?.name === 'technician';
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [quantity, setQuantity] = useState('');

    const { data: allMaterialsData } = useQuery({
        queryKey: ['materials'],
        queryFn: () => getMaterials({ limit: 200 }),
        enabled: !isTechnician,
    });

    const { data: myMaterialsData } = useQuery({
        queryKey: ['materials', 'my'],
        queryFn: getMyMaterials,
        enabled: isTechnician,
    });

    const availableForAdd: Array<Material & { assignedQuantity?: number }> = isTechnician
        ? (myMaterialsData ?? [])
        : (allMaterialsData?.data ?? []);

    const selectedAssigned = isTechnician
        ? (myMaterialsData ?? []).find((m: AssignedMaterial) => m.id === selectedMaterialId)
        : null;
    const maxQuantity = selectedAssigned ? selectedAssigned.assignedQuantity : undefined;

    const jobKey = ['job', String(jobId)];

    const addMutation = useMutation({
        mutationFn: ({ materialId, qty }: { materialId: string; qty: number }) =>
            addJobMaterial(jobId, materialId, qty),
        onMutate: async ({ materialId, qty }) => {
            await queryClient.cancelQueries({ queryKey: jobKey });
            const previous = queryClient.getQueryData<Job>(jobKey);
            const material = availableForAdd.find((m) => m.id === materialId);
            const tempWorkMaterial: WorkMaterial = {
                id: -Date.now(),
                jobId,
                quantity: qty,
                material: material ?? undefined,
            };
            const pendingSync = !isOnline();
            queryClient.setQueryData<Job>(jobKey, (old) =>
                old
                    ? {
                          ...old,
                          materials: [...(old.materials ?? []), tempWorkMaterial],
                          ...(pendingSync ? { _pendingSync: true } : {}),
                      }
                    : old
            );
            if (pendingSync) {
                markJobPendingInLists(queryClient, jobId);
            }
            setSelectedMaterialId('');
            setQuantity('');
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
        mutationFn: (materialId: string) => removeJobMaterial(jobId, materialId),
        onMutate: async (materialId) => {
            await queryClient.cancelQueries({ queryKey: jobKey });
            const previous = queryClient.getQueryData<Job>(jobKey);
            const pendingSync = !isOnline();
            queryClient.setQueryData<Job>(jobKey, (old) =>
                old
                    ? {
                          ...old,
                          materials: old.materials?.filter((wm) => wm.material?.id !== materialId),
                          ...(pendingSync ? { _pendingSync: true } : {}),
                      }
                    : old
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

    const addedIds = new Set(workMaterials.map((wm) => wm.material?.id));
    const availableMaterials = availableForAdd.filter((m) => !addedIds.has(m.id));

    const handleMaterialChange = (materialId: string) => {
        setSelectedMaterialId(materialId);
    };

    const handleAdd = () => {
        const qty = Number(quantity);
        if (selectedMaterialId && qty > 0) {
            addMutation.mutate({ materialId: selectedMaterialId, qty });
        }
    };

    return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-600/60 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{i18n('pages.jobDetail.materials.title')}</h2>
                <Button variant="solid" icon={Plus} onClick={() => setModalOpen(true)}>
                    {i18n('literal.add')}
                </Button>
            </div>

            {workMaterials.length > 0 ? (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-800">
                            <th className="py-2 text-left">{i18n('pages.jobDetail.materials.material')}</th>
                            <th className="py-2 text-right">{i18n('pages.jobDetail.materials.quantity')}</th>
                            <th className="w-10 py-2 text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {workMaterials.map((wm) => (
                            <tr key={wm.id} className="border-b border-neutral-800">
                                <td className="py-2">{wm.material?.name}</td>
                                <td className="py-2 text-right">
                                    {wm.quantity} {wm.material?.unit}
                                </td>
                                <td className="py-2 text-right">
                                    <button
                                        onClick={() => removeMutation.mutate(wm.material!.id)}
                                        disabled={removeMutation.isPending}
                                        className="rounded p-1 text-error-400 hover:bg-error-400/20"
                                    >
                                        <Trash width={16} height={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-neutral-900">{i18n('pages.jobDetail.materials.empty')}</p>
            )}

            <Modal
                id="job-materials-modal"
                isOpen={modalOpen}
                onOpen={() => setModalOpen(true)}
                onClose={() => setModalOpen(false)}
            >
                <Window title={i18n('pages.jobDetail.materials.modal')} className="w-full max-w-sm px-4">
                    <div className="space-y-4">
                        <Dropdown
                            value={selectedMaterialId}
                            onChange={(v) => handleMaterialChange(v as string)}
                            options={[
                                { label: i18n('pages.jobDetail.materials.select'), value: '' },
                                ...availableMaterials.map((m) => ({ label: m.name, value: m.id })),
                            ]}
                        />
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="0"
                            max={maxQuantity}
                            placeholder={i18n('pages.jobDetail.materials.quantity')}
                            className={INPUT_CLASS}
                        />
                        <Button
                            variant="solid"
                            disabled={
                                !selectedMaterialId || !quantity || Number(quantity) <= 0 || addMutation.isPending
                            }
                            onClick={handleAdd}
                        >
                            {i18n('literal.add')}
                        </Button>
                    </div>
                </Window>
            </Modal>
        </div>
    );
}
