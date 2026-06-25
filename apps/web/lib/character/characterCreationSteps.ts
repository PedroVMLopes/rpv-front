import type { FieldErrors } from "react-hook-form";
import type { ModifierSource } from "@rpv/domain";

export type CharacterCreationStepId =
    | "race"
    | "class"
    | "abilities"
    | "background"
    | "equipment";

export type CharacterCreationStep = {
    id: CharacterCreationStepId;
    fieldNames: string[];
};

export const CHARACTER_CREATION_STEPS: CharacterCreationStep[] = [
    { id: "race", fieldNames: ["race", "subrace"] },
    { id: "class", fieldNames: ["level", "characterClass", "subclass"] },
    { id: "abilities", fieldNames: [] },
    { id: "background", fieldNames: ["name", "age", "goals", "background"] },
    { id: "equipment", fieldNames: ["gold", "silver", "bronze"] },
];

export const CHARACTER_CREATION_STEP_COUNT = CHARACTER_CREATION_STEPS.length;

function readNonEmptyString(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

export function canCompleteStep(
    stepId: CharacterCreationStepId,
    formValues: Record<string, unknown>
): boolean {
    switch (stepId) {
        case "race":
            return readNonEmptyString(formValues.race) !== undefined;
        case "class":
            return readNonEmptyString(formValues.characterClass) !== undefined;
        case "abilities":
            return true;
        case "background":
            return readNonEmptyString(formValues.background) !== undefined;
        case "equipment":
            return true;
        default:
            return false;
    }
}

export function computeMaxUnlockedStep(
    formValues: Record<string, unknown>
): number {
    let max = 0;

    for (let index = 0; index < CHARACTER_CREATION_STEPS.length - 1; index++) {
        if (!canCompleteStep(CHARACTER_CREATION_STEPS[index].id, formValues)) {
            break;
        }

        max = index + 1;
    }

    return max;
}

export function getStepIndexForField(fieldName: string): number {
    if (
        fieldName === "attributes" ||
        fieldName === "abilityScoreMethod" ||
        fieldName === "abilityScoreRolls"
    ) {
        return 2;
    }

    const index = CHARACTER_CREATION_STEPS.findIndex((step) =>
        step.fieldNames.includes(fieldName)
    );

    return index >= 0 ? index : CHARACTER_CREATION_STEPS.length - 1;
}

export function getStepIndexForGrantPickKey(key: string): number {
    if (
        key.includes(":inventory_item:") ||
        key.includes(":currency:") ||
        key.includes(":exclusive:")
    ) {
        return 4;
    }

    const prefix = key.split(":")[0];

    switch (prefix) {
        case "race":
        case "subrace":
            return 0;
        case "class":
        case "subclass":
            return 1;
        case "background":
            return 3;
        default:
            return 1;
    }
}

export function getStepIndexForValidationPath(path: string[]): number {
    const root = path[0];

    if (!root) {
        return CHARACTER_CREATION_STEPS.length - 1;
    }

    if (root === "choices") {
        return CHARACTER_CREATION_STEPS.length - 1;
    }

    if (root === "inventory") {
        return 4;
    }

    return getStepIndexForField(root);
}

export function getFirstErrorStepIndex(
    errors: FieldErrors<Record<string, unknown>>
): number | undefined {
    const paths = collectErrorPaths(errors);

    if (paths.length === 0) {
        return undefined;
    }

    return Math.min(...paths.map((path) => getStepIndexForValidationPath(path)));
}

function collectErrorPaths(
    errors: FieldErrors<Record<string, unknown>>,
    prefix: string[] = []
): string[][] {
    const paths: string[][] = [];

    for (const [key, value] of Object.entries(errors)) {
        const nextPath = [...prefix, key];

        if (!value) {
            continue;
        }

        if (typeof value === "object" && "message" in value && value.message) {
            paths.push(nextPath);
            continue;
        }

        if (typeof value === "object") {
            paths.push(
                ...collectErrorPaths(
                    value as FieldErrors<Record<string, unknown>>,
                    nextPath
                )
            );
        }
    }

    return paths;
}

export function filterFieldsForStep(
    fields: Array<{ name: string; [key: string]: unknown }>,
    stepId: CharacterCreationStepId
): Array<{ name: string; [key: string]: unknown }> {
    const step = CHARACTER_CREATION_STEPS.find((entry) => entry.id === stepId);
    if (!step) {
        return [];
    }

    const allowed = new Set(step.fieldNames);
    return fields.filter((field) => allowed.has(field.name));
}

export function matchesGrantSourceTypes(
    source: ModifierSource,
    sourceTypes?: Array<ModifierSource["type"]>
): boolean {
    if (!sourceTypes || sourceTypes.length === 0) {
        return true;
    }

    return sourceTypes.includes(source.type);
}

export function getGrantSourceTypesForStep(
    stepId: CharacterCreationStepId
): Array<ModifierSource["type"]> | undefined {
    switch (stepId) {
        case "race":
            return ["race", "subrace"];
        case "class":
            return ["class", "subclass"];
        case "background":
            return ["background"];
        default:
            return undefined;
    }
}
