import type { StatKey } from "@rpv/domain";

/**
 * Built-in presets reference UI copy through translation keys (`*Key`) so the
 * label follows the active UI locale. The literal `label` fields are kept
 * optional for user-authored systems (future) that ship their own copy.
 */
export type PresetAbilityAttribute = {
    name: string;
    statKey: StatKey;
    labelKey?: string;
    label?: string;
    shortLabelKey?: string;
    shortLabel?: string;
};

export type PresetCombatStatField = "hp" | "maxHp" | "ac";

export type PresetCombatStat = {
    formFields: PresetCombatStatField[];
    statKey: StatKey;
    labelKey?: string;
    label?: string;
    defaultValue: number;
};

export type PresetResource = {
    name: string;
    labelKey?: string;
    label?: string;
    formField?: string;
    maxStatKey?: StatKey;
    defaultValue: number;
};

export type PresetStatConfig = {
    abilities: PresetAbilityAttribute[];
    combatStats: PresetCombatStat[];
    resources: PresetResource[];
    defaultAbilityValue: number;
};

export type PresetAttributeField = {
    name: string;
    labelKey?: string;
    label?: string;
};
