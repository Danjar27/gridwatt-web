import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus } from 'lucide-react';
import { apiClient, type WorkMaterial, type Material } from '@/lib/api-client';
import Modal from '@components/Modal/Modal';
import { INPUT_CLASS } from '@components/Form/utils/constants';

interface Props {
    jobId: number;
    workMaterials: WorkMaterial[];
}

export function JobMaterialsSection({ jobId, workMaterials }: Props) {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

    const { data: materialsData } = useQuery({
        queryKey: ['materials'],
        queryFn: () => apiClient.getMaterials({ limit: 200 }),
        enabled: modalOpen,
    });

    const addMutation = useMutation({
        mutationFn: ({ materialId, qty }: { materialId: string; qty: number }) =>
            apiClient.addJobMaterial(jobId, materialId, qty),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job', String(jobId)] });
            setSelectedMaterialId('');
            setQuantity('');
            setSelectedMaterial(null);
            setModalOpen(false);
        },
    });

    const removeMutation = useMutation({
        mutationFn: (workMaterialId: string) => apiClient.removeJobMaterial(workMaterialId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job', String(jobId)] });
        },
    });

    const addedIds = new Set(workMaterials.map((wm) => wm.materialId));
    const availableMaterials = materialsData?.data.filter((m) => m.isActive && !addedIds.has(m.id)) ?? [];

    const handleMaterialChange = (materialId: string) => {
        setSelectedMaterialId(materialId);
        setSelectedMaterial(availableMaterials.find((m) => m.id === materialId) ?? null);
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
                <h2 className="text-lg font-semibold">Materials</h2>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </button>
            </div>

            {workMaterials.length > 0 ? (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-800">
                            <th className="py-2 text-left">Material</th>
                            <th className="py-2 text-right">Quantity</th>
                            <th className="py-2 text-right w-10"></th>
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
                                        onClick={() => removeMutation.mutate(wm.id)}
                                        disabled={removeMutation.isPending}
                                        className="rounded p-1 text-red-400 hover:bg-red-400/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-neutral-900">No materials added</p>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Material">
                <div className="space-y-4">
                    <select
                        value={selectedMaterialId}
                        onChange={(e) => handleMaterialChange(e.target.value)}
                        className={INPUT_CLASS}
                    >
                        <option value="">Select a material...</option>
                        {availableMaterials.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        step={selectedMaterial?.allowsDecimals ? '0.01' : '1'}
                        min="0"
                        placeholder="Quantity"
                        className={INPUT_CLASS}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!selectedMaterialId || !quantity || Number(quantity) <= 0 || addMutation.isPending}
                        className="w-full rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </Modal>
        </div>
    );
}
