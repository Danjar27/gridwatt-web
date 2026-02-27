import { useAuthActions } from '@context/auth/context.ts';
import { SignOutIcon } from '@phosphor-icons/react';

const Logout = () => {
    const { logout } = useAuthActions();

    return (
        <button
            className="cursor-pointer p-2 flex justify-center items-center rounded-lg text-neutral-900 hover:bg-neutral-500 hover:text-black dark:hover:text-white transition-colors duration-200"
            onClick={logout}
        >
            <SignOutIcon width={24} height={24} weight="duotone" />
        </button>
    );
};

export default Logout;
