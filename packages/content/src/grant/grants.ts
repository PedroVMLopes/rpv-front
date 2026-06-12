import type { Modifier } from "@rpv/domain";
import type { SpellCatalogEntry } from "../spell/spell.types";
import type { Grant, GrantOption, SelectionFilter } from "./grant.types";

/**
 * Converts fixed `ability_score` grants into domain modifiers. Choice-based
 * grants are skipped here; they become modifiers in Phase 3 once the player
 * has picked. The domain resolver remains the single source of stat math.
 */
export function abilityScoreGrantsToModifiers(
    grants: Grant[],
    sourceId: string
): Modifier[] {
    return grants
        .filter(
            (grant) =>
                grant.grantType === "ability_score" &&
                grant.choose === 0 &&
                grant.targetStat !== undefined &&
                grant.amount !== undefined
        )
        .map((grant) => ({
            id: `race-${sourceId}-${grant.targetStat}`,
            stat: grant.targetStat!,
            operation: "add",
            value: grant.amount!,
            source: { type: "race", id: sourceId },
            duration: { type: "permanent" },
            stacking: "stack",
            priority: 0,
        }));
}

export function resolveSpellPool(
    filter: SelectionFilter,
    spells: SpellCatalogEntry[]
): SpellCatalogEntry[] {
    return spells.filter((spell) => {
        if (filter.levelInt !== undefined && spell.levelInt !== filter.levelInt) {
            return false;
        }
        if (
            filter.spellLists &&
            !filter.spellLists.some((list) => spell.spellLists.includes(list))
        ) {
            return false;
        }
        return true;
    });
}

/**
 * Returns the choosable pool for a grant: enumerated options when present,
 * otherwise the spells matching a spell `selectionFilter`.
 */
export function resolveGrantPool(
    grant: Grant,
    catalog: { spells: SpellCatalogEntry[] }
): { spells?: SpellCatalogEntry[]; options?: GrantOption[] } {
    if (grant.options && grant.options.length > 0) {
        return { options: grant.options };
    }

    if (grant.grantType === "spell" && grant.selectionFilter) {
        return { spells: resolveSpellPool(grant.selectionFilter, catalog.spells) };
    }

    return {};
}
