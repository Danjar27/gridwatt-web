import type { ColumnDef } from '@tanstack/react-table';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiClient, type User } from '@/lib/api-client';
import { Users as UsersIcon, Plus, Clock, Key, Shield, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@context/auth/context';
import { Navigate, useSearchParams } from 'react-router-dom';
import { getPendingMutationsByType, type OfflineMutation } from '@/lib/offline-store';
import { useServerPagination } from '@components/Table/hooks/useServerPagination';
import Page from '@layouts/Page.tsx';
import { useTranslations } from 'use-intl';
import Summary from '@components/Summary/Summary.tsx';
import Table from '@components/Table/Table.tsx';
import Modal from '@components/Modal/Modal';
import Form from '@components/Form/Form';
import Field from '@components/Form/blocks/Field';
import TextInput from '@components/Form/blocks/TextInput';
import EmailInput from '@components/Form/blocks/EmailInput';
import PasswordInput from '@components/Form/blocks/PasswordInput';
import PhoneInput from '@components/Form/blocks/PhoneInput';
import Select from '@components/Form/blocks/Select';
import Actions from '@components/Form/blocks/Actions';
import FormError from '@components/Form/blocks/Error';

const getRoleColor = (roleName?: string) => {
    switch (roleName) {
        case 'admin':
            return 'bg-orange-100 text-orange-600 border border-orange-200';
        case 'manager':
            return 'bg-purple-100 text-purple-600 border border-purple-200';
        case 'technician':
            return 'bg-blue-100 text-blue-600 border border-blue-200';
        default:
            return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) {
        return 'Never';
    }
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

const UsersPage = () => {
    const i18n = useTranslations();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [userToChangeRole, setUserToChangeRole] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pendingMutations, setPendingMutations] = useState<Array<OfflineMutation>>([]);

    const userRole = currentUser?.role?.name;
    const isAuthorized = userRole === 'admin' || userRole === 'manager';
    const isAdmin = userRole === 'admin';

    useEffect(() => {
        if (searchParams.get('add') === 'true' && isAuthorized) {
            setIsModalOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, isAuthorized, setSearchParams]);

    // Fetch pending mutations periodically
    useEffect(() => {
        const fetchPending = async () => {
            const pending = await getPendingMutationsByType('user');
            setPendingMutations(pending);
        };
        fetchPending();
        const interval = setInterval(fetchPending, 2000);

        return () => clearInterval(interval);
    }, []);

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => apiClient.getRoles(),
        enabled: isAuthorized,
    });

    const { data: tenantsData } = useQuery({
        queryKey: ['tenants'],
        queryFn: () => apiClient.getTenants({ limit: 100, offset: 0 }),
        enabled: isAdmin,
    });

    const tenantOptions = useMemo(
        () => (tenantsData?.data ?? []).map((t) => ({ label: t.name, value: t.id })),
        [tenantsData]
    );

    const roleOptions = useMemo(
        () =>
            roles
                .filter((role) => isAdmin || role.name !== 'admin')
                .map((role) => ({ label: role.name, value: role.id })),
        [roles, isAdmin]
    );

    const columns = useMemo<Array<ColumnDef<User, any>>>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({ row }) => {
                    const isPending = pendingMutations.some((m) => (m.optimisticData as any)?.id === row.original.id);

                    return (
                        <div className="whitespace-nowrap">
                            <div className="flex items-center gap-2 font-medium">
                                {row.original.name} {row.original.lastName}
                                {isPending && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
                                        <Clock className="h-3 w-3" />
                                        Pending
                                    </span>
                                )}
                            </div>
                            {row.original.phone && (
                                <div className="text-sm text-muted-foreground">{row.original.phone}</div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'email',
                header: 'Email',
                cell: ({ row }) => <div className="whitespace-nowrap text-sm">{row.original.email}</div>,
            },
            {
                accessorKey: 'role',
                header: 'Role',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap">
                        <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleColor(row.original.role?.name)}`}
                        >
                            {row.original.role?.name}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'isActive',
                header: 'Status',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap">
                        <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                row.original.isActive
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                        >
                            {row.original.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                ),
            },
            {
                id: 'lastLogin',
                header: 'Last Login',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate((row.original as any).lastLogin)}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="whitespace-nowrap">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setUserToChangeRole(row.original);
                                    setIsRoleModalOpen(true);
                                }}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Change Role
                            </button>
                            <button
                                onClick={() => toggleUserStatus(row.original)}
                                className="text-sm font-medium text-orange-600 hover:text-orange-800"
                            >
                                {row.original.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                onClick={() => {
                                    setUserToResetPassword(row.original);
                                    setIsPasswordModalOpen(true);
                                }}
                                className="text-sm font-medium text-purple-600 hover:text-purple-800"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => {
                                    setUserToDelete(row.original);
                                    setIsDeleteModalOpen(true);
                                }}
                                className="text-sm font-medium text-red-600 hover:text-red-800"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ),
            },
        ],
        [pendingMutations]
    );

    const { table, isLoading, total } = useServerPagination<User>({
        queryKey: ['users'],
        fetchFn: (params) => apiClient.getUsers(params),
        columns,
        enabled: isAuthorized,
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setError(null);
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setUserToResetPassword(null);
        setError(null);
    };

    const closeRoleModal = () => {
        setIsRoleModalOpen(false);
        setUserToChangeRole(null);
        setError(null);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeModal();
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to create user');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEditingUser(null);
            setIsPasswordModalOpen(false);
            setUserToResetPassword(null);
            setIsRoleModalOpen(false);
            setUserToChangeRole(null);
            setError(null);
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to update user');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiClient.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            closeDeleteModal();
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to delete user');
        },
    });

    const toggleUserStatus = (user: User) => {
        updateMutation.mutate({
            id: user.id,
            data: { isActive: !user.isActive },
        });
    };

    const handleFormSubmit = (data: any) => {
        const { isActive, tenantId, ...rest } = data;
        const payload: any = {
            ...rest,
            roleId: Number(data.roleId),
        };

        if (isAdmin && tenantId) {
            payload.tenantId = Number(tenantId);
        }

        if (editingUser) {
            payload.isActive = isActive === 'true';
            updateMutation.mutate({ id: editingUser.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleResetPassword = (data: any) => {
        if (!userToResetPassword) {return;}
        updateMutation.mutate({
            id: userToResetPassword.id,
            data: { password: data.password },
        });
    };

    const handleChangeRole = (data: any) => {
        if (!userToChangeRole) {return;}
        updateMutation.mutate({
            id: userToChangeRole.id,
            data: { roleId: Number(data.roleId) },
        });
    };

    const handleDelete = () => {
        if (userToDelete) {
            deleteMutation.mutate(userToDelete.id);
        }
    };

    if (!isAuthorized && currentUser) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Page id="users" title={i18n('pages.users.title')} subtitle={i18n('pages.users.subtitle')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Add User
                    </button>
                </div>

                <Summary
                    icon={UsersIcon}
                    title={i18n('pages.users.summary.title')}
                    subtitle={i18n('pages.users.summary.subtitle')}
                    legend={i18n('pages.users.summary.total', { count: total })}
                >
                    <Table table={table} isLoading={isLoading} total={total} />
                </Summary>

                {/* Add/Edit User Modal */}
                <Modal
                    open={isModalOpen || !!editingUser}
                    onClose={closeModal}
                    title={editingUser ? 'Edit User' : 'Add User'}
                    icon={UsersIcon}
                >
                    <FormError message={error} />
                    <Form
                        key={editingUser?.id || 'new'}
                        onSubmit={handleFormSubmit}
                        defaultValues={
                            editingUser
                                ? {
                                      name: editingUser.name,
                                      lastName: editingUser.lastName,
                                      email: editingUser.email,
                                      phone: editingUser.phone || '',
                                      roleId: editingUser.role?.id,
                                      isActive: String(editingUser.isActive),
                                      ...(isAdmin ? { tenantId: editingUser.tenantId } : {}),
                                  }
                                : { isActive: 'true' }
                        }
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <Field name="name" label="First Name" required>
                                <TextInput name="name" rules={{ required: 'First name is required' }} />
                            </Field>
                            <Field name="lastName" label="Last Name" required>
                                <TextInput name="lastName" rules={{ required: 'Last name is required' }} />
                            </Field>
                        </div>
                        <Field name="email" label="Email" required>
                            <EmailInput name="email" rules={{ required: 'Email is required' }} />
                        </Field>
                        {!editingUser && (
                            <Field name="password" label="Password" required>
                                <PasswordInput
                                    name="password"
                                    rules={{
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                    }}
                                />
                            </Field>
                        )}
                        <Field name="phone" label="Phone">
                            <PhoneInput name="phone" />
                        </Field>
                        <Field name="roleId" label="Role" required>
                            <Select
                                name="roleId"
                                rules={{ required: 'Role is required' }}
                                options={[{ label: 'Select a role', value: '' }, ...roleOptions]}
                            />
                        </Field>
                        {isAdmin && (
                            <Field name="tenantId" label="Tenant" required>
                                <Select
                                    name="tenantId"
                                    rules={{ required: 'Tenant is required' }}
                                    options={[{ label: 'Select a tenant', value: '' }, ...tenantOptions]}
                                />
                            </Field>
                        )}
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
                            submitLabel={editingUser ? 'Update' : 'Create'}
                            onCancel={closeModal}
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        />
                    </Form>
                </Modal>

                {/* Reset Password Modal */}
                <Modal open={isPasswordModalOpen} onClose={closePasswordModal} title="Reset Password" icon={Key}>
                    <FormError message={error} />
                    <p className="mb-4 text-sm text-muted-foreground">
                        Resetting password for{' '}
                        <strong>
                            {userToResetPassword?.name} {userToResetPassword?.lastName}
                        </strong>
                    </p>
                    <Form key={userToResetPassword?.id} onSubmit={handleResetPassword}>
                        <Field name="password" label="New Password" required>
                            <PasswordInput
                                name="password"
                                autoFocus
                                rules={{
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                }}
                            />
                        </Field>
                        <Actions
                            submitLabel="Reset Password"
                            onCancel={closePasswordModal}
                            isLoading={updateMutation.isPending}
                        />
                    </Form>
                </Modal>

                {/* Change Role Modal */}
                <Modal open={isRoleModalOpen} onClose={closeRoleModal} title="Change Role" icon={Shield}>
                    <FormError message={error} />
                    <p className="mb-4 text-sm text-muted-foreground">
                        Changing role for{' '}
                        <strong>
                            {userToChangeRole?.name} {userToChangeRole?.lastName}
                        </strong>
                    </p>
                    <Form
                        key={userToChangeRole?.id}
                        onSubmit={handleChangeRole}
                        defaultValues={{
                            roleId: userToChangeRole?.role?.id,
                        }}
                    >
                        <Field name="roleId" label="New Role" required>
                            <Select
                                name="roleId"
                                rules={{ required: 'Role is required' }}
                                options={roleOptions}
                            />
                        </Field>
                        <Actions
                            submitLabel="Change Role"
                            onCancel={closeRoleModal}
                            isLoading={updateMutation.isPending}
                        />
                    </Form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal open={isDeleteModalOpen} onClose={closeDeleteModal} title="Delete User" icon={Trash2}>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Are you sure you want to delete{' '}
                        <strong>
                            {userToDelete?.name} {userToDelete?.lastName}
                        </strong>
                        ? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            Delete
                        </button>
                    </div>
                </Modal>
            </div>
        </Page>
    );
};

export default UsersPage;
