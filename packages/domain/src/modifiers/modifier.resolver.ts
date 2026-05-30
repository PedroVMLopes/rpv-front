// modifier.operation.ts defines operation types only; all application logic lives here.
//
// Resolution order (per stat): set → multiply → add → sub
// Within each operation group, modifiers are sorted by priority (ascending).
//
// TODO: stacking rules (replace, ignore-if-duplicate, ignore-if-higher)
// TODO: duration filtering for temporary/conditional modifiers during combat

import { Modifier } from "./modifier.types";
import { ModifierOperation } from "./modifier.operation";
import type { Stats } from "../stats/statKey";

export type { Stats };

const OPERATION_ORDER: ModifierOperation[] = [
    "set",
    "multiply",
    "add",
    "sub",
];

function byPriority(a: Modifier, b: Modifier): number {
    return a.priority - b.priority;
}

function applyOperation(
    result: Stats,
    operation: ModifierOperation,
    modifiers: Modifier[]
): void {
    const sorted = modifiers
        .filter((m) => m.operation === operation)
        .sort(byPriority);

    for (const m of sorted) {
        switch (operation) {
            case "set":
                result[m.stat] = m.value;
                break;
            case "multiply":
                result[m.stat] *= m.value;
                break;
            case "add":
                result[m.stat] += m.value;
                break;
            case "sub":
                result[m.stat] -= m.value;
                break;
        }
    }
}

export function resolveStats(baseStats: Stats, modifiers: Modifier[]): Stats {
    const result: Stats = { ...baseStats };

    for (const operation of OPERATION_ORDER) {
        applyOperation(result, operation, modifiers);
    }

    return result;
}
