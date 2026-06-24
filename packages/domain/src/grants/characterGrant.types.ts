import type { ModifierSource } from "../modifiers/modifier.source";

export type CharacterGrantKind =
    | "language"
    | "ability"
    | "proficiency"
    | "saving_throw"
    | "spell"
    | "resource";

export interface CharacterGrant {
    id: string;
    kind: CharacterGrantKind;
    /** Catalog slug or reference identifier (e.g. "elvish", "fire-bolt"). */
    ref: string;
    source: ModifierSource;
    /** Optional display name when resolved from catalog. */
    name?: string;
    /** Quantity for resource grants (e.g. spell slot count). */
    amount?: number;
}
