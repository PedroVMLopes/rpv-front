import type { CharacterInventory } from "@rpv/domain";
import { isMultiEquipmentSlot } from "@rpv/content";
import type { SystemKey } from "@/presets";

function normalizeSlug(slug: string): string {
    return slug.trim().toLowerCase();
}

function isSlugInMulti(
    equippedMulti: CharacterInventory["equippedMulti"] | undefined,
    slug: string
): boolean {
    const normalizedSlug = normalizeSlug(slug);
    for (const slugs of Object.values(equippedMulti ?? {})) {
        if (slugs.some((entry) => normalizeSlug(entry) === normalizedSlug)) {
            return true;
        }
    }
    return false;
}

/**
 * Whether a bag slug can be equipped into a slot under current inventory rules:
 * single slots must be empty; slug must not already be equipped (single or multi).
 */
export function canEquipSlugToSlot(
    equipped: CharacterInventory["equipped"],
    slotId: string,
    slug: string,
    equippedMulti?: CharacterInventory["equippedMulti"],
    system: SystemKey = "dnd"
): boolean {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug || !slotId) {
        return false;
    }

    if (isSlugInMulti(equippedMulti, normalizedSlug)) {
        return false;
    }

    if (isMultiEquipmentSlot(slotId, system)) {
        return !Object.values(equipped).some(
            (equippedSlug) => normalizeSlug(equippedSlug) === normalizedSlug
        );
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

/** True when the slug occupies any single or multi equipment slot. */
export function isSlugEquipped(
    equipped: CharacterInventory["equipped"],
    slug: string,
    equippedMulti?: CharacterInventory["equippedMulti"]
): boolean {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) {
        return false;
    }

    if (
        Object.values(equipped).some(
            (equippedSlug) => normalizeSlug(equippedSlug) === normalizedSlug
        )
    ) {
        return true;
    }

    return isSlugInMulti(equippedMulti, normalizedSlug);
}
