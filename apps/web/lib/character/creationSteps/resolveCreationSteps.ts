import { getClassSubclassLevel } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { listSubraceOptions } from "@/lib/catalog/raceCatalog";
import { BACKGROUND_STEP_IDENTITY_FIELD_NAMES } from "@/lib/character/overviewIdentity";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { readLevelFromForm } from "@/lib/character/level";
import {
    collectPendingChoiceGrants,
    type PendingChoiceGrant,
} from "@/lib/character/grantChoices";
import { buildCreationStepGraph } from "./buildCreationStepGraph";
import type { CreationStep, CreationStepGraph } from "./creationStep.types";
import {
    appendClassLevelSteps,
    appendGrantPickSubSteps,
    appendSubclassLevelSteps,
    createStep,
} from "./levelProgressionSteps";
import { getCreationProgressionLevel } from "./progressionLevel";
import { shouldIncludePrepareSpellsStep } from "./shouldIncludePrepareSpellsStep";

export type ResolveCreationStepsInput = {
    formValues: Record<string, unknown>;
    system: SystemKey;
    contentLocale: Locale;
};

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
        appendClassLevelSteps(steps, selections.characterClass, pending, {
            fromLevelInclusive: 1,
            toLevelInclusive: progressionLevel,
        });

        const subclassLevel = getClassSubclassLevel(selections.characterClass);

        if (subclassLevel !== undefined && characterLevel >= subclassLevel) {
            steps.push(
                createStep("subclass", "selection", "class", {
                    parentId: "class",
                    fieldNames: ["subclass"],
                })
            );

            if (selections.subclass) {
                appendSubclassLevelSteps(steps, selections.subclass, pending, {
                    fromLevelInclusive: 1,
                    toLevelInclusive: progressionLevel,
                });
            }
        }
    }

    steps.push(
        createStep("background", "selection", "background", {
            fieldNames: [
                "background",
                ...BACKGROUND_STEP_IDENTITY_FIELD_NAMES,
            ],
        })
    );

    if (selections.background) {
        appendBackgroundGrantSteps(steps, pending);
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

    steps.push(createStep("abilities", "abilities", "finalize"));
    steps.push(createStep("equipment", "equipment", "finalize"));
    steps.push(
        createStep("review", "review", "finalize", {
            fieldNames: ["gold", "silver", "bronze"],
        })
    );

    return buildCreationStepGraph(steps);
}

/** Legacy deep-link alias: `finalize` → `equipment`. */
function resolveLegacyStepId(
    requestedStepId: string,
    graph: CreationStepGraph
): string | undefined {
    if (requestedStepId === "finalize" && graph.isValidStepId("equipment")) {
        return "equipment";
    }

    return undefined;
}

export function resolveInitialStepId(
    requestedStepId: string | undefined,
    graph: CreationStepGraph
): string {
    if (requestedStepId) {
        const legacy = resolveLegacyStepId(requestedStepId, graph);

        if (legacy) {
            return legacy;
        }

        if (graph.isValidStepId(requestedStepId)) {
            return requestedStepId;
        }
    }

    return graph.steps[0]?.id ?? "race";
}
