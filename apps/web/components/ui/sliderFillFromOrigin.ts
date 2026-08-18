export function sliderFillFromOrigin(
    value: number,
    origin: number,
    min: number,
    max: number
): { leftPct: number; widthPct: number } {
    const span = max - min;
    if (span === 0) {
        return { leftPct: 0, widthPct: 0 };
    }

    const pct = (n: number) => ((n - min) / span) * 100;
    const originPct = pct(origin);
    const valuePct = pct(value);

    return {
        leftPct: Math.min(originPct, valuePct),
        widthPct: Math.abs(valuePct - originPct),
    };
}
