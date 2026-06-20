import type { BaseStats, CharacterGrant, CharacterType, Locale, Modifier } from "@rpv/domain";
import type { SystemKey } from "@/presets";

export type CharacterChoices = {
    grantPicks?: Record<string, string>;
};

export type CharacterSelections = {
    race?: string;
    subrace?: string;
    characterClass?: string;
    subclass?: string;
    background?: string;
    /** Item slugs that contribute grants. Phase 1: single starting item maps here. */
    items: string[];
    choices: CharacterChoices;
};

export function emptyCharacterSelections(): CharacterSelections {
    return { items: [], choices: {} };
}

export type StoredCharacter = {
    id: string;
    type: CharacterType;
    system: SystemKey;
    /** Language the user authored this character's free text in. */
    language: Locale;
    name: string;
    baseStats: BaseStats;
    modifiers: Modifier[];
    grants: CharacterGrant[];
    selections: CharacterSelections;
    resources: Record<string, number>;
    systemData: Record<string, unknown>;
};
