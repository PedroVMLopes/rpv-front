// Resolution pipeline (per call):
//   1. duration filtering — drop modifiers that are not currently active
//   2. stacking resolution — collapse competing modifiers within a group
//   3. operation application — set → multiply → add → sub
//
// Within each operation group, modifiers are sorted by priority (ascending).

import { Modifier } from "./modifier.types";
import { ModifierOperation } from "./modifier.operation";
import type { Stats } from "../stats/statKey";

export type { Stats };

/**
 * Runtime context used to decide which time- or condition-bound modifiers are
 * currently active. Every field is optional, so `resolveStats` can be called
 * with no context (e.g. when rendering the permanent bonuses on a sheet).
 */
export interface ResolveContext {
    /** Conditions currently in effect, e.g. ["raging", "blessed"]. */
    activeConditions?: string[];
    /**
     * Rounds elapsed since temporary modifiers were applied. When provided, a
     * `temporary` modifier expires once `elapsedRounds >= rounds`.
     */
    elapsedRounds?: number;
}

const OPERATION_ORDER: ModifierOperation[] = [
    "set",
    "multiply",
    "add",
    "sub",
];

function byPriority(a: Modifier, b: Modifier): number {
    return a.priority - b.priority;
}

/**
 * Decides whether a modifier is active for the given context.
 *
 * - `permanent`   → always active.
 * - `temporary`   → active until `rounds` have elapsed. When the context does
 *                   not track elapsed rounds the modifier is assumed active
 *                   (expiry is managed by whoever advances the round counter).
 * - `conditional` → active only while its condition is listed in the context.
 *                   With no matching condition it is treated as inactive.
 */
function isActive(modifier: Modifier, context: ResolveContext): boolean {
    const { duration } = modifier;

    switch (duration.type) {
        case "permanent":
            return true;
        case "temporary":
            return (
                context.elapsedRounds === undefined ||
                context.elapsedRounds < duration.rounds
            );
        case "conditional":
            return (
                context.activeConditions?.includes(duration.condition) ?? false
            );
    }
}

/**
 * Two modifiers compete for stacking only when they are the "same kind of
 * bonus": same target `stat`, same `operation`, and same `source.type`. This
 * keeps, for example, a race's `set` and a class's `add` independent while
 * making two item bonuses to AC contend with each other.
 */
function stackingGroupKey(modifier: Modifier): string {
    return `${modifier.stat}|${modifier.operation}|${modifier.source.type}`;
}

function maxKeptValue(kept: Modifier[]): number {
    return kept.reduce(
        (max, m) => Math.max(max, m.value),
        Number.NEGATIVE_INFINITY
    );
}

/**
 * Collapses each stacking group down to the modifiers that actually apply.
 *
 * Modifiers in a group are processed in ascending priority order and folded
 * according to each one's `stacking` rule:
 *
 * - `stack`               → always kept (cumulative).
 * - `replace`             → discards everything kept so far in the group.
 * - `ignore-if-duplicate` → kept only if it is the first of its group.
 * - `ignore-if-higher`    → only the single highest-value modifier survives.
 */
function applyStacking(modifiers: Modifier[]): Modifier[] {
    const groups = new Map<string, Modifier[]>();

    for (const modifier of modifiers) {
        const key = stackingGroupKey(modifier);
        const group = groups.get(key);
        if (group) {
            group.push(modifier);
        } else {
            groups.set(key, [modifier]);
        }
    }

    const result: Modifier[] = [];

    for (const group of Array.from(groups.values())) {
        const sorted = [...group].sort(byPriority);
        let kept: Modifier[] = [];

        for (const modifier of sorted) {
            switch (modifier.stacking) {
                case "stack":
                    kept.push(modifier);
                    break;
                case "replace":
                    kept = [modifier];
                    break;
                case "ignore-if-duplicate":
                    if (kept.length === 0) {
                        kept.push(modifier);
                    }
                    break;
                case "ignore-if-higher":
                    if (
                        kept.length === 0 ||
                        modifier.value > maxKeptValue(kept)
                    ) {
                        kept = [modifier];
                    }
                    break;
            }
        }

        result.push(...kept);
    }

    return result;
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

export function resolveStats(
    baseStats: Stats,
    modifiers: Modifier[],
    context: ResolveContext = {}
): Stats {
    const active = modifiers.filter((m) => isActive(m, context));
    const stacked = applyStacking(active);

    const result: Stats = { ...baseStats };

    for (const operation of OPERATION_ORDER) {
        applyOperation(result, operation, stacked);
    }

    return result;
}
