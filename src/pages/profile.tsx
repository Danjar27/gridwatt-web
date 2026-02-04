import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useAuthContext } from '@context/auth/context.ts';

export function ProfilePage() {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();

    const [name, setName] = useState(user?.name || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const updateMutation = useMutation({
        mutationFn: (data: { name?: string; lastName?: string; phone?: string; password?: string }) =>
            apiClient.updateProfile(data),
        onSuccess: () => {
            setSuccess('Profile updated successfully');
            setPassword('');
            setConfirmPassword('');
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (err) => {
            setError(err instanceof Error ? err.message : 'Update failed');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== confirmPassword) {
            setError('Passwords do not match');

            return;
        }

        const data: {
            name?: string;
            lastName?: string;
            phone?: string;
            password?: string;
        } = {
            name,
            lastName,
            phone,
        };

        if (password) {
            data.password = password;
        }

        updateMutation.mutate(data);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings</p>
            </div>

            <div className="rounded-lg border bg-card p-6">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">
                            {user?.name} {user?.lastName}
                        </h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                        <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            {user?.role?.name || user?.roleName}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                    {success && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">First Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="mt-1 block w-full rounded-lg border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Phone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 block w-full rounded-lg border px-3 py-2"
                        />
                    </div>

                    <hr className="my-6" />

                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Leave blank to keep current password</p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border px-3 py-2"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border px-3 py-2"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex items-center gap-2 rounded-lg bg-main-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
