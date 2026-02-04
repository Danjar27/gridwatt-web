import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Material } from '@/lib/api-client';
import { useState, useEffect, useMemo } from 'react';
import { Plus, X, AlertCircle, Loader2, Package, Clock } from 'lucide-react';
import { getPendingMutationsByType, type OfflineMutation } from '@/lib/offline-store';

export function MaterialsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pendingMutations, setPendingMutations] = useState<Array<OfflineMutation>>([]);

    const { data: serverMaterials = [], isLoading } = useQuery({
        queryKey: ['materials'],
        queryFn: () => apiClient.getMaterials(),
    });

    // Fetch pending mutations periodically
    useEffect(() => {
        const fetchPending = async () => {
            const pending = await getPendingMutationsByType('material');
            setPendingMutations(pending);
        };
        fetchPending();
        const interval = setInterval(fetchPending, 2000);

        return () => clearInterval(interval);
    }, []);

    // Merge server data with pending mutations for optimistic UI
    const materials = useMemo(() => {
        const result = [...serverMaterials];
        const serverIds = new Set(serverMaterials.map((m) => m.id));

        for (const mutation of pendingMutations) {
            if (mutation.action === 'create' && mutation.optimisticData) {
                const optimistic = mutation.optimisticData as Material & { _pending?: boolean };
                // Only add if not already in server data
                if (!serverIds.has(optimistic.id)) {
                    result.push({ ...optimistic, _pending: true } as Material & { _pending?: boolean });
                }
            } else if (mutation.action === 'update' && mutation.optimisticData) {
                const optimistic = mutation.optimisticData as Material;
                const index = result.findIndex((m) => m.id === optimistic.id);
                if (index !== -1) {
                    result[index] = { ...result[index], ...optimistic, _pending: true } as Material & { _pending?: boolean };
                }
            }
        }

        return result;
    }, [serverMaterials, pendingMutations]);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMaterial(null);
        setError(null);
    };

    const createMutation = useMutation({
        mutationFn: (data: Partial<Material>) => apiClient.createMaterial(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            closeModal();
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to create material');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Material> }) => apiClient.updateMaterial(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            closeModal();
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to update material');
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: (id: string) => apiClient.toggleMaterialActive(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to toggle material status');
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            id: formData.get('id') as string,
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            description: formData.get('description') as string,
            unit: formData.get('unit') as string,
            allowsDecimals: formData.get('allowsDecimals') === 'true',
            isActive: formData.get('isActive') === 'true',
        };

        if (editingMaterial) {
            updateMutation.mutate({ id: editingMaterial.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'electrical':
                return 'bg-yellow-100 text-yellow-600 border border-yellow-200';
            case 'mechanical':
                return 'bg-blue-100 text-blue-600 border border-blue-200';
            case 'consumable':
                return 'bg-green-100 text-green-600 border border-green-200';
            default:
                return 'bg-gray-100 text-gray-600 border border-gray-200';
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
                    <h1 className="text-2xl font-bold">Material Management</h1>
                    <p className="text-muted-foreground">Manage inventory materials and supplies</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Add Material
                </button>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-6 py-4">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-medium">All Materials</span>
                    <span className="ml-auto text-sm text-muted-foreground">{materials.length} materials</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b bg-muted/30">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Unit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Decimals
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {materials.map((material) => {
                                const isPending = (material as Material & { _pending?: boolean })._pending;

                                return (
                                <tr key={material.id} className={`hover:bg-muted/50 ${isPending ? 'bg-yellow-50' : ''}`}>
                                    <td className="whitespace-nowrap px-6 py-4 font-mono text-sm">
                                        <div className="flex items-center gap-2">
                                            {material.id}
                                            {isPending && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
                                                    <Clock className="h-3 w-3" />
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div>
                                            <div className="font-medium">{material.name}</div>
                                            {material.description && (
                                                <div className="text-sm text-muted-foreground">{material.description}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(material.type)}`}
                                        >
                                            {material.type}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">{material.unit}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                material.allowsDecimals
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                            }`}
                                        >
                                            {material.allowsDecimals ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                material.isActive
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                            }`}
                                        >
                                            {material.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setEditingMaterial(material)}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => toggleActiveMutation.mutate(material.id)}
                                                className="text-sm font-medium text-orange-600 hover:text-orange-800"
                                            >
                                                {material.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Material Modal (Add/Edit) */}
            {(isModalOpen || editingMaterial) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {editingMaterial ? 'Edit Material' : 'Add Material'}
                            </h2>
                            <button onClick={closeModal}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <form key={editingMaterial?.id || 'new'} onSubmit={handleSubmit} className="space-y-4">
                            {!editingMaterial && (
                                <div>
                                    <label className="block text-sm font-medium">ID</label>
                                    <input
                                        name="id"
                                        required
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input
                                    name="name"
                                    defaultValue={editingMaterial?.name}
                                    required
                                    className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Type</label>
                                    <input
                                        name="type"
                                        defaultValue={editingMaterial?.type}
                                        required
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Unit</label>
                                    <input
                                        name="unit"
                                        defaultValue={editingMaterial?.unit}
                                        required
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingMaterial?.description}
                                    rows={3}
                                    className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Allows Decimals</label>
                                    <select
                                        name="allowsDecimals"
                                        defaultValue={editingMaterial ? String(editingMaterial.allowsDecimals) : 'false'}
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Status</label>
                                    <select
                                        name="isActive"
                                        defaultValue={editingMaterial ? String(editingMaterial.isActive) : 'true'}
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {editingMaterial ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
