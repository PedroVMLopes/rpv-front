import type { Grant } from "@rpv/content";
import type { ModifierSource } from "@rpv/domain";

export const CREATION_PROGRESSION_CAP = 3;

export type CreationMacroGroupId =
    | "race"
    | "class"
    | "background"
    | "abilities"
    | "finalize"
    | "levelUp";

export type CreationStepKind =
    | "selection"
    | "level_summary"
    | "grant_picks"
    | "abilities"
    | "finalize";

export type CreationStepSourceFilter = {
    sourceTypes?: Array<ModifierSource["type"]>;
    level?: number;
    grantTypes?: Grant["grantType"][];
    spellTier?: "cantrip" | "leveled";
};

export type CreationStep = {
    id: string;
    kind: CreationStepKind;
    labelKey: string;
    macroGroupId: CreationMacroGroupId;
    parentId?: string;
    sourceFilter?: CreationStepSourceFilter;
    fieldNames?: string[];
};

export type CreationMacroGroup = {
    id: CreationMacroGroupId;
    labelKey: string;
    stepIds: string[];
};

export type CreationStepGraph = {
    steps: CreationStep[];
    macroGroups: CreationMacroGroup[];
    getStepIndex: (stepId: string) => number;
    getStep: (stepId: string) => CreationStep | undefined;
    getNextStepId: (stepId: string) => string | undefined;
    getPrevStepId: (stepId: string) => string | undefined;
    getMacroGroupForStep: (stepId: string) => CreationMacroGroupId | undefined;
    isValidStepId: (stepId: string) => boolean;
};
