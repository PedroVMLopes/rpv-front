import type { Grant } from "@rpv/content";
import type { PendingChoiceGrant } from "./grantChoices";

export type GrantChoiceSelectOption = {
    value: string;
    label: string;
    disabled: boolean;
    owned: boolean;
};

/** Groups multi-slot picks from the same grant (e.g. fighter skill 1/2 and 2/2). */
export function getGrantChoicePoolKey(choiceKey: string): string {
    const parts = choiceKey.split(":");
    return parts.slice(0, -1).join(":");
}

function getSiblingPickedRefs(
    poolKey: string,
    grantPicks: Record<string, string>,
    currentKey: string
): Set<string> {
    const picked = new Set<string>();

    for (const [key, ref] of Object.entries(grantPicks)) {
        if (key === currentKey || !ref.trim()) {
            continue;
        }
        if (getGrantChoicePoolKey(key) === poolKey) {
            picked.add(ref);
        }
    }

    return picked;
}

function formatOptionLabel(label: string, owned: boolean): string {
    return owned ? `✓ ${label}` : label;
}

/** Picks from other choice slots of the same grant type (e.g. all language slots). */
export function getOtherPickedRefsForGrantType(
    grantType: Grant["grantType"],
    pending: PendingChoiceGrant[],
    grantPicks: Record<string, string>,
    currentKey: string
): Set<string> {
    const picked = new Set<string>();

    for (const choice of pending) {
        if (choice.grant.grantType !== grantType || choice.key === currentKey) {
            continue;
        }

        const ref = grantPicks[choice.key]?.trim();
        if (ref) {
            picked.add(ref);
        }
    }

    return picked;
}

/**
 * Builds dropdown options for one choice slot. Fixed-grant refs and picks from
 * sibling slots in the same pool appear with a checkmark and are disabled.
 */
export function buildGrantChoiceSelectOptions(
    choice: PendingChoiceGrant,
    grantPicks: Record<string, string>,
    ownedRefs: Set<string>,
    otherPickedRefs: Set<string> = new Set()
): GrantChoiceSelectOption[] {
    const selected = grantPicks[choice.key] ?? "";
    const poolKey = getGrantChoicePoolKey(choice.key);
    const siblingPicked = getSiblingPickedRefs(poolKey, grantPicks, choice.key);
    const result: GrantChoiceSelectOption[] = [];

    for (const option of choice.options) {
        const isSelected = option.value === selected;
        const owned = ownedRefs.has(option.value);
        const pickedBySibling = siblingPicked.has(option.value);
        const pickedElsewhere = otherPickedRefs.has(option.value);
        const unavailable =
            owned ||
            ((pickedBySibling || pickedElsewhere) && !isSelected);

        result.push({
            value: option.value,
            label: formatOptionLabel(option.label, unavailable),
            disabled: unavailable,
            owned: unavailable,
        });
    }

    if (selected && !result.some((option) => option.value === selected)) {
        result.push({
            value: selected,
            label: selected,
            disabled: false,
            owned: false,
        });
    }

    return result;
}

export function findDuplicateGrantPicksInPool(
    pending: PendingChoiceGrant[],
    grantPicks: Record<string, string>
): Array<{ poolKey: string; ref: string; keys: string[] }> {
    const byPool = new Map<string, Map<string, string[]>>();

    for (const choice of pending) {
        const ref = grantPicks[choice.key]?.trim();
        if (!ref) {
            continue;
        }

        const poolKey = getGrantChoicePoolKey(choice.key);
        const pool = byPool.get(poolKey) ?? new Map<string, string[]>();
        const keys = pool.get(ref) ?? [];
        keys.push(choice.key);
        pool.set(ref, keys);
        byPool.set(poolKey, pool);
    }

    const duplicates: Array<{ poolKey: string; ref: string; keys: string[] }> =
        [];

    for (const [poolKey, pool] of byPool) {
        for (const [ref, keys] of pool) {
            if (keys.length > 1) {
                duplicates.push({ poolKey, ref, keys });
            }
        }
    }

    return duplicates;
}

export function findGrantPicksOnOwnedRefs(
    pending: PendingChoiceGrant[],
    grantPicks: Record<string, string>,
    ownedRefsByGrantType: Map<Grant["grantType"], Set<string>>
): Array<{ key: string; ref: string; grantType: Grant["grantType"] }> {
    const invalid: Array<{
        key: string;
        ref: string;
        grantType: Grant["grantType"];
    }> = [];

    for (const choice of pending) {
        const ref = grantPicks[choice.key]?.trim();
        if (!ref) {
            continue;
        }

        const owned = ownedRefsByGrantType.get(choice.grant.grantType);
        if (owned?.has(ref)) {
            invalid.push({
                key: choice.key,
                ref,
                grantType: choice.grant.grantType,
            });
        }
    }

    return invalid;
}
