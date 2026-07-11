import { getClassSubclassLevel } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { listSubraceOptions } from "@/lib/catalog/raceCatalog";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { readLevelFromForm } from "@/lib/character/level";
import {
    collectPendingChoiceGrants,
    type PendingChoiceGrant,
} from "@/lib/character/grantChoices";
import { buildCreationStepGraph } from "./buildCreationStepGraph";
import type {
    CreationMacroGroupId,
    CreationStep,
    CreationStepGraph,
    CreationStepKind,
    CreationStepSourceFilter,
} from "./creationStep.types";
import {
    featureLevelFromGrantPickKey,
    isCantripGrant,
    isLeveledSpellGrant,
} from "./grantPickKey";
import { getCreationProgressionLevel } from "./progressionLevel";

export type ResolveCreationStepsInput = {
    formValues: Record<string, unknown>;
    system: SystemKey;
    contentLocale: Locale;
};

function createStep(
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

function matchesFeatureLevel(choice: PendingChoiceGrant, level: number): boolean {
    const featureLevel = featureLevelFromGrantPickKey(choice.key);

    if (level === 1) {
        return featureLevel === 1;
    }

    return featureLevel === level;
}

function filterChoicesForLevelSegment(
    choices: PendingChoiceGrant[],
    level: number
): PendingChoiceGrant[] {
    return choices.filter((choice) => matchesFeatureLevel(choice, level));
}

function appendGrantPickSubSteps(
    steps: CreationStep[],
    stepPrefix: string,
    macroGroupId: CreationMacroGroupId,
    parentId: string,
    choices: PendingChoiceGrant[],
    sourceFilterBase: CreationStepSourceFilter
): void {
    const cantrips = choices.filter((choice) => isCantripGrant(choice.grant));
    const leveledSpells = choices.filter((choice) =>
        isLeveledSpellGrant(choice.grant)
    );
    const otherChoices = choices.filter(
        (choice) =>
            choice.grant.grantType !== "spell" &&
            choice.grant.grantType !== "ability_score"
    );

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

function appendRaceGrantSteps(
    steps: CreationStep[],
    pending: PendingChoiceGrant[]
): void {
    const raceChoices = pending.filter(
        (choice) =>
            choice.source.type === "race" &&
            choice.grant.grantType !== "ability_score"
    );

    if (raceChoices.length === 0) {
        return;
    }

    appendGrantPickSubSteps(steps, "race", "race", "race", raceChoices, {
        sourceTypes: ["race"],
    });
}

function appendBackgroundGrantSteps(
    steps: CreationStep[],
    pending: PendingChoiceGrant[]
): void {
    const backgroundChoices = pending.filter(
        (choice) =>
            choice.source.type === "background" &&
            choice.grant.grantType !== "inventory_item" &&
            choice.grant.grantType !== "currency"
    );

    if (backgroundChoices.length === 0) {
        return;
    }

    appendGrantPickSubSteps(
        steps,
        "background",
        "background",
        "background",
        backgroundChoices,
        { sourceTypes: ["background"] }
    );
}

function appendClassLevelSteps(
    steps: CreationStep[],
    classSlug: string,
    pending: PendingChoiceGrant[],
    progressionLevel: number
): void {
    for (let level = 1; level <= progressionLevel; level += 1) {
        const levelStepId = `class-level-${level}`;
        steps.push(
            createStep(levelStepId, "level_summary", "class", {
                parentId: "class",
                sourceFilter: {
                    sourceTypes: ["class"],
                    level,
                },
            })
        );

        const levelChoices = pending.filter(
            (choice) =>
                choice.source.type === "class" &&
                choice.source.id === classSlug &&
                choice.grant.grantType !== "ability_score" &&
                matchesFeatureLevel(choice, level)
        );

        appendGrantPickSubSteps(
            steps,
            levelStepId,
            "class",
            levelStepId,
            levelChoices,
            {
                sourceTypes: ["class"],
                level,
            }
        );
    }
}

function appendSubclassLevelSteps(
    steps: CreationStep[],
    subclassSlug: string,
    pending: PendingChoiceGrant[],
    progressionLevel: number
): void {
    for (let level = 1; level <= progressionLevel; level += 1) {
        const levelStepId = `subclass-level-${level}`;

        steps.push(
            createStep(levelStepId, "level_summary", "class", {
                parentId: "subclass",
                sourceFilter: {
                    sourceTypes: ["subclass"],
                    level,
                },
            })
        );

        const levelChoices = pending.filter(
            (choice) =>
                choice.source.type === "subclass" &&
                choice.source.id === subclassSlug &&
                matchesFeatureLevel(choice, level)
        );

        appendGrantPickSubSteps(
            steps,
            levelStepId,
            "class",
            levelStepId,
            levelChoices,
            {
                sourceTypes: ["subclass"],
                level,
            }
        );
    }
}

export function resolveCreationSteps(
    input: ResolveCreationStepsInput
): CreationStepGraph {
    const { formValues, system, contentLocale } = input;
    const selections = buildSelectionsFromForm(formValues);
    const characterLevel = readLevelFromForm(formValues);
    const progressionLevel = getCreationProgressionLevel(formValues);
    const pending = collectPendingChoiceGrants(
        selections,
        contentLocale,
        characterLevel,
        system
    );

    const steps: CreationStep[] = [];

    steps.push(
        createStep("race", "selection", "race", {
            fieldNames: ["race", "subrace"],
        })
    );

    if (selections.race) {
        const subraceOptions = listSubraceOptions(selections.race, contentLocale);

        if (subraceOptions.length > 0) {
            steps.push(
                createStep("subrace", "selection", "race", {
                    parentId: "race",
                    fieldNames: ["subrace"],
                })
            );
        }

        appendRaceGrantSteps(steps, pending);
    }

    steps.push(
        createStep("class", "selection", "class", {
            fieldNames: ["characterClass", "level"],
        })
    );

    if (selections.characterClass) {
        appendClassLevelSteps(
            steps,
            selections.characterClass,
            pending,
            progressionLevel
        );

        const subclassLevel = getClassSubclassLevel(selections.characterClass);

        if (subclassLevel !== undefined && characterLevel >= subclassLevel) {
            steps.push(
                createStep("subclass", "selection", "class", {
                    parentId: "class",
                    fieldNames: ["subclass"],
                })
            );

            if (selections.subclass) {
                appendSubclassLevelSteps(
                    steps,
                    selections.subclass,
                    pending,
                    progressionLevel
                );
            }
        }
    }

    steps.push(
        createStep("background", "selection", "background", {
            fieldNames: ["name", "age", "goals", "background"],
        })
    );

    if (selections.background) {
        appendBackgroundGrantSteps(steps, pending);
    }

    steps.push(createStep("abilities", "abilities", "abilities"));

    steps.push(
        createStep("finalize", "finalize", "finalize", {
            fieldNames: ["gold", "silver", "bronze"],
        })
    );

    return buildCreationStepGraph(steps);
}

export function resolveInitialStepId(
    requestedStepId: string | undefined,
    graph: CreationStepGraph
): string {
    if (requestedStepId && graph.isValidStepId(requestedStepId)) {
        return requestedStepId;
    }

    return graph.steps[0]?.id ?? "race";
}
