import type { CharacterInventory } from "@rpv/domain";

function normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
}

/**
 * Whether a bag slug can be equipped into a slot under current inventory rules:
 * slot empty and slug not already equipped in another slot.
 */
export function canEquipSlugToSlot(
    equipped: CharacterInventory["equipped"],
    slotId: string,
    slug: string
): boolean {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug || !slotId) {
        return false;
    }

    if (equipped[slotId]) {
        return false;
    }

    return !Object.entries(equipped).some(
        ([existingSlotId, existingSlug]) =>
            existingSlotId !== slotId &&
            normalizeSlug(existingSlug) === normalizedSlug
    );
}

/** True when the slug occupies any equipment slot. */
export function isSlugEquipped(
    equipped: CharacterInventory["equipped"],
    slug: string
): boolean {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) {
        return false;
    }

    return Object.values(equipped).some(
        (equippedSlug) => normalizeSlug(equippedSlug) === normalizedSlug
    );
}
