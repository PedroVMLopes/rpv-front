import type { StatKey } from "@rpv/domain";

export type GrantType =
    | "ability_score"
    | "ability"
    | "skill_proficiency"
    | "weapon_proficiency"
    | "tool_proficiency"
    | "armor_proficiency"
    | "saving_throw_proficiency"
    | "language"
    | "spell";

/**
 * Describes a pool to choose from when a grant is not fixed. Either a spell
 * filter (resolved against the spell catalog) or an open choice (`any`).
 */
export interface SelectionFilter {
    spellLists?: string[];
    levelInt?: number;
    any?: boolean;
}

export interface GrantOption {
    optionType: "spell" | "skill" | "language" | "proficiency";
    ref: string;
}

/**
 * A single thing a trait gives a character.
 * - `choose === 0` -> fixed: every option (or the ability_score target) applies.
 * - `choose > 0`   -> the player picks `choose` entries from `options` or from
 *                     the pool described by `selectionFilter`.
 */
export interface Grant {
    grantType: GrantType;
    choose: number;
    description?: string;
    targetStat?: StatKey;
    amount?: number;
    options?: GrantOption[];
    selectionFilter?: SelectionFilter;
}
