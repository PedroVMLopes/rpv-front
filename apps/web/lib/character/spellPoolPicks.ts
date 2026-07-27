import type { Locale } from "@rpv/domain";
import type { UseFormReturn } from "react-hook-form";
import { getSpell } from "@rpv/content";
import type { PendingChoiceGrant } from "./grantChoices";
import {
    groupChoicesByPool,
    readPoolSelectedRefs,
    toggleRefInPool,
    type GrantChoicePool,
} from "./grantChoicePool";

export type SpellChoicePool = GrantChoicePool;

export type SpellLevelBucket = {
    levelInt: number;
    options: Array<{ value: string; label: string }>;
};

export { readPoolSelectedRefs };

/**
 * Groups sibling spell slots (same grant, choose:N) into one pool each.
 * Order of pools follows first appearance of each poolKey in `choices`.
 */
export function groupSpellChoicesByPool(
    choices: PendingChoiceGrant[]
): SpellChoicePool[] {
    return groupChoicesByPool(choices);
}

/**
 * Toggle a spell slug across sibling pool slots.
 * - Already selected → clear that slot
 * - Empty slot available → fill first empty
 * - Pool full → no-op
 */
export function toggleSpellInPool(
    form: UseFormReturn<Record<string, unknown>>,
    slots: PendingChoiceGrant[],
    slug: string
): void {
    toggleRefInPool(form, slots, slug);
}

/**
 * Buckets pool options by catalog levelInt (descending: highest first).
 * Unknown spells → -1 (last).
 */
export function bucketOptionsBySpellLevel(
    options: Array<{ value: string; label: string }>,
    locale: Locale
): SpellLevelBucket[] {
    const buckets = new Map<number, Array<{ value: string; label: string }>>();

    for (const option of options) {
        const levelInt = getSpell(option.value, locale)?.levelInt ?? -1;
        const list = buckets.get(levelInt) ?? [];
        list.push(option);
        buckets.set(levelInt, list);
    }

    return [...buckets.entries()]
        .sort(([a], [b]) => b - a)
        .map(([levelInt, opts]) => ({ levelInt, options: opts }));
}
