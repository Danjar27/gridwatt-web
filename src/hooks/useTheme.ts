import { useLocalStorage } from '@hooks/useLocalStorage.ts';
import { useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useLocalStorage('theme', 'light');

    useEffect(() => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme.toString());
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return [theme, toggleTheme] as const;
};
