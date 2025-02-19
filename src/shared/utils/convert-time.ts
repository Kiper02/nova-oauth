export function convertTime(time: string): number {
    const value = parseInt(time.slice(0, -1), 10);
    const unit = time.slice(-1);

    if (isNaN(value)) {
        throw new Error('Invalid time format. Expected format: "<number><unit>", e.g., "1h", "5m"');
    }

    switch (unit) {
        case 's':
            return value * 1000;
        case 'm':
            return value * 60 * 1000;
        case 'h':
            return value * 60 * 60 * 1000;
        case 'd':
            return value * 24 * 60 * 60 * 1000;
        default:
            throw new Error('Invalid time unit. Expected one of: s, m, h, d');
    }
}
