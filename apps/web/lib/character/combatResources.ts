import type { CharacterGrant, ResourceDisplay, ResourceMeta } from "@rpv/domain";
import { deriveResourceTotals } from "./deriveResourceTotals";
import { HIT_DICE_RESOURCE } from "./vitality";

const HP_RESOURCE = "hp";
const SPELL_SLOT_REF_PREFIX = "spell-slots-";

export type CombatResourceEntry = {
    ref: string;
    current: number;
    max: number;
    /** Present for slot-style resources (spell-slots-N or display: slots). */
    spellLevel?: number;
    display?: ResourceDisplay;
    recoverOn?: ResourceMeta["recoverOn"];
};

function spellLevelFromRef(ref: string): number | undefined {
    if (!ref.startsWith(SPELL_SLOT_REF_PREFIX)) {
        return undefined;
    }

    const level = Number.parseInt(ref.slice(SPELL_SLOT_REF_PREFIX.length), 10);
    return Number.isFinite(level) ? level : undefined;
}

function mergeResourceMeta(
    grants: CharacterGrant[],
    ref: string
): Pick<CombatResourceEntry, "spellLevel" | "display" | "recoverOn"> {
    const matching = grants.filter(
        (grant) => grant.kind === "resource" && grant.ref === ref
    );

    let slotLevel: number | undefined;
    let display: ResourceDisplay | undefined;
    let recoverOn: ResourceMeta["recoverOn"] | undefined;

    for (const grant of matching) {
        const meta = grant.resource;
        if (meta?.slotLevel !== undefined) {
            slotLevel = Math.max(slotLevel ?? 0, meta.slotLevel);
        }
        if (meta?.display) {
            display = meta.display;
        }
        if (meta?.recoverOn) {
            recoverOn = meta.recoverOn;
        }
    }

    const fromRef = spellLevelFromRef(ref);
    if (fromRef !== undefined) {
        slotLevel = fromRef;
        display = display ?? "slots";
        recoverOn = recoverOn ?? "long_rest";
    }

    return {
        ...(slotLevel !== undefined ? { spellLevel: slotLevel } : {}),
        ...(display ? { display } : {}),
        ...(recoverOn ? { recoverOn } : {}),
    };
}

export function isSlotDisplay(entry: CombatResourceEntry): boolean {
    return entry.display === "slots" || entry.spellLevel !== undefined;
}

/**
 * Class/combat resources with current (session) and max (from grants).
 * Excludes HP and hit-dice. Includes zero-current entries when max > 0.
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
        if (ref === HP_RESOURCE || ref === HIT_DICE_RESOURCE) {
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

        const meta = mergeResourceMeta(grants, ref);

        entries.push({
            ref,
            current,
            max: effectiveMax,
            ...meta,
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
