import type { ItemEntry } from "./item.types";

export function isRangedWeapon(item: ItemEntry): boolean {
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

export function isBodyArmor(item: ItemEntry): boolean {
    return Boolean(item.armor && item.armor.category !== "shield");
}

export function isShield(item: ItemEntry): boolean {
    if (item.category.key === "shield") {
        return true;
    }
    return Boolean(item.armor && item.armor.category === "shield");
}

/** Whether a weapon slug should migrate from main-hand to ranged-main. */
export function isRangedWeaponItem(item: ItemEntry | undefined): boolean {
    return item ? isRangedWeapon(item) : false;
}

export function hasGrants(item: ItemEntry): boolean {
    return (item.grants?.length ?? 0) > 0;
}

export function isClothingItem(item: ItemEntry): boolean {
    const slug = item.slug.toLowerCase();
    const name = item.name.toLowerCase();
    return (
        slug.includes("clothes") ||
        slug.includes("robes") ||
        name.includes("clothes") ||
        name.includes("robes")
    );
}
