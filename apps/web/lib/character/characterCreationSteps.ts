import type { FieldErrors } from "react-hook-form";
import type { Locale, ModifierSource } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import type { PresetStatConfig } from "@/presets/types";
import { findChoiceGrantByKey } from "./grantChoices";
import {
    mapFieldToStep,
    mapGrantPickToStep,
    resolveCreationSteps,
    resolveLevelUpSteps,
    type CreationStepGraph,
} from "./creationSteps";
import { isInventoryOrExclusiveKey } from "./creationSteps/grantPickKey";
import { readLevelFromForm } from "./level";

export type PlayerFormMode = "create" | "edit" | "level-up";

export type ResolvePlayerFormGraphOptions = {
    mode?: PlayerFormMode;
    /** Persisted level before bump (required when mode is level-up). */
    levelUpFromLevel?: number;
};

export type CanCompleteStepOptions = {
    statConfig?: PresetStatConfig;
};

export type GetFirstErrorStepIdOptions = {
    formData?: Record<string, unknown>;
    locale?: Locale;
    system?: SystemKey;
};

export function getFirstErrorStepId(
    errors: FieldErrors<Record<string, unknown>>,
    graph: CreationStepGraph,
    options?: GetFirstErrorStepIdOptions
): string | undefined {
    const paths = collectErrorPaths(errors);

    if (paths.length === 0) {
        return undefined;
    }

    const stepIds = paths.map((path) =>
        getStepIdForValidationPath(path, graph, options)
    );
    const indices = stepIds
        .map((stepId) => graph.getStepIndex(stepId))
        .filter((index) => index >= 0);

    if (indices.length === 0) {
        return graph.steps[0]?.id;
    }

    const minIndex = Math.min(...indices);

    return graph.steps[minIndex]?.id;
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

function getStepIdForValidationPath(
    path: string[],
    graph: CreationStepGraph,
    options?: GetFirstErrorStepIdOptions
): string {
    const root = path[0];

    if (!root) {
        return graph.steps.at(-1)?.id ?? "finalize";
    }

    if (root === "choices") {
        const grantPickKey = path[1];

        if (typeof grantPickKey === "string" && grantPickKey.length > 0) {
            const grant =
                options?.formData &&
                options.locale &&
                options.system
                    ? findChoiceGrantByKey(
                          options.formData,
                          grantPickKey,
                          options.locale,
                          options.system
                      )?.grant
                    : undefined;
            const stepId = mapGrantPickToStep(grantPickKey, grant, graph);

            return graph.isValidStepId(stepId) ? stepId : "finalize";
        }

        return graph.steps.at(-1)?.id ?? "finalize";
    }

    if (root === "inventory") {
        return "finalize";
    }

    const mapped = mapFieldToStep(root);

    return graph.isValidStepId(mapped) ? mapped : graph.steps[0]?.id ?? "race";
}

export function resolveCreationGraph(
    formValues: Record<string, unknown>,
    system: SystemKey,
    contentLocale: Locale
): CreationStepGraph {
    return resolveCreationSteps({
        formValues,
        system,
        contentLocale,
    });
}

export function resolvePlayerFormGraph(
    formValues: Record<string, unknown>,
    system: SystemKey,
    contentLocale: Locale,
    options: ResolvePlayerFormGraphOptions = {}
): CreationStepGraph {
    if (options.mode === "level-up") {
        const targetLevel = readLevelFromForm(formValues);
        const fromLevel =
            options.levelUpFromLevel ?? Math.max(1, targetLevel - 1);

        return resolveLevelUpSteps({
            formValues,
            fromLevel,
            targetLevel,
            system,
            contentLocale,
        });
    }

    return resolveCreationGraph(formValues, system, contentLocale);
}

export function canCompleteStep(
    _stepId: string,
    _formValues: Record<string, unknown>,
    _options?: CanCompleteStepOptions
): boolean {
    return true;
}

export function filterFieldsForStep<
    T extends { name: string; [key: string]: unknown },
>(fields: T[], stepId: string, graph?: CreationStepGraph): T[] {
    const step = graph?.getStep(stepId);

    if (!step?.fieldNames || step.fieldNames.length === 0) {
        return fields;
    }

    const allowed = new Set(step.fieldNames);

    return fields.filter((field) => allowed.has(field.name));
}

/** @deprecated Numeric step indexes removed — use semantic step IDs */
export function getStepIndexForGrantPickKey(key: string): number {
    if (isInventoryOrExclusiveKey(key)) {
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

/** @deprecated Use step sourceFilter from resolveCreationSteps instead */
export function getGrantSourceTypesForStep(
    stepId: string
): Array<ModifierSource["type"]> {
    if (stepId.startsWith("subclass")) {
        return ["subclass"];
    }

    if (stepId.startsWith("class")) {
        return ["class"];
    }

    if (stepId.startsWith("race") || stepId === "subrace") {
        return ["race", "subrace"];
    }

    if (stepId.startsWith("background")) {
        return ["background"];
    }

    return ["class"];
}

export { matchesGrantSourceTypes } from "./creationSteps/stepFilters";
