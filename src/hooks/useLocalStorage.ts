import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';

export const useLocalStorage = <T extends string>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
    const [value, setValue] = useState<T>((localStorage.getItem(key) ?? initialValue) as T);

    useEffect(() => {
        localStorage.setItem(key, String(value));
    }, [key, value]);

    return [value, setValue];
};
