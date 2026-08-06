import type { ItemEntry } from "../item/item.types";

function isRangedWeapon(item: ItemEntry): boolean {
    if (!item.weapon) {
        return false;
    }
    if (item.weapon.range != null || item.weapon.longRange != null) {
        return true;
    }
    return item.weapon.properties.some((property) => {
        const name = property.name.toLowerCase();
        return name === "ammunition" || name.includes("ammunition");
    });
}

function isBodyArmor(item: ItemEntry): boolean {
    return Boolean(item.armor && item.armor.category !== "shield");
}

function isShield(item: ItemEntry): boolean {
    if (item.category.key === "shield") {
        return true;
    }
    return Boolean(item.armor && item.armor.category === "shield");
}

/**
 * Soft affinity: suggested slot ids for the equip menu (compatible first).
 * Empty array means no preference — all slots are equally available.
 */
export function getSuggestedEquipmentSlotIds(item: ItemEntry): string[] {
    if (isBodyArmor(item)) {
        return ["breast"];
    }

    if (isShield(item)) {
        return ["melee-off"];
    }

    if (item.weapon) {
        if (isRangedWeapon(item)) {
            return ["ranged-main", "ranged-off"];
        }
        return ["melee-main", "melee-off"];
    }

    if (item.category.key === "ring") {
        return ["ring", "ring-2"];
    }

    if (
        item.category.key === "wondrous-item" ||
        item.slug.includes("amulet") ||
        item.name.toLowerCase().includes("amulet")
    ) {
        return ["amulet"];
    }

    return [];
}

/** Whether a weapon slug should migrate from main-hand to ranged-main. */
export function isRangedWeaponItem(item: ItemEntry | undefined): boolean {
    return item ? isRangedWeapon(item) : false;
}
