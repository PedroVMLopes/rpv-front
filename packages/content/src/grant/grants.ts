import type { CharacterGrant, Modifier, ModifierSource } from "@rpv/domain";
import type { Language } from "../catalog/catalog.types";
import type { SpellCatalogEntry } from "../spell/spell.types";
import type { Grant, GrantOption, SelectionFilter } from "./grant.types";

const GRANT_TYPE_TO_KIND: Record<
    Exclude<Grant["grantType"], "ability_score" | "stat_modifier">,
    CharacterGrant["kind"]
> = {
    ability: "ability",
    skill_proficiency: "proficiency",
    weapon_proficiency: "proficiency",
    tool_proficiency: "proficiency",
    armor_proficiency: "proficiency",
    saving_throw_proficiency: "saving_throw",
    language: "language",
    spell: "spell",
    resource: "resource",
};

function grantKindFromType(grantType: Grant["grantType"]): CharacterGrant["kind"] | null {
    if (grantType === "ability_score" || grantType === "stat_modifier") {
        return null;
    }
    return GRANT_TYPE_TO_KIND[grantType];
}

/**
 * Converts fixed `ability_score` grants into domain modifiers. Choice-based
 * grants are skipped here; they become modifiers once the player has picked.
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
            operation: "add" as const,
            value: grant.amount!,
            source: { type: "race" as const, id: sourceId },
            duration: { type: "permanent" as const },
            stacking: "stack" as const,
            priority: 0,
        }));
}

export function statModifierGrantsToModifiers(
    grants: Grant[],
    source: ModifierSource
): Modifier[] {
    return grants
        .filter(
            (grant) =>
                grant.grantType === "stat_modifier" &&
                grant.choose === 0 &&
                grant.targetStat !== undefined &&
                grant.amount !== undefined
        )
        .map((grant) => ({
            id: `${source.type}-${source.id}-stat-${grant.targetStat}`,
            stat: grant.targetStat!,
            operation: "add" as const,
            value: grant.amount!,
            source,
            duration: { type: "permanent" as const },
            stacking: "stack" as const,
            priority: 0,
        }));
}

function optionToGrant(
    option: GrantOption,
    grant: Grant,
    source: ModifierSource,
    index: number
): CharacterGrant | null {
    const kindFromGrantType = grantKindFromType(grant.grantType);
    const kind =
        kindFromGrantType ??
        (option.optionType === "spell"
            ? "spell"
            : option.optionType === "language"
              ? "language"
              : "proficiency");

    return {
        id: `${source.type}-${source.id}-${grant.grantType}-${option.ref}-${index}`,
        kind,
        ref: option.ref,
        source,
    };
}

/**
 * Converts fixed grants (`choose === 0`) into domain character grants.
 * Choice-based grants are resolved separately once the player has picked.
 */
export function fixedGrantsToCharacterGrants(
    grants: Grant[],
    source: ModifierSource,
    context?: { featureLevel?: number }
): CharacterGrant[] {
    const result: CharacterGrant[] = [];
    const levelKey = context?.featureLevel ?? "base";

    for (const grant of grants) {
        if (grant.choose !== 0) {
            continue;
        }

        if (grant.grantType === "resource") {
            if (grant.ref !== undefined && grant.amount !== undefined) {
                result.push({
                    id: `${source.type}-${source.id}-${levelKey}-resource-${grant.ref}`,
                    kind: "resource",
                    ref: grant.ref,
                    amount: grant.amount,
                    source,
                    name: grant.description,
                });
            }
            continue;
        }

        const kind = grantKindFromType(grant.grantType);
        if (!kind) {
            continue;
        }

        if (grant.options && grant.options.length > 0) {
            grant.options.forEach((option, index) => {
                const characterGrant = optionToGrant(option, grant, source, index);
                if (characterGrant) {
                    result.push(characterGrant);
                }
            });
            continue;
        }

        if (grant.grantType === "ability" && grant.description) {
            result.push({
                id: `${source.type}-${source.id}-${levelKey}-ability-${grant.description}`,
                kind: "ability",
                ref: grant.description,
                source,
                name: grant.description,
            });
        }
    }

    return result;
}

export function countLanguageChoices(grants: Grant[]): number {
    return grants
        .filter((grant) => grant.grantType === "language" && grant.choose > 0)
        .reduce((total, grant) => total + grant.choose, 0);
}

export function resolveLanguagePool(
    grant: Grant,
    languages: Language[]
): Language[] {
    if (grant.grantType !== "language") {
        return [];
    }

    if (grant.options && grant.options.length > 0) {
        const refs = new Set(
            grant.options
                .filter((option) => option.optionType === "language")
                .map((option) => option.ref)
        );
        return languages.filter((language) => refs.has(language.slug));
    }

    if (grant.selectionFilter?.any) {
        return languages;
    }

    return [];
}

export function choiceGrantToCharacterGrant(
    grant: Grant,
    source: ModifierSource,
    choiceKey: string,
    ref: string,
    name?: string
): CharacterGrant | null {
    const kind = grantKindFromType(grant.grantType);
    if (!kind) {
        return null;
    }

    return {
        id: `${source.type}-${source.id}-${choiceKey}-${ref}`,
        kind,
        ref,
        source,
        name,
    };
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
    catalog: { spells: SpellCatalogEntry[]; languages?: Language[] }
): {
    spells?: SpellCatalogEntry[];
    options?: GrantOption[];
    languages?: Language[];
} {
    if (grant.options && grant.options.length > 0) {
        return { options: grant.options };
    }

    if (grant.grantType === "spell" && grant.selectionFilter) {
        return { spells: resolveSpellPool(grant.selectionFilter, catalog.spells) };
    }

    if (grant.grantType === "language" && grant.selectionFilter) {
        return {
            languages: resolveLanguagePool(grant, catalog.languages ?? []),
        };
    }

    return {};
}
