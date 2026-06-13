import type { BaseStats, CharacterType, Locale, Modifier } from "@rpv/domain";
import type { SystemKey } from "@/presets";

export type CharacterSelections = {
    race?: string;
    subrace?: string;
    choices: Record<string, unknown>;
};

export type StoredCharacter = {
    id: string;
    type: CharacterType;
    system: SystemKey;
    /** Language the user authored this character's free text in. */
    language: Locale;
    name: string;
    baseStats: BaseStats;
    modifiers: Modifier[];
    selections: CharacterSelections;
    resources: Record<string, number>;
    systemData: Record<string, unknown>;
};
