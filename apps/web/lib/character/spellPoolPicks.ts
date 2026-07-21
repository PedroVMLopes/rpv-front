import type { Locale } from "@rpv/domain";
import type { UseFormReturn } from "react-hook-form";
import { getSpell } from "@rpv/content";
import type { PendingChoiceGrant } from "./grantChoices";
import { getGrantChoicePoolKey } from "./grantChoiceOptions";
import { setGrantPick } from "./grantPickForm";

export type SpellChoicePool = {
    poolKey: string;
    slots: PendingChoiceGrant[];
    /** Shared option list from the first slot (siblings share the same grant). */
    options: Array<{ value: string; label: string }>;
    label: string;
};

export type SpellLevelBucket = {
    levelInt: number;
    options: Array<{ value: string; label: string }>;
};

/**
 * Groups sibling spell slots (same grant, choose:N) into one pool each.
 * Order of pools follows first appearance of each poolKey in `choices`.
 */
export function groupSpellChoicesByPool(
    choices: PendingChoiceGrant[]
): SpellChoicePool[] {
    const order: string[] = [];
    const byKey = new Map<string, PendingChoiceGrant[]>();

    for (const choice of choices) {
        const poolKey = getGrantChoicePoolKey(choice.key);
        const existing = byKey.get(poolKey);

        if (!existing) {
            order.push(poolKey);
            byKey.set(poolKey, [choice]);
        } else {
            existing.push(choice);
        }
    }

    return order.map((poolKey) => {
        const slots = byKey.get(poolKey) ?? [];
        const first = slots[0]!;

        return {
            poolKey,
            slots,
            options: first.options,
            label: first.label
                .replace(/\s*\(\d+\/\d+\)/g, "")
                .replace(/\s*\(Level \d+\)/gi, "")
                .trim(),
        };
    });
}

export function readPoolSelectedRefs(
    grantPicks: Record<string, string>,
    slots: PendingChoiceGrant[]
): string[] {
    const refs: string[] = [];

    for (const slot of slots) {
        const ref = grantPicks[slot.key]?.trim();
        if (ref) {
            refs.push(ref);
        }
    }

    return refs;
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
    if (slots.length === 0) {
        return;
    }

    const grantPicks =
        (
            form.getValues("choices") as
                | { grantPicks?: Record<string, string> }
                | undefined
        )?.grantPicks ?? {};

    for (const slot of slots) {
        if (grantPicks[slot.key]?.trim() === slug) {
            setGrantPick(form, slot.key, "");
            return;
        }
    }

    for (const slot of slots) {
        if (!grantPicks[slot.key]?.trim()) {
            setGrantPick(form, slot.key, slug);
            return;
        }
    }
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
