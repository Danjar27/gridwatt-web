import type { ColumnDef } from '@tanstack/react-table';
import type { OfflineMutation } from '@lib/offline-store';
import type { Activity } from '@lib/api-client';

import { useServerPagination } from '@components/Table/hooks/useServerPagination';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingMutationsByType } from '@/lib/offline-store';
import { ClipboardIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useAuthContext } from '@context/auth/context';
import { useState, useEffect, useMemo } from 'react';
import { formatEntityId } from '@/utils/format-id';
import { useModal } from '@hooks/useModal.ts';
import { apiClient } from '@lib/api-client';
import { Navigate } from 'react-router-dom';
import { useTranslations } from 'use-intl';
import { Clock } from 'lucide-react';

import PrefixedIdInput from '@components/Form/blocks/PrefixedIdInput';
import TextInput from '@components/Form/blocks/TextInput';
import Window from '@components/Modal/blocks/Window.tsx';
import TextArea from '@components/Form/blocks/TextArea';
import FormError from '@components/Form/blocks/Error';
import Summary from '@components/Summary/Summary.tsx';
import Actions from '@components/Form/blocks/Actions';
import Select from '@components/Form/blocks/Select';
import Button from '@components/Button/Button.tsx';
import Field from '@components/Form/blocks/Field';
import Table from '@components/Table/Table.tsx';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';
import Page from '@layouts/Page.tsx';

const ActivitiesPage = () => {
    const i18n = useTranslations();
    const queryClient = useQueryClient();
    const { user } = useAuthContext();

    if (user?.role?.name === 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const [isModalOpen, openModal, closeModal] = useModal();

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

    const closeSession = () => {
        closeModal();
        setEditingActivity(null);
        setError(null);
    };

    const createMutation = useMutation({
        mutationFn: (data: Partial<Activity>) => apiClient.createActivity(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            closeSession();
        },
        onError: (err: any) => setError(err.message || 'Failed to create activity'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) => apiClient.updateActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            closeSession();
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
                    <Button icon={PlusCircleIcon} onClick={openModal}>
                        {i18n('pages.activities.action')}
                    </Button>
                </div>

                <Summary
                    icon={ClipboardIcon}
                    title={i18n('pages.activities.summary.title')}
                    subtitle={i18n('pages.activities.summary.subtitle')}
                >
                    <Table table={table} isLoading={isLoading} total={total} />
                </Summary>

                <Modal id="add-activity" isOpen={isModalOpen} open={openModal} close={closeSession}>
                    <Window
                        title={i18n('pages.activities.modal.title')}
                        className="w-full max-w-150 px-4"
                        icon={ClipboardIcon}
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
                                <Field name="id" label={i18n('pages.activities.form.id')} required>
                                    <PrefixedIdInput name="id" prefix="ACT" rules={{ required: 'ID is required' }} />
                                </Field>
                            )}
                            <Field name="name" label={i18n('pages.activities.form.name')} required>
                                <TextInput name="name" rules={{ required: 'Name is required' }} />
                            </Field>
                            <Field name="description" label={i18n('pages.activities.form.description')}>
                                <TextArea name="description" rows={3} />
                            </Field>
                            <Actions
                                submitLabel={editingActivity ? 'Update' : 'Create'}
                                onCancel={closeSession}
                                isLoading={createMutation.isPending || updateMutation.isPending}
                            />
                        </Form>
                    </Window>
                </Modal>
            </div>
        </Page>
    );
};

export default ActivitiesPage;
