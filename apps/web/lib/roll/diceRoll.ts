export const ROLLABLE_DICE = [4, 6, 8, 10, 12, 20, 100] as const;

export type DieSides = (typeof ROLLABLE_DICE)[number];

export function rollDie(
    sides: DieSides,
    rng: () => number = Math.random
): number {
    return Math.floor(rng() * sides) + 1;
}
