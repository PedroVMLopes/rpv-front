import { getSubclassGrantSourcesForLevel } from "@rpv/content";
import type { PendingChoiceGrant } from "@/lib/character/grantChoices";
import type {
    CreationMacroGroupId,
    CreationStep,
    CreationStepKind,
    CreationStepSourceFilter,
} from "./creationStep.types";
import {
    featureLevelFromGrantPickKey,
    isCantripGrant,
    isLeveledSpellGrant,
} from "./grantPickKey";

export function createStep(
    id: string,
    kind: CreationStepKind,
    macroGroupId: CreationMacroGroupId,
    options: {
        parentId?: string;
        sourceFilter?: CreationStepSourceFilter;
        fieldNames?: string[];
    } = {}
): CreationStep {
    return {
        id,
        kind,
        labelKey: `steps.${id}`,
        macroGroupId,
        parentId: options.parentId,
        sourceFilter: options.sourceFilter,
        fieldNames: options.fieldNames,
    };
}

export function matchesFeatureLevel(
    choice: PendingChoiceGrant,
    level: number
): boolean {
    const featureLevel = featureLevelFromGrantPickKey(choice.key);

    if (level === 1) {
        return featureLevel === 1;
    }

    return featureLevel === level;
}

export type AppendGrantPickSubStepsOptions = {
    includeAbilityScorePicks?: boolean;
};

export function appendGrantPickSubSteps(
    steps: CreationStep[],
    stepPrefix: string,
    macroGroupId: CreationMacroGroupId,
    parentId: string,
    choices: PendingChoiceGrant[],
    sourceFilterBase: CreationStepSourceFilter,
    options: AppendGrantPickSubStepsOptions = {}
): void {
    const includeAbilityScorePicks = options.includeAbilityScorePicks === true;
    const cantrips = choices.filter((choice) => isCantripGrant(choice.grant));
    const leveledSpells = choices.filter((choice) =>
        isLeveledSpellGrant(choice.grant)
    );
    const otherChoices = choices.filter((choice) => {
        if (choice.grant.grantType === "spell") {
            return false;
        }

        if (choice.grant.grantType === "ability_score") {
            return includeAbilityScorePicks;
        }

        return true;
    });

    if (cantrips.length > 0) {
        steps.push(
            createStep(`${stepPrefix}-cantrips`, "grant_picks", macroGroupId, {
                parentId,
                sourceFilter: {
                    ...sourceFilterBase,
                    grantTypes: ["spell"],
                    spellTier: "cantrip",
                },
            })
        );
    }

    if (leveledSpells.length > 0) {
        steps.push(
            createStep(`${stepPrefix}-spells`, "grant_picks", macroGroupId, {
                parentId,
                sourceFilter: {
                    ...sourceFilterBase,
                    grantTypes: ["spell"],
                    spellTier: "leveled",
                },
            })
        );
    }

    if (otherChoices.length > 0) {
        steps.push(
            createStep(`${stepPrefix}-choices`, "grant_picks", macroGroupId, {
                parentId,
                sourceFilter: {
                    ...sourceFilterBase,
                    grantTypes: otherChoices.map((choice) => choice.grant.grantType),
                },
            })
        );
    }
}

export type AppendLevelStepsOptions = {
    fromLevelInclusive: number;
    toLevelInclusive: number;
    macroGroupId?: CreationMacroGroupId;
    /** When true, ability_score choose grants become grant_picks (level-up). */
    includeAbilityScorePicks?: boolean;
    /**
     * Parent of class level summaries / L1 picks.
     * Pass `null` for no parent (level-up has no class selection step).
     * Defaults to `"class"`.
     */
    classParentId?: string | null;
    /**
     * Parent of subclass level summaries.
     * Pass `null` for no parent. Defaults to `"subclass"`.
     */
    subclassParentId?: string | null;
    /** Force level_summary even at level 1. */
    alwaysSummary?: boolean;
};

export function appendClassLevelSteps(
    steps: CreationStep[],
    classSlug: string,
    pending: PendingChoiceGrant[],
    options: AppendLevelStepsOptions
): void {
    const {
        fromLevelInclusive,
        toLevelInclusive,
        macroGroupId = "class",
        includeAbilityScorePicks = false,
        alwaysSummary = false,
    } = options;
    const classParentId =
        options.classParentId === undefined ? "class" : options.classParentId;

    for (let level = fromLevelInclusive; level <= toLevelInclusive; level += 1) {
        const levelStepId = `class-level-${level}`;
        const hasSummary = alwaysSummary || level > 1;

        if (hasSummary) {
            steps.push(
                createStep(levelStepId, "level_summary", macroGroupId, {
                    ...(classParentId ? { parentId: classParentId } : {}),
                    sourceFilter: {
                        sourceTypes: ["class"],
                        level,
                    },
                })
            );
        }

        const levelChoices = pending.filter((choice) => {
            if (
                choice.source.type !== "class" ||
                choice.source.id !== classSlug ||
                !matchesFeatureLevel(choice, level)
            ) {
                return false;
            }

            if (
                choice.grant.grantType === "ability_score" &&
                !includeAbilityScorePicks
            ) {
                return false;
            }

            return true;
        });

        appendGrantPickSubSteps(
            steps,
            levelStepId,
            macroGroupId,
            hasSummary ? levelStepId : (classParentId ?? levelStepId),
            levelChoices,
            {
                sourceTypes: ["class"],
                level,
            },
            { includeAbilityScorePicks }
        );
    }
}

function hasSubclassActivityAtLevel(
    subclassSlug: string,
    level: number,
    pending: PendingChoiceGrant[]
): boolean {
    const levelChoices = pending.filter(
        (choice) =>
            choice.source.type === "subclass" &&
            choice.source.id === subclassSlug &&
            matchesFeatureLevel(choice, level)
    );

    if (levelChoices.length > 0) {
        return true;
    }

    return getSubclassGrantSourcesForLevel(subclassSlug, level).some(
        (block) => block.featureLevel === level && block.grants.length > 0
    );
}

export function appendSubclassLevelSteps(
    steps: CreationStep[],
    subclassSlug: string,
    pending: PendingChoiceGrant[],
    options: AppendLevelStepsOptions
): void {
    const {
        fromLevelInclusive,
        toLevelInclusive,
        macroGroupId = "class",
        includeAbilityScorePicks = false,
        alwaysSummary = false,
    } = options;
    const subclassParentId =
        options.subclassParentId === undefined
            ? "subclass"
            : options.subclassParentId;

    for (let level = fromLevelInclusive; level <= toLevelInclusive; level += 1) {
        if (!hasSubclassActivityAtLevel(subclassSlug, level, pending)) {
            continue;
        }

        const levelStepId = `subclass-level-${level}`;
        const hasSummary = alwaysSummary || level > 1;

        if (hasSummary) {
            steps.push(
                createStep(levelStepId, "level_summary", macroGroupId, {
                    ...(subclassParentId ? { parentId: subclassParentId } : {}),
                    sourceFilter: {
                        sourceTypes: ["subclass"],
                        level,
                    },
                })
            );
        }

        const levelChoices = pending.filter(
            (choice) =>
                choice.source.type === "subclass" &&
                choice.source.id === subclassSlug &&
                matchesFeatureLevel(choice, level)
        );

        appendGrantPickSubSteps(
            steps,
            levelStepId,
            macroGroupId,
            hasSummary ? levelStepId : (subclassParentId ?? levelStepId),
            levelChoices,
            {
                sourceTypes: ["subclass"],
                level,
            },
            { includeAbilityScorePicks }
        );
    }
}
