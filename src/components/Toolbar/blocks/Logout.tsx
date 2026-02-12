import { LogOut } from 'lucide-react';
import { useAuthActions } from '@context/auth/context.ts';

const Logout = () => {
    const { logout } = useAuthActions();

    return (
        <button
            className="cursor-pointer hover:bg-neutral-700 p-2 bg-neutral-600 flex justify-center items-center rounded-lg"
            onClick={logout}
        >
            <LogOut />
        </button>
    );
};

export default Logout;
