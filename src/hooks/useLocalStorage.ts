import { useState, useEffect } from 'react';

export const useLocalStorage = (key: string, initialValue: string) => {
    const [value, setValue] = useState(localStorage.getItem(key) ?? initialValue);

    useEffect(() => {
        localStorage.setItem(key, String(value));
    }, [key, value]);

    return [value, setValue] as const;
};
