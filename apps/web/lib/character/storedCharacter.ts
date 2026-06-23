import type { BaseStats, CharacterGrant, CharacterType, CharacterInventory, Locale, Modifier } from "@rpv/domain";
import { emptyInventory } from "@rpv/domain";
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
    inventory: CharacterInventory;
    choices: CharacterChoices;
};

export function emptyCharacterSelections(): CharacterSelections {
    return { inventory: emptyInventory(), choices: {} };
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
