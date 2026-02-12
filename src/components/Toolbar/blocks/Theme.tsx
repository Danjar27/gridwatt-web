import { useTheme } from '@hooks/useTheme.ts';
import { Moon, Sun } from 'lucide-react';
import Visible from '@components/atoms/Visible.tsx';

const Theme = () => {
    const [theme, toggleTheme] = useTheme();

    return (
        <button
            className="cursor-pointer hover:bg-neutral-700 p-2 bg-neutral-600 flex justify-center items-center rounded-lg"
            onClick={toggleTheme}
        >
            <Visible when={theme === 'dark'}>
                <Moon />
            </Visible>
            <Visible when={theme === 'light'}>
                <Sun />
            </Visible>
        </button>
    );
};

export default Theme;
