import type { CharacterGrant } from "@rpv/domain";
import { deriveResourceTotals } from "./deriveResourceTotals";

const HP_RESOURCE = "hp";
const SPELL_SLOT_REF_PREFIX = "spell-slots-";

export type CombatResourceEntry = {
    ref: string;
    current: number;
    max: number;
    /** Present for spell-slots-N refs. */
    spellLevel?: number;
};

function spellLevelFromRef(ref: string): number | undefined {
    if (!ref.startsWith(SPELL_SLOT_REF_PREFIX)) {
        return undefined;
    }

    const level = Number.parseInt(ref.slice(SPELL_SLOT_REF_PREFIX.length), 10);
    return Number.isFinite(level) ? level : undefined;
}

/**
 * Class/combat resources with current (session) and max (from grants).
 * Excludes HP. Includes zero-current entries when max > 0.
 */
export function listCombatResources(
    grants: CharacterGrant[],
    resources: Record<string, number>
): CombatResourceEntry[] {
    const maxima = deriveResourceTotals(grants);
    const refs = new Set([
        ...Object.keys(maxima),
        ...Object.keys(resources),
    ]);

    const entries: CombatResourceEntry[] = [];

    for (const ref of refs) {
        if (ref === HP_RESOURCE) {
            continue;
        }

        const max = maxima[ref] ?? 0;
        if (max <= 0 && (resources[ref] === undefined || resources[ref] <= 0)) {
            continue;
        }

        const effectiveMax = Math.max(max, resources[ref] ?? 0);
        if (effectiveMax <= 0) {
            continue;
        }

        const current = Math.max(
            0,
            Math.min(resources[ref] ?? effectiveMax, effectiveMax)
        );

        entries.push({
            ref,
            current,
            max: effectiveMax,
            spellLevel: spellLevelFromRef(ref),
        });
    }

    return entries.sort((a, b) => {
        const aSpell = a.spellLevel ?? Number.POSITIVE_INFINITY;
        const bSpell = b.spellLevel ?? Number.POSITIVE_INFINITY;
        if (aSpell !== bSpell) {
            return aSpell - bSpell;
        }
        return a.ref.localeCompare(b.ref);
    });
}

export function canAdjustCombatResource(
    entry: CombatResourceEntry,
    delta: number
): boolean {
    const next = entry.current + delta;
    return next >= 0 && next <= entry.max;
}
