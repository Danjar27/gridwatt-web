import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type User } from '@/lib/api-client';
import { Users as UsersIcon, Plus, X, AlertCircle, Loader2, Clock } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@context/auth/context';
import { Navigate, useSearchParams } from 'react-router-dom';
import { getPendingMutationsByType, type OfflineMutation } from '@/lib/offline-store';
import Page from '@layouts/Page.tsx';
import { useTranslations } from 'use-intl';
import Summary from '@components/Summary/Summary.tsx';
import Table from '@components/Table/Table.tsx';
import Row from '@components/Table/blocks/Row.tsx';

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

    const { data: serverUsers = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: () => apiClient.getUsers(),
        enabled: isAuthorized,
    });

    // Merge server data with pending mutations for optimistic UI
    const users = useMemo(() => {
        const result = [...serverUsers];
        const serverIds = new Set(serverUsers.map((u) => u.id));

        for (const mutation of pendingMutations) {
            if (mutation.action === 'create' && mutation.optimisticData) {
                const optimistic = mutation.optimisticData as User & { _pending?: boolean };
                if (!serverIds.has(optimistic.id)) {
                    result.push({ ...optimistic, _pending: true } as User & { _pending?: boolean });
                }
            } else if (mutation.action === 'update' && mutation.optimisticData) {
                const optimistic = mutation.optimisticData as User;
                const index = result.findIndex((u) => u.id === optimistic.id);
                if (index !== -1) {
                    result[index] = { ...result[index], ...optimistic, _pending: true } as User & {
                        _pending?: boolean;
                    };
                }
            }
        }

        return result;
    }, [serverUsers, pendingMutations]);

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => apiClient.getRoles(),
        enabled: isAuthorized,
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setError(null);
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
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        },
        onError: (err: any) => {
            setError(err.message || 'Failed to delete user');
        },
    });

    if (!isAuthorized && currentUser) {
        return <Navigate to="/dashboard" replace />;
    }

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = {
            name: formData.get('name') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            roleId: Number(formData.get('roleId')),
            isActive: formData.get('isActive') === 'true',
        };

        if (editingUser) {
            updateMutation.mutate({ id: editingUser.id, data });
        } else {
            data.password = formData.get('password') as string;
            createMutation.mutate(data);
        }
    };

    const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userToResetPassword) {
            return;
        }

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;

        updateMutation.mutate({
            id: userToResetPassword.id,
            data: { password },
        });
    };

    const handleChangeRole = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userToChangeRole) {
            return;
        }

        const formData = new FormData(e.currentTarget);
        const roleId = Number(formData.get('roleId'));

        updateMutation.mutate({
            id: userToChangeRole.id,
            data: { roleId },
        });
    };

    const toggleUserStatus = (user: User) => {
        updateMutation.mutate({
            id: user.id,
            data: { isActive: !user.isActive },
        });
    };

    const handleDelete = () => {
        if (userToDelete) {
            deleteMutation.mutate(userToDelete.id);
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

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <Page id="users" title={i18n('pages.users.title')} subtitle={i18n('pages.users.subtitle')}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                    >
                        <Plus className="h-4 w-4" />
                        Add User
                    </button>
                </div>

                <Summary
                    icon={UsersIcon}
                    title={i18n('pages.users.summary.title')}
                    subtitle={i18n('pages.users.summary.subtitle')}
                    legend={i18n('pages.users.summary.total', { count: users.length })}
                >
                    <Table columns={['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions']}>
                        {users.map((user) => {
                            const isPending = (user as User & { _pending?: boolean })._pending;

                            return (
                                <Row key={user.id}>
                                    <div className="whitespace-nowrap">
                                        <div className="font-medium flex items-center gap-2">
                                            {user.name} {user.lastName}
                                            {isPending && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
                                                    <Clock className="h-3 w-3" />
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                        {user.phone && (
                                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                                        )}
                                    </div>
                                    <div className="whitespace-nowrap text-sm">{user.email}</div>
                                    <div className="whitespace-nowrap">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleColor(user.role?.name)}`}
                                        >
                                            {user.role?.name}
                                        </span>
                                    </div>
                                    <div className="whitespace-nowrap">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                user.isActive
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                            }`}
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="whitespace-nowrap text-sm text-muted-foreground">
                                        {formatDate((user as any).lastLogin)}
                                    </div>
                                    <div className="whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setUserToChangeRole(user);
                                                    setIsRoleModalOpen(true);
                                                }}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                Change Role
                                            </button>
                                            <button
                                                onClick={() => toggleUserStatus(user)}
                                                className="text-sm font-medium text-orange-600 hover:text-orange-800"
                                            >
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUserToResetPassword(user);
                                                    setIsPasswordModalOpen(true);
                                                }}
                                                className="text-sm font-medium text-purple-600 hover:text-purple-800"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setUserToDelete(user);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="text-sm font-medium text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </Row>
                            );
                        })}
                    </Table>
                </Summary>

            {/* User Modal (Add/Edit) */}
            {(isModalOpen || editingUser) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Add User'}</h2>
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

                        <form key={editingUser?.id || 'new'} onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">First Name</label>
                                    <input
                                        name="name"
                                        defaultValue={editingUser?.name}
                                        required
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Last Name</label>
                                    <input
                                        name="lastName"
                                        defaultValue={editingUser?.lastName}
                                        required
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={editingUser?.email}
                                    required
                                    className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium">Password</label>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        minLength={6}
                                        className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium">Phone</label>
                                <input
                                    name="phone"
                                    defaultValue={editingUser?.phone}
                                    className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Role</label>
                                <select
                                    name="roleId"
                                    defaultValue={editingUser?.roleId}
                                    required
                                    className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Status</label>
                                <select
                                    name="isActive"
                                    defaultValue={editingUser ? String(editingUser.isActive) : 'true'}
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
                                    {editingUser ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Reset Password</h2>
                            <button
                                onClick={() => {
                                    setIsPasswordModalOpen(false);
                                    setError(null);
                                }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <p className="mb-4 text-sm text-muted-foreground">
                            Resetting password for{' '}
                            <strong>
                                {userToResetPassword?.name} {userToResetPassword?.lastName}
                            </strong>
                        </p>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">New Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    autoFocus
                                    className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPasswordModalOpen(false);
                                        setError(null);
                                    }}
                                    className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="flex items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Role Modal */}
            {isRoleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Change Role</h2>
                            <button
                                onClick={() => {
                                    setIsRoleModalOpen(false);
                                    setUserToChangeRole(null);
                                    setError(null);
                                }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <p className="mb-4 text-sm text-muted-foreground">
                            Changing role for{' '}
                            <strong>
                                {userToChangeRole?.name} {userToChangeRole?.lastName}
                            </strong>
                        </p>
                        <form onSubmit={handleChangeRole} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">New Role</label>
                                <select
                                    name="roleId"
                                    defaultValue={userToChangeRole?.roleId}
                                    required
                                    className="mt-1 block w-full rounded-lg border px-3 py-2 focus:border-primary focus:ring-primary"
                                >
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRoleModalOpen(false);
                                        setUserToChangeRole(null);
                                        setError(null);
                                    }}
                                    className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="flex items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Change Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Delete User</h2>
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setUserToDelete(null);
                                }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

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
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setUserToDelete(null);
                                }}
                                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </Page>
    );
};


export default UsersPage;