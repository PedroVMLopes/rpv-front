import type { Grant } from "@rpv/content";
import type { ModifierSource } from "@rpv/domain";
import type { PendingChoiceGrant } from "@/lib/character/grantChoices";
import type { CreationStepSourceFilter } from "./creationStep.types";
import {
    featureLevelFromGrantPickKey,
    isCantripGrant,
    isLeveledSpellGrant,
} from "./grantPickKey";

export function matchesGrantSourceTypes(
    source: ModifierSource,
    sourceTypes?: Array<ModifierSource["type"]>
): boolean {
    if (!sourceTypes || sourceTypes.length === 0) {
        return true;
    }

    return sourceTypes.includes(source.type);
}

export function matchesStepSourceFilter(
    choice: PendingChoiceGrant,
    filter?: CreationStepSourceFilter
): boolean {
    if (!filter) {
        return true;
    }

    if (
        filter.sourceTypes &&
        !matchesGrantSourceTypes(choice.source, filter.sourceTypes)
    ) {
        return false;
    }

    if (filter.level !== undefined) {
        const featureLevel = featureLevelFromGrantPickKey(choice.key);

        if (featureLevel !== filter.level) {
            return false;
        }
    }

    if (
        filter.grantTypes &&
        !filter.grantTypes.includes(choice.grant.grantType)
    ) {
        return false;
    }

    if (filter.spellTier === "cantrip") {
        return isCantripGrant(choice.grant);
    }

    if (filter.spellTier === "leveled") {
        return isLeveledSpellGrant(choice.grant);
    }

    return true;
}

export function filterChoicesForStep(
    choices: PendingChoiceGrant[],
    filter?: CreationStepSourceFilter
): PendingChoiceGrant[] {
    return choices.filter((choice) => matchesStepSourceFilter(choice, filter));
}

export function matchesGrantForFilter(
    grant: Grant,
    filter?: CreationStepSourceFilter
): boolean {
    if (!filter?.grantTypes) {
        return true;
    }

    return filter.grantTypes.includes(grant.grantType);
}
