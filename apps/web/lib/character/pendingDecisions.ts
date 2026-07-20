import type { Locale } from "@rpv/domain";
import type { Grant } from "@rpv/content";
import type { SystemKey } from "@/presets";
import type { PresetStatConfig } from "@/presets/types";
import enMessages from "@/messages/en.json";
import ptBRMessages from "@/messages/pt-BR.json";
import { buildSelectionsFromForm } from "./characterAdapter";
import {
    findInvalidGrantPicks,
    findMissingRequiredChoices,
    findMissingSubclass,
} from "./choiceValidation";
import { resolveGrantPickValidationMessage } from "./choiceValidationMessages";
import { findChoiceGrantByKey } from "./grantChoices";
import {
    CREATION_PROGRESSION_CAP,
    featureLevelFromGrantPickKey,
    getCreationProgressionLevel,
    mapGrantPickToStep,
    resolveCreationSteps,
    resolveLevelUpSteps,
    type CreationStepGraph,
} from "./creationSteps";
import {
    isGrantPickAboveProgressionCap,
    isInventoryOrExclusiveKey,
} from "./creationSteps/grantPickKey";
import { isCharacterNamePending } from "./defaultCharacterName";
import { isAbilityScoresIncomplete } from "./abilityScoreGeneration";
import { flattenStoredToForm } from "./presetStats";
import { readLevelFromForm } from "./level";
import type { StoredCharacter } from "./storedCharacter";

export type PendingDecisionKind =
    | "race"
    | "class"
    | "background"
    | "name"
    | "subclass"
    | "abilities"
    | "grant_pick"
    | "invalid_grant_pick";

export type PendingDecisionScope = "creation" | "full" | "level-up";

export type PendingDecision = {
    id: string;
    kind: PendingDecisionKind;
    label: string;
    stepId: string;
    /** Grant pick key (or exclusive key) to scroll/highlight within the step. */
    focusKey?: string;
};

export type CollectPendingDecisionsOptions = {
    /** Persisted level before bump when scope is level-up. */
    levelUpFromLevel?: number;
};

type PendingCopy = {
    selectRace: string;
    selectClass: string;
    selectBackground: string;
    setName: string;
    selectSubclass: string;
    completeAbilities: string;
};

const pendingLabels: Record<Locale, PendingCopy> = {
    en: enMessages.character.pending,
    "pt-BR": ptBRMessages.character.pending,
};

function readNonEmptyString(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function resolveGraph(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale,
    scope: PendingDecisionScope,
    options?: CollectPendingDecisionsOptions
): CreationStepGraph {
    if (scope === "level-up") {
        const targetLevel = readLevelFromForm(formData);
        const fromLevel =
            options?.levelUpFromLevel ?? Math.max(1, targetLevel - 1);

        return resolveLevelUpSteps({
            formValues: formData,
            fromLevel,
            targetLevel,
            system,
            contentLocale: locale,
        });
    }

    return resolveCreationSteps({
        formValues: formData,
        system,
        contentLocale: locale,
    });
}

function mapChoiceToStepId(
    key: string,
    grant: Grant | undefined,
    graph: CreationStepGraph
): string {
    if (grant?.grantType === "ability_score") {
        if (graph.isValidStepId("abilities")) {
            return "abilities";
        }
    }

    return mapGrantPickToStep(key, grant, graph);
}

function shouldIncludeGrantPickPending(
    key: string,
    scope: PendingDecisionScope,
    targetLevel?: number
): boolean {
    if (scope === "full") {
        return true;
    }

    if (scope === "level-up") {
        if (isInventoryOrExclusiveKey(key)) {
            return false;
        }

        return (
            targetLevel !== undefined &&
            featureLevelFromGrantPickKey(key) === targetLevel
        );
    }

    return !isGrantPickAboveProgressionCap(key, CREATION_PROGRESSION_CAP);
}

export function collectPendingDecisions(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey,
    statConfig: PresetStatConfig,
    scope: PendingDecisionScope = "full",
    options?: CollectPendingDecisionsOptions
): PendingDecision[] {
    const labels = pendingLabels[locale] ?? pendingLabels.en;
    const graph = resolveGraph(formData, system, locale, scope, options);
    const progressionLevel =
        scope === "creation"
            ? getCreationProgressionLevel(formData)
            : undefined;
    const targetLevel =
        scope === "level-up" ? readLevelFromForm(formData) : undefined;
    const decisions: PendingDecision[] = [];

    if (scope !== "level-up") {
        if (!readNonEmptyString(buildSelectionsFromForm(formData).race)) {
            decisions.push({
                id: "pending:race",
                kind: "race",
                label: labels.selectRace,
                stepId: "race",
            });
        }

        if (
            !readNonEmptyString(buildSelectionsFromForm(formData).characterClass)
        ) {
            decisions.push({
                id: "pending:class",
                kind: "class",
                label: labels.selectClass,
                stepId: "class",
            });
        }
    }

    if (findMissingSubclass(formData, locale)) {
        decisions.push({
            id: "pending:subclass",
            kind: "subclass",
            label: labels.selectSubclass,
            stepId: graph.isValidStepId("subclass") ? "subclass" : "class",
        });
    }

    if (scope !== "level-up") {
        if (isAbilityScoresIncomplete(formData, statConfig)) {
            decisions.push({
                id: "pending:abilities",
                kind: "abilities",
                label: labels.completeAbilities,
                stepId: "abilities",
            });
        }

        const selections = buildSelectionsFromForm(formData);

        if (!readNonEmptyString(selections.background)) {
            decisions.push({
                id: "pending:background",
                kind: "background",
                label: labels.selectBackground,
                stepId: "background",
            });
        }

        if (isCharacterNamePending(formData.name, locale)) {
            decisions.push({
                id: "pending:name",
                kind: "name",
                label: labels.setName,
                stepId: "background",
            });
        }
    }

    for (const choice of findMissingRequiredChoices(formData, locale, system, {
        maxProgressionLevel: progressionLevel,
    })) {
        if (!shouldIncludeGrantPickPending(choice.key, scope, targetLevel)) {
            continue;
        }

        decisions.push({
            id: `pending:grant:${choice.key}`,
            kind: "grant_pick",
            label: choice.label,
            stepId: mapChoiceToStepId(choice.key, choice.grant, graph),
            focusKey: choice.key,
        });
    }

    for (const issue of findInvalidGrantPicks(formData, locale, system)) {
        if (
            issue.key &&
            !shouldIncludeGrantPickPending(issue.key, scope, targetLevel)
        ) {
            continue;
        }

        decisions.push({
            id: `pending:invalid:${issue.key ?? issue.ref ?? issue.code}`,
            kind: "invalid_grant_pick",
            label: resolveGrantPickValidationMessage(issue, locale),
            stepId: issue.key
                ? mapChoiceToStepId(
                      issue.key,
                      findChoiceGrantByKey(formData, issue.key, locale, system)
                          ?.grant,
                      graph
                  )
                : "class",
            focusKey: issue.key,
        });
    }

    return decisions;
}

export function collectPendingDecisionsFromStored(
    stored: StoredCharacter,
    statConfig: PresetStatConfig,
    scope: PendingDecisionScope = "full"
): PendingDecision[] {
    const formData = flattenStoredToForm(stored, stored.system);

    return collectPendingDecisions(
        formData,
        stored.language,
        stored.system,
        statConfig,
        scope
    );
}
