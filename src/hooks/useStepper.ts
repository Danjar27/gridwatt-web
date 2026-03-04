import { useCallback, useState } from 'react';

export const useStepper = <T extends string>(steps: ReadonlyArray<T>, initial?: T) => {
    const [current, setCurrent] = useState<T>(initial ?? steps[0]);

    const currentIndex = steps.indexOf(current);

    const next = useCallback(() => {
        setCurrent((prev) => {
            const idx = steps.indexOf(prev);

            return idx < steps.length - 1 ? steps[idx + 1] : prev;
        });
    }, [steps]);

    const prev = useCallback(() => {
        setCurrent((prev) => {
            const idx = steps.indexOf(prev);

            return idx > 0 ? steps[idx - 1] : prev;
        });
    }, [steps]);

    const goTo = useCallback((step: T) => setCurrent(step), []);

    const reset = useCallback(() => setCurrent(steps[0]), [steps]);

    return { current, currentIndex, next, prev, goTo, reset } as const;
};
