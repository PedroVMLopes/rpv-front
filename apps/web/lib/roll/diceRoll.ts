export const ROLLABLE_DICE = [4, 6, 8, 10, 12, 20, 100] as const;

export type DieSides = (typeof ROLLABLE_DICE)[number];

export const D100_TENS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90] as const;
export const D100_UNITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function rollDie(
    sides: DieSides,
    rng: () => number = Math.random
): number {
    return Math.floor(rng() * sides) + 1;
}

export function combineD100(tens: number, units: number): number {
    if (tens === 0 && units === 0) {
        return 100;
    }

    return tens + units;
}

export function formatD100TensLabel(tens: number): string {
    return tens === 0 ? "00" : String(tens);
}
