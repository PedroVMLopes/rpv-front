import { Modifier } from "./modifier.types";
import { StatKey } from "../stats/statKey";

export type Stats = Record<StatKey, number>;

export function resolveStats(
    baseStats: Stats,
    modifiers: Modifier[]
): Stats {
    const result: Stats = {...baseStats}

    // Set
    modifiers
        .filter(m => m.operation === "set")
        .forEach(m => {
            result[m.stat] = m.value;
        });

    // Multiply
    modifiers
        .filter(m => m.operation === "multiply")
        .forEach(m => {
            result[m.stat] *= m.value;
        })

    // Add
    modifiers
        .filter(m => m.operation === "add")
        .forEach(m => {
            result[m.stat] += m.value;
        })

    return result;
}