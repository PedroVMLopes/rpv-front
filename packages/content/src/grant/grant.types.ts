import type { StatKey } from "@rpv/domain";

export type GrantType =
    | "ability_score"
    | "stat_modifier"
    | "ability"
    | "skill_proficiency"
    | "weapon_proficiency"
    | "tool_proficiency"
    | "armor_proficiency"
    | "saving_throw_proficiency"
    | "language"
    | "spell"
    | "resource"
    | "inventory_item"
    | "currency";

/**
 * Describes a pool to choose from when a grant is not fixed. Either a spell
 * filter (resolved against the spell catalog) or an open choice (`any`).
 *
 * `itemCategory` / `itemTags` are reserved for future item-catalog filters (v2).
 */
export interface SelectionFilter {
    spellLists?: string[];
    levelInt?: number;
    any?: boolean;
    itemCategory?: string;
    itemTags?: string[];
}

export type CatalogGrantOption =
    | { optionType: "spell"; ref: string }
    | { optionType: "skill"; ref: string }
    | { optionType: "language"; ref: string }
    | { optionType: "proficiency"; ref: string };

export type InventoryGrantOption =
    | { optionType: "item"; ref: string; amount?: number }
    | {
          optionType: "inventory_bundle";
          items: Array<{ ref: string; amount?: number }>;
          label?: string;
      };

export type GrantOption = CatalogGrantOption | InventoryGrantOption;

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
    /** Resource identifier when grantType is "resource" (e.g. "spell-slots-1"). */
    ref?: string;
    options?: GrantOption[];
    selectionFilter?: SelectionFilter;
}
