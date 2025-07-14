export const formatDate = (raw: string) => {
    if (!raw) return '—';
    const parts = raw.slice(0, 10).split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    if (raw.length === 8) return `${raw.slice(6)}-${raw.slice(4, 6)}-${raw.slice(0, 4)}`;
    return raw;
};