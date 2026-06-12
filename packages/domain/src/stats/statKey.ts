// Maybe all of the statkeys should be stored here
// so items from different systems could be used, just the stats will not change

export type StatKey =
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma"
    | "armorClass"
    | "hitPoints";

export const STAT_KEYS: StatKey[] = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
    "armorClass",
    "hitPoints",
];

export type Stats = Record<StatKey, number>;

export function createDefaultStats(overrides?: Partial<Stats>): Stats {
    const stats = {} as Stats;

    for (const key of STAT_KEYS) {
        stats[key] = overrides?.[key] ?? (key === "hitPoints" ? 0 : 10);
    }

    return stats;
}