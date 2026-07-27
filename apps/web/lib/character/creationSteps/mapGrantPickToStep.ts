import type { Grant } from "@rpv/content";
import type { CreationStepGraph } from "./creationStep.types";
import {
    featureLevelFromGrantPickKey,
    isCantripGrant,
    isInventoryOrExclusiveKey,
    isLeveledSpellGrant,
    parseGrantPickKey,
} from "./grantPickKey";

function levelPrefix(sourceType: string, level: number): string {
    return sourceType === "subclass"
        ? `subclass-level-${level}`
        : `class-level-${level}`;
}

function spellStepSuffix(grant: Grant): "cantrips" | "spells" {
    return isCantripGrant(grant) ? "cantrips" : "spells";
}

export function mapGrantPickToStep(
    key: string,
    grant?: Grant,
    graph?: CreationStepGraph
): string {
    if (isInventoryOrExclusiveKey(key)) {
        return "equipment";
    }

    const parsed = parseGrantPickKey(key);

    if (!parsed) {
        return "class";
    }

    if (parsed.sourceType === "race") {
        if (grant?.grantType === "spell") {
            const stepId = `race-${spellStepSuffix(grant)}`;

            return graph?.isValidStepId(stepId) ? stepId : "race";
        }

        return graph?.isValidStepId("race-choices") ? "race-choices" : "race";
    }

    if (parsed.sourceType === "background") {
        return graph?.isValidStepId("background-choices")
            ? "background-choices"
            : "background";
    }

    if (parsed.sourceType === "class" || parsed.sourceType === "subclass") {
        const level = featureLevelFromGrantPickKey(key);
        const prefix = levelPrefix(parsed.sourceType, level);

        if (grant?.grantType === "spell") {
            const stepId = `${prefix}-${spellStepSuffix(grant)}`;

            if (graph?.isValidStepId(stepId) || !graph) {
                return stepId;
            }

            if (isLeveledSpellGrant(grant) && graph?.isValidStepId(`${prefix}-spells`)) {
                return `${prefix}-spells`;
            }

            if (isCantripGrant(grant) && graph?.isValidStepId(`${prefix}-cantrips`)) {
                return `${prefix}-cantrips`;
            }

            return stepId;
        }

        const choicesStepId = `${prefix}-choices`;

        if (graph?.isValidStepId(choicesStepId) || !graph) {
            return choicesStepId;
        }

        if (graph?.isValidStepId(prefix)) {
            return prefix;
        }

        return choicesStepId;
    }

    return "class";
}

export function mapFieldToStep(fieldName: string): string {
    switch (fieldName) {
        case "race":
        case "subrace":
            return "race";
        case "characterClass":
        case "level":
            return "class";
        case "subclass":
            return "subclass";
        case "background":
        case "name":
        case "age":
        case "goals":
            return "background";
        case "attributes":
        case "abilityScoreMethod":
        case "abilityScoreRolls":
            return "abilities";
        case "gold":
        case "silver":
        case "bronze":
            return "review";
        default:
            return "review";
    }
}
