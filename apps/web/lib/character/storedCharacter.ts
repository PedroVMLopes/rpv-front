import type { BaseStats, CharacterGrant, CharacterType, CharacterInventory, Locale, Modifier } from "@rpv/domain";
import { emptyInventory } from "@rpv/domain";
import type { SystemKey } from "@/presets";

export type CharacterChoices = {
    grantPicks?: Record<string, string>;
    /** Leveled spell slugs prepared for casting (spellbook / prepared-list modes). */
    preparedSpells?: string[];
};

export type CharacterSelections = {
    race?: string;
    subrace?: string;
    characterClass?: string;
    subclass?: string;
    background?: string;
    inventory: CharacterInventory;
    choices: CharacterChoices;
    /** Currency materialized from class/background grants (rebuilt each save). */
    grantedCurrency?: Record<string, number>;
};

export function emptyCharacterSelections(): CharacterSelections {
    return { inventory: emptyInventory(), choices: {} };
}

export const STORED_CHARACTER_SCHEMA_VERSION = 1;

/** Opens later with `"party" | "gm"` when notes can be shared. */
export type NoteVisibility = "private";

export type CharacterNote = {
    id: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    visibility: NoteVisibility;
};

export type StoredCharacter = {
    id: string;
    schemaVersion: number;
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
    /** Session notes authored on the sheet. Missing means none yet. */
    notes?: CharacterNote[];
};
