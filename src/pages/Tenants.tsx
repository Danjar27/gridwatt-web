import type { ColumnDef } from '@tanstack/react-table';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type TenantWithCounts } from '@/lib/api-client';
import { Building2, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAuthContext } from '@context/auth/context';
import { Navigate } from 'react-router-dom';
import { useServerPagination } from '@components/Table/hooks/useServerPagination';
import Page from '@layouts/Page.tsx';
import { useTranslations } from 'use-intl';
import Summary from '@components/Summary/Summary.tsx';
import Table from '@components/Table/Table.tsx';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';
import Field from '@components/Form/blocks/Field';
import TextInput from '@components/Form/blocks/TextInput';
import Select from '@components/Form/blocks/Select';
import Actions from '@components/Form/blocks/Actions';
import FormError from '@components/Form/blocks/Error';

const formatDate = (dateString?: string) => {
    if (!dateString) {
        return '-';
    }
    const date = new Date(dateString);

    return date.toLocaleDateString('es', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });
};

const TenantsPage = () => {
    const i18n = useTranslations();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<TenantWithCounts | null>(null);
    const [error, setError] = useState<string | null>(null);

    const userRole = currentUser?.role?.name;
    const isAuthorized = userRole === 'admin';

    const columns = useMemo<Array<ColumnDef<TenantWithCounts, any>>>(
        () => [
            {
                accessorKey: 'name',
                header: 'Nombre',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap font-medium">{row.original.name}</div>
                ),
            },
            {
                accessorKey: 'slug',
                header: 'Slug',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-sm text-muted-foreground">
                        {row.original.slug}
                    </div>
                ),
            },
            {
                accessorKey: 'isActive',
                header: 'Estado',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap">
                        <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                row.original.isActive
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                        >
                            {row.original.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                ),
            },
            {
                id: 'users',
                header: 'Usuarios',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-sm">{row.original._count.users}</div>
                ),
            },
            {
                id: 'orders',
                header: 'Órdenes',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-sm">{row.original._count.orders}</div>
                ),
            },
            {
                id: 'createdAt',
                header: 'Creado',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(row.original.createdAt)}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setEditingTenant(row.original);
                                    setIsModalOpen(true);
                                }}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => toggleTenantStatus(row.original)}
                                className="text-sm font-medium text-orange-600 hover:text-orange-800"
                            >
                                {row.original.isActive ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                    </div>
                ),
            },
        ],
        []
    );

    const { table, isLoading, total } = useServerPagination<TenantWithCounts>({
        queryKey: ['tenants'],
        fetchFn: (params) => apiClient.getTenants(params),
        columns,
        enabled: isAuthorized,
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTenant(null);
        setError(null);
    };

    const createMutation = useMutation({
        mutationFn: (data: { name: string; slug: string }) => apiClient.createTenant(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            closeModal();
        },
        onError: (err: any) => {
            setError(err.message || 'Error al crear empresa');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: { name?: string; slug?: string; isActive?: boolean } }) =>
            apiClient.updateTenant(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            closeModal();
        },
        onError: (err: any) => {
            setError(err.message || 'Error al actualizar empresa');
        },
    });

    const toggleTenantStatus = (tenant: TenantWithCounts) => {
        updateMutation.mutate({
            id: tenant.id,
            data: { isActive: !tenant.isActive },
        });
    };

    const handleFormSubmit = (data: any) => {
        if (editingTenant) {
            updateMutation.mutate({
                id: editingTenant.id,
                data: {
                    name: data.name,
                    slug: data.slug,
                    isActive: data.isActive === 'true',
                },
            });
        } else {
            createMutation.mutate({
                name: data.name,
                slug: data.slug,
            });
        }
    };

    if (!isAuthorized && currentUser) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Page id="tenants" title={i18n('pages.tenants.title')} subtitle={i18n('pages.tenants.subtitle')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar Empresa
                    </button>
                </div>

                <Summary
                    icon={Building2}
                    title={i18n('pages.tenants.summary.title')}
                    subtitle={i18n('pages.tenants.summary.subtitle')}
                    legend={i18n('pages.tenants.summary.total', { count: total })}
                >
                    <Table table={table} isLoading={isLoading} total={total} />
                </Summary>

                <Modal
                    onOpen={isModalOpen || !!editingTenant}
                    onClose={closeModal}
                    title={editingTenant ? 'Editar Empresa' : 'Agregar Empresa'}
                    icon={Building2}
                >
                    <FormError message={error} />
                    <Form
                        key={editingTenant?.id || 'new'}
                        onSubmit={handleFormSubmit}
                        defaultValues={
                            editingTenant
                                ? {
                                      name: editingTenant.name,
                                      slug: editingTenant.slug,
                                      isActive: String(editingTenant.isActive),
                                  }
                                : {}
                        }
                    >
                        <Field name="name" label="Nombre" required>
                            <TextInput name="name" rules={{ required: 'El nombre es requerido' }} />
                        </Field>
                        <Field name="slug" label="Slug" required>
                            <TextInput
                                name="slug"
                                rules={{
                                    required: 'El slug es requerido',
                                    pattern: {
                                        value: /^[a-z0-9-]+$/,
                                        message: 'Solo letras minúsculas, números y guiones',
                                    },
                                }}
                            />
                        </Field>
                        {editingTenant && (
                            <Field name="isActive" label="Estado">
                                <Select
                                    name="isActive"
                                    options={[
                                        { label: 'Activo', value: 'true' },
                                        { label: 'Inactivo', value: 'false' },
                                    ]}
                                />
                            </Field>
                        )}
                        <Actions
                            submitLabel={editingTenant ? 'Actualizar' : 'Crear'}
                            onCancel={closeModal}
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        />
                    </Form>
                </Modal>
            </div>
        </Page>
    );
};

export default TenantsPage;
