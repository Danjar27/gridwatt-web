export const calculateVisibleSteps = (selected: number, total: number): Array<string | number> => {
    if (total <= 5) {
        return Array.from({ length: total }, (_, page) => page);
    }
    if (selected <= 2) {
        return [0, 1, 2, '...', total - 1];
    }
    if (selected >= total - 3) {
        return [0, '...', total - 3, total - 2, total - 1];
    }

    return [0, '...', selected, '...', total - 1];
};
