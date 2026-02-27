import { MoonStarsIcon, SunIcon } from '@phosphor-icons/react';
import { useTheme } from '@hooks/useTheme.ts';

import Visible from '@components/atoms/Visible';

const Theme = () => {
    const [theme, toggleTheme] = useTheme();

    return (
        <button
            className="cursor-pointer p-2 flex justify-center items-center rounded-lg text-neutral-900 hover:bg-neutral-500 hover:text-black dark:hover:text-white transition-colors duration-200"
            onClick={toggleTheme}
        >
            <Visible when={theme === 'dark'}>
                <MoonStarsIcon width={24} height={24} weight="duotone" />
            </Visible>
            <Visible when={theme === 'light'}>
                <SunIcon width={24} height={24} weight="duotone" />
            </Visible>
        </button>
    );
};

export default Theme;
