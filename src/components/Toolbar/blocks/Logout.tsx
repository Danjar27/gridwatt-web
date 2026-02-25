import { useAuthActions } from '@context/auth/context.ts';
import { SignOutIcon } from '@phosphor-icons/react';

const Logout = () => {
    const { logout } = useAuthActions();

    return (
        <button
            className="cursor-pointer hover:bg-neutral-500 p-2 flex justify-center items-center rounded-lg"
            onClick={logout}
        >
            <SignOutIcon width={24} height={24} weight="duotone" />
        </button>
    );
};

export default Logout;
