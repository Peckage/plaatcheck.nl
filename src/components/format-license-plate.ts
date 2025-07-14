export const formatLicensePlate = (input: string) => {
    const cleaned = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const formats = [
        /^([A-Z]{2})(\d{2})(\d{2})$/, /^(\d{2})(\d{2})([A-Z]{2})$/, /^(\d{2})([A-Z]{2})(\d{2})$/,
        /^([A-Z]{2})(\d{2})([A-Z]{2})$/, /^([A-Z]{2})([A-Z]{2})(\d{2})$/, /^([A-Z]{2})(\d{3})([A-Z])$/,
        /^([A-Z])(\d{3})([A-Z]{2})$/, /^(\d{3})([A-Z]{2})([A-Z])$/, /^([A-Z])(\d{2})([A-Z]{3})$/,
    ];
    for (const pattern of formats) {
        const match = cleaned.match(pattern);
        if (match) return match.slice(1).join('-');
    }
    return cleaned;
};