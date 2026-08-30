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
    /**
     * Playable coin pouch. Seeded once from starting-wealth grants + form
     * extras; sheet edits persist here. Not rematerialized on rebuild.
     */
    currency?: Record<string, number>;
    /** Currency materialized from class/background grants (wizard preview; rebuilt each save). */
    grantedCurrency?: Record<string, number>;
};

export function emptyCharacterSelections(): CharacterSelections {
    return { inventory: emptyInventory(), choices: {} };
}

export const STORED_CHARACTER_SCHEMA_VERSION = 1;

/** Opens later with `"party" | "gm"` when notes can be shared. */
export type NoteVisibility = "private";

export const NOTE_COLORS = [
    "chart-1",
    "chart-2",
    "chart-3",
    "chart-4",
    "chart-5",
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

export type CharacterNote = {
    id: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    visibility: NoteVisibility;
    /** Theme chart token. Omitted means the default card surface. */
    color?: NoteColor;
};

export type CharacterConcentration = {
    slug: string;
    /** Slot level used as a label only; does not change damage dice. */
    slotLevel?: number;
};

export type CharacterDeathSaves = {
    successes: number;
    failures: number;
};

export type CharacterSession = {
    concentratingOn?: CharacterConcentration | null;
    activeConditions?: string[];
    /** Temporary hit points. 0 / omitted means none. */
    tempHp?: number;
    /** Death-save pips. Omitted when none are marked. Null in a patch clears. */
    deathSaves?: CharacterDeathSaves | null;
    /** Table-awarded meta-currency (inspiration, luck, …). Refs are opaque slugs. */
    metaPoints?: Record<string, number>;
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
    /**
     * Table-session currents that rebuild must not wipe (concentration,
     * active conditions, temp HP, death saves). Distinct from derived
     * grants/modifiers.
     */
    session?: CharacterSession;
};
