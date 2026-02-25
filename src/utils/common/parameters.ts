export const buildQueryParameters = (parameters?: unknown): string => {
    if (!parameters) {
        return '';
    }

    try {
        const processed = Object.entries(parameters)
            .filter(([_key, value]) => Boolean(value))
            .map(([key, value]) => [key, String(value)]);

        const searchParams = new URLSearchParams(processed);

        return '?' + searchParams.toString();
    } catch (error) {
        console.error(error);
    }

    return '';
};
