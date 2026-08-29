import type { CharacterGrant, ResourceMeta } from "@rpv/domain";
import { listCombatResources } from "./combatResources";

export type RestKind = "short_rest" | "long_rest";

function recoversOn(
    recoverOn: ResourceMeta["recoverOn"],
    kind: RestKind
): boolean {
    if (!recoverOn) {
        return false;
    }

    if (kind === "short_rest") {
        return recoverOn === "short_rest";
    }

    return recoverOn === "long_rest" || recoverOn === "short_rest";
}

/**
 * Restores session pools whose grants declare a compatible `recoverOn`.
 * Refs with omitted `recoverOn` are left unchanged. Long rest also sets
 * current HP to the resolved maximum when `maxHp` is provided.
 */
export function applyRest(
    resources: Record<string, number>,
    grants: CharacterGrant[],
    kind: RestKind,
    options?: { maxHp?: number }
): Record<string, number> {
    const next = { ...resources };
    const entries = listCombatResources(grants, resources);

    for (const entry of entries) {
        if (recoversOn(entry.recoverOn, kind)) {
            next[entry.ref] = entry.max;
        }
    }

    if (kind === "long_rest" && options?.maxHp !== undefined) {
        next.hp = options.maxHp;
    }

    return next;
}
