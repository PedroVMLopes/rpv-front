import type { CharacterGrant, Locale, Modifier, ModifierSource } from "@rpv/domain";
import type { Language } from "../catalog/catalog.types";
import { readItem } from "../curation/curationReaders";
import type { ItemSystem } from "../curation/itemGrants.dnd";
import type { SpellCatalogEntry } from "../spell/spell.types";
import { formatInventoryBundleLabel } from "./inventoryGrants";
import type { Grant, GrantOption, SelectionFilter } from "./grant.types";

const GRANT_TYPE_TO_KIND: Record<
    Exclude<
        Grant["grantType"],
        | "ability_score"
        | "stat_modifier"
        | "inventory_item"
        | "currency"
        | "armor_class_formula"
    >,
    CharacterGrant["kind"]
> = {
    ability: "ability",
    skill_proficiency: "proficiency",
    skill_expertise: "proficiency",
    weapon_proficiency: "proficiency",
    tool_proficiency: "proficiency",
    armor_proficiency: "proficiency",
    saving_throw_proficiency: "saving_throw",
    language: "language",
    spell: "spell",
    resource: "resource",
};

function proficiencyScaleFromGrant(grant: Grant): number | undefined {
    return grant.grantType === "skill_expertise" ? 2 : undefined;
}

function grantKindFromType(grantType: Grant["grantType"]): CharacterGrant["kind"] | null {
    if (
        grantType === "ability_score" ||
        grantType === "stat_modifier" ||
        grantType === "inventory_item" ||
        grantType === "currency" ||
        grantType === "armor_class_formula"
    ) {
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
    source: ModifierSource | string
): Modifier[] {
    const resolvedSource: ModifierSource =
        typeof source === "string" ? { type: "race", id: source } : source;

    return grants
        .filter(
            (grant) =>
                grant.grantType === "ability_score" &&
                grant.choose === 0 &&
                grant.targetStat !== undefined &&
                grant.amount !== undefined
        )
        .map((grant) => ({
            id: `${resolvedSource.type}-${resolvedSource.id}-${grant.targetStat}`,
            stat: grant.targetStat!,
            operation: "add" as const,
            value: grant.amount!,
            source: resolvedSource,
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
            duration: grant.duration ?? { type: "permanent" as const },
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
    if (
        option.optionType === "item" ||
        option.optionType === "inventory_bundle"
    ) {
        return null;
    }

    const kindFromGrantType = grantKindFromType(grant.grantType);
    const kind =
        kindFromGrantType ??
        (option.optionType === "spell"
            ? "spell"
            : option.optionType === "language"
              ? "language"
              : "proficiency");
    const proficiencyScale = proficiencyScaleFromGrant(grant);

    return {
        id: `${source.type}-${source.id}-${grant.grantType}-${option.ref}-${index}`,
        kind,
        ref: option.ref,
        source,
        ...(proficiencyScale !== undefined ? { proficiencyScale } : {}),
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

        if (grant.grantType === "inventory_item" || grant.grantType === "currency") {
            continue;
        }

        if (grant.grantType === "resource") {
            if (grant.ref !== undefined && grant.amount !== undefined) {
                const resource = {
                    ...(grant.recoverOn ? { recoverOn: grant.recoverOn } : {}),
                    ...(grant.display ? { display: grant.display } : {}),
                    ...(grant.slotLevel !== undefined
                        ? { slotLevel: grant.slotLevel }
                        : {}),
                };
                result.push({
                    id: `${source.type}-${source.id}-${levelKey}-resource-${grant.ref}`,
                    kind: "resource",
                    ref: grant.ref,
                    amount: grant.amount,
                    source,
                    name: grant.description,
                    ...(Object.keys(resource).length > 0 ? { resource } : {}),
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
                ...(grant.activation ? { activation: grant.activation } : {}),
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

    const proficiencyScale = proficiencyScaleFromGrant(grant);

    return {
        id: `${source.type}-${source.id}-${choiceKey}-${ref}`,
        kind,
        ref,
        source,
        name,
        ...(grant.activation ? { activation: grant.activation } : {}),
        ...(proficiencyScale !== undefined ? { proficiencyScale } : {}),
    };
}

export function resolveSpellPool(
    filter: SelectionFilter,
    spells: SpellCatalogEntry[]
): SpellCatalogEntry[] {
    return spells.filter((spell) => {
        if (filter.levelInt !== undefined) {
            if (spell.levelInt !== filter.levelInt) {
                return false;
            }
        } else if (filter.levelIntMax !== undefined) {
            if (spell.levelInt < 1 || spell.levelInt > filter.levelIntMax) {
                return false;
            }
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
    catalog: {
        spells: SpellCatalogEntry[];
        languages?: Language[];
        system?: ItemSystem;
        locale?: Locale;
    } = { spells: [] }
): {
    spells?: SpellCatalogEntry[];
    options?: GrantOption[];
    languages?: Language[];
    inventoryOptions?: Array<{ value: string; label: string }>;
} {
    if (grant.grantType === "ability_score") {
        if (grant.options && grant.options.length > 0) {
            return {
                options: grant.options.filter(
                    (option) => option.optionType === "stat"
                ),
            };
        }

        if (grant.selectionFilter?.stats?.length) {
            return {
                options: grant.selectionFilter.stats.map((ref) => ({
                    optionType: "stat" as const,
                    ref,
                })),
            };
        }

        return {};
    }

    if (grant.grantType === "inventory_item") {
        if (grant.selectionFilter?.itemCategory || grant.selectionFilter?.itemTags) {
            return {};
        }

        if (grant.options && grant.options.length > 0) {
            const system = catalog.system ?? "dnd";
            const locale = catalog.locale;
            const inventoryOptions = grant.options.map((option, index) => {
                if (option.optionType === "item") {
                    const item = readItem(option.ref, locale);
                    return {
                        value: String(index),
                        label: item?.name ?? option.ref,
                    };
                }

                if (option.optionType === "inventory_bundle") {
                    return {
                        value: String(index),
                        label: formatInventoryBundleLabel(option, system, locale),
                    };
                }

                return {
                    value: String(index),
                    label: String(index),
                };
            });

            return { inventoryOptions };
        }

        return {};
    }

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
