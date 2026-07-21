import type {
    CreationMacroGroup,
    CreationMacroGroupId,
    CreationStep,
    CreationStepGraph,
} from "./creationStep.types";

const MACRO_ORDER: CreationMacroGroupId[] = [
    "levelUp",
    "race",
    "class",
    "background",
    "abilities",
    "spells",
    "finalize",
];

export function buildCreationStepGraph(steps: CreationStep[]): CreationStepGraph {
    const macroGroups: CreationMacroGroup[] = MACRO_ORDER.map((id) => ({
        id,
        labelKey: `macro.${id}`,
        stepIds: steps.filter((step) => step.macroGroupId === id).map((step) => step.id),
    }));

    const stepIndexById = new Map(
        steps.map((step, index) => [step.id, index] as const)
    );

    return {
        steps,
        macroGroups,
        getStepIndex(stepId: string) {
            return stepIndexById.get(stepId) ?? -1;
        },
        getStep(stepId: string) {
            const index = stepIndexById.get(stepId);

            return index === undefined ? undefined : steps[index];
        },
        getNextStepId(stepId: string) {
            const index = stepIndexById.get(stepId);

            if (index === undefined || index >= steps.length - 1) {
                return undefined;
            }

            return steps[index + 1]?.id;
        },
        getPrevStepId(stepId: string) {
            const index = stepIndexById.get(stepId);

            if (index === undefined || index <= 0) {
                return undefined;
            }

            return steps[index - 1]?.id;
        },
        getMacroGroupForStep(stepId: string) {
            return steps.find((step) => step.id === stepId)?.macroGroupId;
        },
        isValidStepId(stepId: string) {
            return stepIndexById.has(stepId);
        },
    };
}
