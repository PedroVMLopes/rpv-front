import { HIT_DICE_RESOURCE, mergeHitDiceCurrent, type HitDiceMerge } from "./vitality";

const HP_RESOURCE = "hp";

function clamp(value: number, max: number): number {
    return Math.max(0, Math.min(value, max));
}

/**
 * Combines grant-derived resource maxima with in-session current values.
 * HP is form-driven and must be passed in already synced to resolved max.
 * Hit-dice maxima are injected separately (not grant-derived).
 */
export function mergeSessionResources(
    maxima: Record<string, number>,
    existing: Record<string, number> | undefined,
    hp: number | undefined,
    hitDice?: HitDiceMerge
): Record<string, number> {
    const next: Record<string, number> = {};

    for (const [ref, max] of Object.entries(maxima)) {
        if (ref === HP_RESOURCE || ref === HIT_DICE_RESOURCE) {
            continue;
        }

        if (hitDice && ref === hitDice.ref) {
            continue;
        }

        const current = existing?.[ref];
        next[ref] = current === undefined ? max : clamp(current, max);
    }

    if (hp !== undefined) {
        next[HP_RESOURCE] = hp;
    } else if (existing?.[HP_RESOURCE] !== undefined) {
        next[HP_RESOURCE] = existing[HP_RESOURCE];
    }

    if (hitDice && hitDice.max > 0) {
        next[hitDice.ref] = mergeHitDiceCurrent({
            existing: existing?.[hitDice.ref],
            max: hitDice.max,
            previousMax: hitDice.previousMax,
        });
    }

    return next;
}
