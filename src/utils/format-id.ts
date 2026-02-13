const PREFIXES: Record<string, string> = { seal: 'SEL', material: 'MAT', activity: 'ACT' };

export function formatEntityId(type: string, id: string): string {
    const prefix = PREFIXES[type];
    const num = id.replace(/\D/g, '');
    return `${prefix}-${num.padStart(4, '0')}`;
}

export function stripIdPrefix(value: string): string {
    const match = value.match(/\d+$/);
    return match ? String(Number(match[0])) : value;
}
