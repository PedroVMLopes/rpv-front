import type { Modifier, Stats } from "@rpv/domain";
import { resolveStats } from "@rpv/domain";
import { isMaxHpEmpty } from "./hp";

function coerceResourceHp(value: unknown): number | undefined {
    if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
    }
    if (typeof value === "string" && value !== "") {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
}

/**
 * Aligns current HP with resolved max when HP was auto-filled at base max but
 * modifiers (e.g. item bonuses) raise the effective maximum.
 */
export function syncResourceHpToResolvedMax(
    processedForm: Record<string, unknown>,
    baseStats: Stats,
    modifiers: Modifier[]
): Record<string, unknown> {
    const resolvedHp = resolveStats(baseStats, modifiers).hitPoints;
    const baseMaxHp = baseStats.hitPoints;
    const currentHp = coerceResourceHp(processedForm.hp);

    if (isMaxHpEmpty(processedForm.hp) || currentHp === 0) {
        return { ...processedForm, hp: resolvedHp };
    }

    if (
        currentHp !== undefined &&
        currentHp === baseMaxHp &&
        resolvedHp > baseMaxHp
    ) {
        return { ...processedForm, hp: resolvedHp };
    }

    return processedForm;
}
