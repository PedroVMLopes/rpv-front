import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import type { PresetStatConfig } from "@/presets/types";
import enMessages from "@/messages/en.json";
import ptBRMessages from "@/messages/pt-BR.json";
import { buildSelectionsFromForm } from "./characterAdapter";
import { getStepIndexForGrantPickKey } from "./characterCreationSteps";
import {
    findMissingRequiredChoices,
    findMissingSubclass,
} from "./choiceValidation";
import { isCharacterNamePending } from "./defaultCharacterName";
import { isAbilityScoresIncomplete } from "./abilityScoreGeneration";
import { flattenStoredToForm } from "./presetStats";
import type { StoredCharacter } from "./storedCharacter";

export type PendingDecisionKind =
    | "race"
    | "class"
    | "background"
    | "name"
    | "subclass"
    | "abilities"
    | "grant_pick";

export type PendingDecision = {
    id: string;
    kind: PendingDecisionKind;
    label: string;
    stepIndex: number;
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

export function collectPendingDecisions(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey,
    statConfig: PresetStatConfig
): PendingDecision[] {
    const labels = pendingLabels[locale] ?? pendingLabels.en;
    const selections = buildSelectionsFromForm(formData);
    const decisions: PendingDecision[] = [];

    if (!readNonEmptyString(selections.race)) {
        decisions.push({
            id: "pending:race",
            kind: "race",
            label: labels.selectRace,
            stepIndex: 0,
        });
    }

    if (!readNonEmptyString(selections.characterClass)) {
        decisions.push({
            id: "pending:class",
            kind: "class",
            label: labels.selectClass,
            stepIndex: 1,
        });
    }

    if (findMissingSubclass(formData, locale)) {
        decisions.push({
            id: "pending:subclass",
            kind: "subclass",
            label: labels.selectSubclass,
            stepIndex: 1,
        });
    }

    if (isAbilityScoresIncomplete(formData, statConfig)) {
        decisions.push({
            id: "pending:abilities",
            kind: "abilities",
            label: labels.completeAbilities,
            stepIndex: 2,
        });
    }

    if (!readNonEmptyString(selections.background)) {
        decisions.push({
            id: "pending:background",
            kind: "background",
            label: labels.selectBackground,
            stepIndex: 3,
        });
    }

    if (isCharacterNamePending(formData.name, locale)) {
        decisions.push({
            id: "pending:name",
            kind: "name",
            label: labels.setName,
            stepIndex: 3,
        });
    }

    for (const choice of findMissingRequiredChoices(formData, locale, system)) {
        decisions.push({
            id: `pending:grant:${choice.key}`,
            kind: "grant_pick",
            label: choice.label,
            stepIndex: getStepIndexForGrantPickKey(choice.key),
        });
    }

    return decisions;
}

export function collectPendingDecisionsFromStored(
    stored: StoredCharacter,
    statConfig: PresetStatConfig
): PendingDecision[] {
    const formData = flattenStoredToForm(stored, stored.system);
    return collectPendingDecisions(
        formData,
        stored.language,
        stored.system,
        statConfig
    );
}
