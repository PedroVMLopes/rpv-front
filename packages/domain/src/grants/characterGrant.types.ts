import type { ModifierSource } from "../modifiers/modifier.source";

export type CharacterGrantKind =
    | "language"
    | "ability"
    | "proficiency"
    | "saving_throw"
    | "spell"
    | "resource";

/**
 * Declares that a grant is usable (or tactically relevant) in the action
 * catalog. Omitted means the grant is a trait only — not an action.
 * `cost` is an opaque slug; consumers map known values (e.g. action, bonus,
 * reaction, special, passive) and treat unknown slugs as special.
 */
export type GrantActivation = {
    cost: string;
    resourceRef?: string;
};

export type ResourceRecoverOn = "short_rest" | "long_rest";
export type ResourceDisplay = "slots" | "counter";

/** Session pool metadata for `kind: "resource"` grants. */
export type ResourceMeta = {
    recoverOn?: ResourceRecoverOn;
    display?: ResourceDisplay;
    slotLevel?: number;
};

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
    /** Present when this grant belongs in the action catalog. */
    activation?: GrantActivation;
    /** Present on resource grants. */
    resource?: ResourceMeta;
}
