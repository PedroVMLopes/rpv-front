import type { ModifierSource } from "../modifiers/modifier.source";

export type CharacterGrantKind =
    | "language"
    | "ability"
    | "proficiency"
    | "saving_throw"
    | "spell";

export interface CharacterGrant {
    id: string;
    kind: CharacterGrantKind;
    /** Catalog slug or reference identifier (e.g. "elvish", "fire-bolt"). */
    ref: string;
    source: ModifierSource;
    /** Optional display name when resolved from catalog. */
    name?: string;
}
