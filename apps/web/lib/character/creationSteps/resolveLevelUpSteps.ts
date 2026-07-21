import { getClassSubclassLevel } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { collectPendingChoiceGrants } from "@/lib/character/grantChoices";
import { readLevelFromForm } from "@/lib/character/level";
import { buildCreationStepGraph } from "./buildCreationStepGraph";
import type { CreationStep, CreationStepGraph } from "./creationStep.types";
import {
    appendClassLevelSteps,
    appendSubclassLevelSteps,
    createStep,
} from "./levelProgressionSteps";
import { shouldIncludePrepareSpellsStep } from "./shouldIncludePrepareSpellsStep";

export type ResolveLevelUpStepsInput = {
    formValues: Record<string, unknown>;
    /** Character level before the bump (persisted). */
    fromLevel: number;
    targetLevel: number;
    system: SystemKey;
    contentLocale: Locale;
};

/**
 * Delta wizard for a single level-up: class/subclass progression for
 * `targetLevel` only, plus a confirm step (HP / class resources).
 */
export function resolveLevelUpSteps(
    input: ResolveLevelUpStepsInput
): CreationStepGraph {
    const { formValues, fromLevel, targetLevel, system, contentLocale } = input;
    const selections = buildSelectionsFromForm(formValues);
    const characterLevel = readLevelFromForm(formValues);
    const effectiveTarget = Math.min(Math.max(targetLevel, 1), 20);
    const pending = collectPendingChoiceGrants(
        selections,
        contentLocale,
        characterLevel,
        system
    );

    const steps: CreationStep[] = [];
    const levelOpts = {
        fromLevelInclusive: effectiveTarget,
        toLevelInclusive: effectiveTarget,
        macroGroupId: "levelUp" as const,
        includeAbilityScorePicks: true,
        alwaysSummary: true,
    };

    if (selections.characterClass) {
        appendClassLevelSteps(steps, selections.characterClass, pending, {
            ...levelOpts,
            classParentId: null,
        });

        const subclassLevel = getClassSubclassLevel(selections.characterClass);
        const subclassUnlocked =
            subclassLevel !== undefined && characterLevel >= subclassLevel;
        const unlocksThisLevel =
            subclassLevel !== undefined &&
            fromLevel < subclassLevel &&
            effectiveTarget >= subclassLevel;

        if (subclassUnlocked || unlocksThisLevel) {
            steps.push(
                createStep("subclass", "selection", "levelUp", {
                    fieldNames: ["subclass"],
                })
            );

            if (selections.subclass) {
                appendSubclassLevelSteps(steps, selections.subclass, pending, {
                    ...levelOpts,
                    subclassParentId: "subclass",
                });
            }
        }
    }

    if (
        shouldIncludePrepareSpellsStep({
            formValues,
            system,
            contentLocale,
            characterLevel,
        })
    ) {
        steps.push(createStep("prepare-spells", "prepare_spells", "spells"));
    }

    steps.push(
        createStep("level-up-confirm", "finalize", "levelUp", {
            fieldNames: [],
        })
    );

    return buildCreationStepGraph(steps);
}
