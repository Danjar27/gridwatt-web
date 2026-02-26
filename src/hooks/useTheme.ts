import { useLocalStorage } from '@hooks/useLocalStorage.ts';
import { useEffect } from 'react';

const THEME_COLORS: Record<string, string> = {
    light: '#EBEBEB',
    dark: '#28272C',
};

type Theme = 'light' | 'dark';

export const useTheme = () => {
    const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

    useEffect(() => {
        const themeStr = theme.toString();
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(themeStr);

        const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        if (meta) {
            meta.content = THEME_COLORS[themeStr] ?? THEME_COLORS.light;
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return [theme, toggleTheme] as const;
};
