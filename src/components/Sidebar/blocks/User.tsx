import type { FC } from 'react';

import { buildUserInitials } from '../utils/format.ts';
import { useAuthContext } from '@context/auth/context.ts';
import { Link } from 'react-router-dom';

const User: FC = () => {
    const { user } = useAuthContext()

    if (!user) {
        return null;
    }

    const fullName = `${user?.name} ${user?.lastName}`;

    const initials = buildUserInitials(fullName);

    return (
        <Link to="/profile" className="flex gap-5 hover:bg-neutral-600 p-3 rounded-lg">
            <div className="flex justify-center items-center font= h-12 w-12 rounded-full bg-primary-500">
                <span className="text-white font-bold">{initials}</span>
            </div>
            <div className="flex flex-col gap-1">
                <span>{fullName}</span>
                <span className="max-w-max px-2 py-0.5 text-xs bg-neutral-800 text-neutral-500 rounded">
                    {user.role?.name}
                </span>
            </div>
        </Link>
    );
};

export default User;
