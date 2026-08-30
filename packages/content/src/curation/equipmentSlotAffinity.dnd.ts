import type { ItemEntry } from "../item/item.types";
import {
    isBodyArmor,
    isRangedWeapon,
    isRangedWeaponItem,
    isShield,
} from "../item/itemProfile";
import { getEquipableSlotIds, resolveItemEquipPolicy } from "./itemEquipPolicy.dnd";

function intersect(preferred: string[], allowed: string[]): string[] {
    const allowedSet = new Set(allowed);
    const ordered = preferred.filter((slotId) => allowedSet.has(slotId));
    if (ordered.length > 0) {
        return ordered;
    }
    return allowed;
}

function isAmuletLike(item: ItemEntry): boolean {
    return (
        item.category.key === "wondrous-item" ||
        item.slug.includes("amulet") ||
        item.name.toLowerCase().includes("amulet")
    );
}

/**
 * Soft affinity: suggested slot ids for the equip menu (compatible first).
 * Never returns slots outside getEquipableSlotIds.
 */
export function getSuggestedEquipmentSlotIds(item: ItemEntry): string[] {
    const allowed = getEquipableSlotIds(item);
    if (allowed.length === 0) {
        return [];
    }

    if (isBodyArmor(item)) {
        return intersect(["breast"], allowed);
    }

    if (isShield(item)) {
        return intersect(["melee-off"], allowed);
    }

    if (item.weapon) {
        if (isRangedWeapon(item)) {
            return intersect(["ranged-main", "ranged-off"], allowed);
        }
        return intersect(["melee-main", "melee-off"], allowed);
    }

    if (item.category.key === "ring") {
        return intersect(["ring", "ring-2"], allowed);
    }

    if (isAmuletLike(item)) {
        return intersect(["amulet"], allowed);
    }

    if (resolveItemEquipPolicy(item) === "cosmetic") {
        return intersect(["cosmetic"], allowed);
    }

    return allowed;
}

export { isRangedWeaponItem };
