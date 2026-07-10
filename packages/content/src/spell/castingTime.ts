import type { SpellActionCostKind } from "./spell.types";

export function normalizeSpellActionCost(
    castingTime: string
): SpellActionCostKind {
    const normalized = castingTime.trim().toLowerCase();

    if (normalized.includes("bonus action")) {
        return "bonus_action";
    }

    if (normalized.includes("reaction")) {
        return "reaction";
    }

    if (normalized.includes("minute")) {
        return "minute";
    }

    if (normalized.includes("hour")) {
        return "hour";
    }

    if (normalized.includes("action")) {
        return "action";
    }

    return "special";
}
