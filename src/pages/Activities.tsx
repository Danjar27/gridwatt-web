import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Activity } from '@/lib/api-client';
import { useState, useEffect, useMemo } from 'react';
import { Plus, Clipboard, Clock } from 'lucide-react';
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

const ActivitiesPage = () => {
    const i18n = useTranslations();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthContext();

    if (currentUser?.role?.name === 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pendingMutations, setPendingMutations] = useState<Array<OfflineMutation>>([]);

    useEffect(() => {
        const fetchPending = async () => {
            const pending = await getPendingMutationsByType('activity');
            setPendingMutations(pending);
        };
        fetchPending();
        const interval = setInterval(fetchPending, 2000);

        return () => clearInterval(interval);
    }, []);

    const columns = useMemo<Array<ColumnDef<Activity, any>>>(
        () => [
            {
                accessorKey: 'id',
                header: 'Id',
                cell: ({ row }) => {
                    const isPending = pendingMutations.some((m) => (m.optimisticData as any)?.id === row.original.id);

                    return (
                        <div className="flex items-center gap-2 font-mono text-sm">
                            {formatEntityId('activity', row.original.id)}
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
                cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
            },
            {
                accessorKey: 'description',
                header: 'Description',
                cell: ({ row }) => (
                    <div className="text-sm text-muted-foreground">{row.original.description || '-'}</div>
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
                            onClick={() => setEditingActivity(row.original)}
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

    const { table, isLoading, total } = useServerPagination<Activity>({
        queryKey: ['activities'],
        fetchFn: (params) => apiClient.getActivities(params),
        columns,
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingActivity(null);
        setError(null);
    };

    const createMutation = useMutation({
        mutationFn: (data: Partial<Activity>) => apiClient.createActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            closeModal();
        },
        onError: (err: any) => setError(err.message || 'Failed to create activity'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) => apiClient.updateActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            closeModal();
        },
        onError: (err: any) => setError(err.message || 'Failed to update activity'),
    });

    const toggleActiveMutation = useMutation({
        mutationFn: (id: string) => apiClient.toggleActivityActive(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
        onError: (err: any) => setError(err.message || 'Failed to toggle activity status'),
    });

    const handleFormSubmit = (data: any) => {
        if (editingActivity) {
            updateMutation.mutate({ id: editingActivity.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Page id="activities" title={i18n('pages.activities.title')} subtitle={i18n('pages.activities.subtitle')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add Activity
                    </button>
                </div>

                <Summary
                    icon={Clipboard}
                    title={i18n('pages.activities.summary.title')}
                    subtitle={i18n('pages.activities.summary.subtitle')}
                    legend={i18n('pages.activities.summary.total', { count: total })}
                >
                    <Table table={table} isLoading={isLoading} total={total} />
                </Summary>

                <Modal
                    open={isModalOpen || !!editingActivity}
                    onClose={closeModal}
                    title={editingActivity ? 'Edit Activity' : 'Add Activity'}
                    icon={Clipboard}
                >
                    <FormError message={error} />
                    <Form
                        key={editingActivity?.id || 'new'}
                        onSubmit={handleFormSubmit}
                        defaultValues={
                            editingActivity
                                ? {
                                      name: editingActivity.name,
                                      description: editingActivity.description || '',
                                      isActive: String(editingActivity.isActive),
                                  }
                                : { isActive: 'true' }
                        }
                    >
                        {!editingActivity && (
                            <Field name="id" label="ID" required>
                                <PrefixedIdInput name="id" prefix="ACT" rules={{ required: 'ID is required' }} />
                            </Field>
                        )}
                        <Field name="name" label="Name" required>
                            <TextInput name="name" rules={{ required: 'Name is required' }} />
                        </Field>
                        <Field name="description" label="Description">
                            <TextArea name="description" rows={3} />
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
                        <Actions
                            submitLabel={editingActivity ? 'Update' : 'Create'}
                            onCancel={closeModal}
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        />
                    </Form>
                </Modal>
            </div>
        </Page>
    );
};

export default ActivitiesPage;
