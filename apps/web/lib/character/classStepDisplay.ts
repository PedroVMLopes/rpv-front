import type { CharacterGrant, Locale } from "@rpv/domain";
import {
    collectExclusiveGroupChoices,
    fixedGrantsToCharacterGrants,
    getClassGrantSourcesForLevel,
    type Grant,
} from "@rpv/content";

const FIXED_PROFICIENCY_GRANT_TYPES = new Set<Grant["grantType"]>([
    "saving_throw_proficiency",
    "armor_proficiency",
    "weapon_proficiency",
    "tool_proficiency",
]);

const EQUIPMENT_GRANT_TYPES = new Set<Grant["grantType"]>([
    "inventory_item",
    "currency",
]);

export type ClassStepPartition = {
    fixedDisplayGrants: CharacterGrant[];
    equipmentSummary: string | null;
};

function isFixedProficiencyGrant(grant: Grant): boolean {
    return grant.choose === 0 && FIXED_PROFICIENCY_GRANT_TYPES.has(grant.grantType);
}

function isFixedResourceGrant(grant: Grant): boolean {
    return grant.choose === 0 && grant.grantType === "resource";
}

function isFixedAbilityGrant(grant: Grant): boolean {
    return grant.choose === 0 && grant.grantType === "ability";
}

function summarizeExclusiveBranch(grants: Grant[], branchId: string): string {
    const branchGrants = grants.filter(
        (grant) => grant.exclusiveBranch === branchId
    );

    const currencyGrant = branchGrants.find(
        (grant) => grant.grantType === "currency"
    );

    if (currencyGrant?.ref === "gold" && currencyGrant.amount !== undefined) {
        return `${currencyGrant.amount} gp`;
    }

    if (branchGrants.some((grant) => grant.grantType === "inventory_item")) {
        return "equipment";
    }

    const labeled = branchGrants.find((grant) => grant.description?.trim());
    return labeled?.description?.trim() ?? branchId;
}

export function summarizeClassStartingEquipment(
    classSlug: string,
    level: number
): string | null {
    const blocks = getClassGrantSourcesForLevel(classSlug, level);
    const summaries: string[] = [];

    for (const block of blocks) {
        const choices = collectExclusiveGroupChoices(
            block.grants,
            { type: "class", id: classSlug },
            block.featureLevel
        );

        for (const choice of choices) {
            const branchLabels = choice.branches.map((branch) =>
                summarizeExclusiveBranch(block.grants, branch.branchId)
            );

            if (branchLabels.length > 0) {
                summaries.push(branchLabels.join(" or "));
            }
        }
    }

    if (summaries.length === 0) {
        const hasEquipment = blocks.some((block) =>
            block.grants.some((grant) => EQUIPMENT_GRANT_TYPES.has(grant.grantType))
        );

        return hasEquipment ? "equipment" : null;
    }

    return summaries.join("; ");
}

export function partitionClassGrantsForLevel(
    classSlug: string,
    level: number
): ClassStepPartition {
    const blocks = getClassGrantSourcesForLevel(classSlug, level);
    const source = { type: "class" as const, id: classSlug };
    const fixedDisplayGrants: CharacterGrant[] = [];

    for (const block of blocks) {
        const fixedGrants = block.grants.filter(
            (grant) =>
                isFixedProficiencyGrant(grant) ||
                isFixedResourceGrant(grant) ||
                isFixedAbilityGrant(grant)
        );

        fixedDisplayGrants.push(
            ...fixedGrantsToCharacterGrants(fixedGrants, source, {
                featureLevel: block.featureLevel,
            })
        );
    }

    return {
        fixedDisplayGrants,
        equipmentSummary: summarizeClassStartingEquipment(classSlug, level),
    };
}

const ABILITY_STAT_REFS = new Set([
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
]);

export function formatClassStepGrantLabel(
    grant: CharacterGrant,
    locale: Locale,
    translateAbility: (ref: string) => string,
    translateResource: (ref: string) => string
): string {
    if (grant.name) {
        return grant.name;
    }

    if (grant.kind === "resource") {
        return translateResource(grant.ref);
    }

    if (grant.kind === "proficiency" && ABILITY_STAT_REFS.has(grant.ref)) {
        return `${translateAbility(grant.ref)} save`;
    }

    if (grant.kind === "saving_throw") {
        return `${translateAbility(grant.ref)} save`;
    }

    return humanizeRef(grant.ref);
}

function humanizeRef(ref: string): string {
    return ref
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
