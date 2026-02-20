import { MoonStarsIcon, SunIcon } from '@phosphor-icons/react';
import { useTheme } from '@hooks/useTheme.ts';

import Visible from '@components/atoms/Visible.tsx';

const Theme = () => {
    const [theme, toggleTheme] = useTheme();

    return (
        <button
            className="cursor-pointer hover:bg-neutral-500 p-2 flex justify-center items-center rounded-lg"
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
