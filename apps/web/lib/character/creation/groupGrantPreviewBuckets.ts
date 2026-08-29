import type { Grant } from "@rpv/content";
import { getSpell } from "@rpv/content";
import type { Locale, ModifierSource } from "@rpv/domain";
import {
    isCantripGrant,
    isLeveledSpellGrant,
} from "@/lib/character/creationSteps/grantPickKey";

export type GrantPreviewContext = {
    grant: Grant;
    source: ModifierSource;
    featureLevel?: number;
};

export type GrantPreviewBuckets = {
    proficiencies: {
        weapons: GrantPreviewContext[];
        armor: GrantPreviewContext[];
        skills: GrantPreviewContext[];
        tools: GrantPreviewContext[];
        languages: GrantPreviewContext[];
    };
    actionsAndResources: {
        cantrips: GrantPreviewContext[];
        spells: GrantPreviewContext[];
        actions: GrantPreviewContext[];
        resources: GrantPreviewContext[];
    };
};

function emptyBuckets(): GrantPreviewBuckets {
    return {
        proficiencies: {
            weapons: [],
            armor: [],
            skills: [],
            tools: [],
            languages: [],
        },
        actionsAndResources: {
            cantrips: [],
            spells: [],
            actions: [],
            resources: [],
        },
    };
}

function isPreviewableFixedGrant(grant: Grant): boolean {
    return (
        grant.choose === 0 &&
        grant.grantType !== "ability_score" &&
        grant.grantType !== "armor_class_formula"
    );
}

function resolveFixedSpellRef(grant: Grant): string | undefined {
    if (grant.ref?.trim()) {
        return grant.ref.trim();
    }

    const spellOption = grant.options?.find(
        (option) => option.optionType === "spell"
    );

    return spellOption && "ref" in spellOption ? spellOption.ref : undefined;
}

function classifySpellGrant(
    ctx: GrantPreviewContext,
    locale: Locale
): "cantrips" | "spells" {
    const { grant } = ctx;

    if (isCantripGrant(grant)) {
        return "cantrips";
    }

    if (isLeveledSpellGrant(grant)) {
        return "spells";
    }

    const spellRef = resolveFixedSpellRef(grant);

    if (spellRef) {
        const catalogLevel = getSpell(spellRef, locale)?.levelInt;
        const levelInt = grant.selectionFilter?.levelInt ?? catalogLevel;

        if (levelInt === 0) {
            return "cantrips";
        }

        if (levelInt !== undefined && levelInt > 0) {
            return "spells";
        }
    }

    return "spells";
}

function classifyAbilityGrant(ctx: GrantPreviewContext): "actions" | "resources" {
    const sourceType = ctx.source.type;

    if (sourceType === "class" || sourceType === "subclass") {
        return "actions";
    }

    if (
        sourceType === "race" ||
        sourceType === "subrace" ||
        sourceType === "background"
    ) {
        return "resources";
    }

    return "resources";
}

export function groupGrantPreviewBuckets(
    contexts: GrantPreviewContext[],
    locale: Locale = "en"
): GrantPreviewBuckets {
    const buckets = emptyBuckets();

    for (const ctx of contexts) {
        const { grant } = ctx;

        if (!isPreviewableFixedGrant(grant)) {
            continue;
        }

        switch (grant.grantType) {
            case "weapon_proficiency":
                buckets.proficiencies.weapons.push(ctx);
                break;
            case "armor_proficiency":
                buckets.proficiencies.armor.push(ctx);
                break;
            case "skill_proficiency":
            case "skill_expertise":
            case "saving_throw_proficiency":
                buckets.proficiencies.skills.push(ctx);
                break;
            case "tool_proficiency":
                buckets.proficiencies.tools.push(ctx);
                break;
            case "language":
                buckets.proficiencies.languages.push(ctx);
                break;
            case "spell":
                buckets.actionsAndResources[
                    classifySpellGrant(ctx, locale)
                ].push(ctx);
                break;
            case "ability":
                buckets.actionsAndResources[classifyAbilityGrant(ctx)].push(
                    ctx
                );
                break;
            case "resource":
            case "stat_modifier":
            case "inventory_item":
            case "currency":
            case "armor_class_formula":
                buckets.actionsAndResources.resources.push(ctx);
                break;
            default:
                buckets.actionsAndResources.resources.push(ctx);
                break;
        }
    }

    return buckets;
}

export function hasAnyProficiencyItems(buckets: GrantPreviewBuckets): boolean {
    const { weapons, armor, skills, tools, languages } = buckets.proficiencies;

    return (
        weapons.length +
            armor.length +
            skills.length +
            tools.length +
            languages.length >
        0
    );
}

export function hasAnyActionsResourceItems(
    buckets: GrantPreviewBuckets
): boolean {
    const { cantrips, spells, actions, resources } = buckets.actionsAndResources;

    return cantrips.length + spells.length + actions.length + resources.length > 0;
}

export function hasAnyBucketItems(buckets: GrantPreviewBuckets): boolean {
    return hasAnyProficiencyItems(buckets) || hasAnyActionsResourceItems(buckets);
}
