import type { StatKey } from "@rpv/domain";

export type PresetAbilityAttribute = {
    name: string;
    label: string;
    statKey: StatKey;
    shortLabel?: string;
};

export type PresetCombatStatField = "hp" | "maxHp" | "ac";

export type PresetCombatStat = {
    formFields: PresetCombatStatField[];
    statKey: StatKey;
    label: string;
    defaultValue: number;
};

export type PresetStatConfig = {
    abilities: PresetAbilityAttribute[];
    combatStats: PresetCombatStat[];
    defaultAbilityValue: number;
};

export type PresetAttributeField = {
    name: string;
    label: string;
};
