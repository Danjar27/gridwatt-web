import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Material } from '@/lib/api-client';
import { useState, useEffect, useMemo } from 'react';
import { Plus, Package, Clock } from 'lucide-react';
import { formatEntityId } from '@/utils/format-id';
import type { ColumnDef } from '@tanstack/react-table';
import { getPendingMutationsByType, type OfflineMutation } from '@/lib/offline-store';
import { useServerPagination } from '@components/Table/hooks/useServerPagination';
import { useAuthContext } from '@context/auth/context';
import { Navigate } from 'react-router-dom';
import Page from '@layouts/Page.tsx';
import { useTranslations } from 'use-intl';
import Summary from '@components/Summary/Summary.tsx';
import Table from '@components/Table/Table.tsx';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';
import Field from '@components/Form/blocks/Field';
import TextInput from '@components/Form/blocks/TextInput';
import PrefixedIdInput from '@components/Form/blocks/PrefixedIdInput';
import TextArea from '@components/Form/blocks/TextArea';
import Select from '@components/Form/blocks/Select';
import Actions from '@components/Form/blocks/Actions';
import FormError from '@components/Form/blocks/Error';

const MaterialsPage = () => {
    const i18n = useTranslations();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthContext();

    if (currentUser?.role?.name === 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pendingMutations, setPendingMutations] = useState<Array<OfflineMutation>>([]);

    useEffect(() => {
        const fetchPending = async () => {
            const pending = await getPendingMutationsByType('material');
            setPendingMutations(pending);
        };
        fetchPending();
        const interval = setInterval(fetchPending, 2000);

        return () => clearInterval(interval);
    }, []);

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

    const columns = useMemo<Array<ColumnDef<Material, any>>>(
        () => [
            {
                accessorKey: 'id',
                header: 'Id',
                cell: ({ row }) => {
                    const isPending = pendingMutations.some((m) => (m.optimisticData as any)?.id === row.original.id);

                    return (
                        <div className="flex items-center gap-2 font-mono text-sm">
                            {formatEntityId('material', row.original.id)}
                            {isPending && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
                                    <Clock className="h-3 w-3" />
                                    Pending
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">{row.original.name}</div>
                        {row.original.description && (
                            <div className="text-sm text-muted-foreground">{row.original.description}</div>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'type',
                header: 'Type',
                cell: ({ row }) => (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(row.original.type)}`}
                    >
                        {row.original.type}
                    </span>
                ),
            },
            { accessorKey: 'unit', header: 'Unit' },
            {
                accessorKey: 'allowsDecimals',
                header: 'Decimals',
                cell: ({ row }) => (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            row.original.allowsDecimals
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                    >
                        {row.original.allowsDecimals ? 'Yes' : 'No'}
                    </span>
                ),
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                cell: ({ row }) => (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            row.original.isActive
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                    >
                        {row.original.isActive ? 'Active' : 'Inactive'}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setEditingMaterial(row.original)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => toggleActiveMutation.mutate(row.original.id)}
                            className="text-sm font-medium text-orange-600 hover:text-orange-800"
                        >
                            {row.original.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                ),
            },
        ],
        [pendingMutations]
    );

    const { table, isLoading, total } = useServerPagination<Material>({
        queryKey: ['materials'],
        fetchFn: (params) => apiClient.getMaterials(params),
        columns,
    });

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
        onError: (err: any) => setError(err.message || 'Failed to create material'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Material> }) => apiClient.updateMaterial(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            closeModal();
        },
        onError: (err: any) => setError(err.message || 'Failed to update material'),
    });

    const toggleActiveMutation = useMutation({
        mutationFn: (id: string) => apiClient.toggleMaterialActive(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materials'] }),
        onError: (err: any) => setError(err.message || 'Failed to toggle material status'),
    });

    const handleFormSubmit = (data: any) => {
        if (editingMaterial) {
            updateMutation.mutate({ id: editingMaterial.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Page id="materials" title={i18n('pages.materials.title')} subtitle={i18n('pages.materials.subtitle')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Material
                    </button>
                </div>

                <Summary
                    icon={Package}
                    title={i18n('pages.materials.summary.title')}
                    subtitle={i18n('pages.materials.summary.subtitle')}
                    legend={i18n('pages.materials.summary.total', { count: total })}
                >
                    <Table table={table} isLoading={isLoading} total={total} />
                </Summary>

                <Modal
                    onOpen={isModalOpen || !!editingMaterial}
                    onClose={closeModal}
                    title={editingMaterial ? 'Edit Material' : 'Create Material'}
                    icon={Package}
                >
                    <FormError message={error} />
                    <Form
                        key={editingMaterial?.id || 'new'}
                        onSubmit={handleFormSubmit}
                        defaultValues={
                            editingMaterial
                                ? {
                                      name: editingMaterial.name,
                                      type: editingMaterial.type,
                                      unit: editingMaterial.unit,
                                      description: editingMaterial.description || '',
                                      allowsDecimals: String(editingMaterial.allowsDecimals),
                                      isActive: String(editingMaterial.isActive),
                                  }
                                : { allowsDecimals: 'false', isActive: 'true' }
                        }
                    >
                        {!editingMaterial && (
                            <Field name="id" label="ID" required>
                                <PrefixedIdInput name="id" prefix="MAT" rules={{ required: 'ID is required' }} />
                            </Field>
                        )}
                        <Field name="name" label="Name" required>
                            <TextInput name="name" rules={{ required: 'Name is required' }} />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field name="type" label="Type" required>
                                <TextInput name="type" rules={{ required: 'Type is required' }} />
                            </Field>
                            <Field name="unit" label="Unit" required>
                                <TextInput name="unit" rules={{ required: 'Unit is required' }} />
                            </Field>
                        </div>
                        <Field name="description" label="Description">
                            <TextArea name="description" rows={3} />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field name="allowsDecimals" label="Allows Decimals">
                                <Select
                                    name="allowsDecimals"
                                    options={[
                                        { label: 'Yes', value: 'true' },
                                        { label: 'No', value: 'false' },
                                    ]}
                                />
                            </Field>
                            <Field name="isActive" label="Status">
                                <Select
                                    name="isActive"
                                    options={[
                                        { label: 'Active', value: 'true' },
                                        { label: 'Inactive', value: 'false' },
                                    ]}
                                />
                            </Field>
                        </div>
                        <Actions
                            submitLabel={editingMaterial ? 'Update' : 'Create'}
                            onCancel={closeModal}
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        />
                    </Form>
                </Modal>
            </div>
        </Page>
    );
};

export default MaterialsPage;
