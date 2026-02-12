import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Activity } from '@/lib/api-client';
import { useState, useEffect, useMemo } from 'react';
import { Plus, X, AlertCircle, Loader2, Clipboard, Clock } from 'lucide-react';
import { getPendingMutationsByType, type OfflineMutation } from '@/lib/offline-store';
import Page from '@layouts/Page.tsx';
import { useTranslations } from 'use-intl';
import Summary from '@components/Summary/Summary';
import Table from '@components/Table/Table.tsx';
import Row from '@components/Table/blocks/Row.tsx';

const ActivitiesPage = () => {
    const i18n = useTranslations();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pendingMutations, setPendingMutations] = useState<Array<OfflineMutation>>([]);

    const { data: serverActivities = [], isLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: () => apiClient.getActivities(),
    });

    // Fetch pending mutations periodically
    useEffect(() => {
        const fetchPending = async () => {
            const pending = await getPendingMutationsByType('activity');
            setPendingMutations(pending);
        };
        fetchPending();
        const interval = setInterval(fetchPending, 2000);

        return () => clearInterval(interval);
    }, []);

    // Merge server data with pending mutations for optimistic UI
    const activities = useMemo(() => {
        const result = [...serverActivities];
        const serverIds = new Set(serverActivities.map((a) => a.id));

        for (const mutation of pendingMutations) {
            if (mutation.action === 'create' && mutation.optimisticData) {
                const optimistic = mutation.optimisticData as Activity & { _pending?: boolean };
                if (!serverIds.has(optimistic.id)) {
                    result.push({ ...optimistic, _pending: true } as Activity & { _pending?: boolean });
                }
            } else if (mutation.action === 'update' && mutation.optimisticData) {
                const optimistic = mutation.optimisticData as Activity;
                const index = result.findIndex((a) => a.id === optimistic.id);
                if (index !== -1) {
                    result[index] = { ...result[index], ...optimistic, _pending: true } as Activity & {
                        _pending?: boolean;
                    };
                }
            }
        }

        return result;
    }, [serverActivities, pendingMutations]);

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
        onError: (err: any) => {
            setError(err.message || 'Failed to create activity');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) => apiClient.updateActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            closeModal();
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to update activity');
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: (id: string) => apiClient.toggleActivityActive(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to toggle activity status');
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            id: formData.get('id') as string,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            isActive: formData.get('isActive') === 'true',
        };

        if (editingActivity) {
            updateMutation.mutate({ id: editingActivity.id, data });
        } else {
            createMutation.mutate(data);
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
        <Page id="activities" title={i18n('pages.activities.title')} subtitle={i18n('pages.activities.subtitle')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                    >
                        <Plus className="h-4 w-4" />
                        Add Activity
                    </button>
                </div>

                <Summary
                    title={i18n('pages.activities.summary.title')}
                    subtitle={i18n('pages.activities.summary.subtitle')}
                    legend={i18n('pages.activities.summary.total', { count: activities.length })}
                    icon={Clipboard}
                >
                    <Table columns={['Id', 'Name', 'Description', 'Status', 'Actions']}>
                        {activities.map((activity) => {
                            const isPending = (activity as Activity & { _pending?: boolean })._pending;

                            return (
                                <Row>
                                    <div className="flex items-center gap-2">
                                        {activity.id}
                                        {isPending && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
                                                <Clock className="h-3 w-3" />
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                    <div className="whitespace-nowrap px-6 py-4 font-medium">{activity.name}</div>
                                    <div className="px-6 py-4 text-sm text-muted-foreground">
                                        {activity.description || '-'}
                                    </div>
                                    <div className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                activity.isActive
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                            }`}
                                        >
                                            {activity.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setEditingActivity(activity)}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => toggleActiveMutation.mutate(activity.id)}
                                                className="text-sm font-medium text-orange-600 hover:text-orange-800"
                                            >
                                                {activity.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </div>
                                </Row>
                            );
                        })}
                    </Table>
                </Summary>

                {/* Activity Modal (Add/Edit) */}
                {(isModalOpen || editingActivity) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    {editingActivity ? 'Edit Activity' : 'Add Activity'}
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

                            <form key={editingActivity?.id || 'new'} onSubmit={handleSubmit} className="space-y-4">
                                {!editingActivity && (
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
                                        defaultValue={editingActivity?.name}
                                        required
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Description</label>
                                    <textarea
                                        name="description"
                                        defaultValue={editingActivity?.description}
                                        rows={3}
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Status</label>
                                    <select
                                        name="isActive"
                                        defaultValue={editingActivity ? String(editingActivity.isActive) : 'true'}
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
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
                                        {editingActivity ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Page>
    );
};

export default ActivitiesPage;
