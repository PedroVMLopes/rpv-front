import type { ItemEquipPolicy } from "../item/itemEquipPolicy.types";
import type { ItemEntry, ItemSystem } from "../item/item.types";
import {
    hasGrants,
    isBodyArmor,
    isClothingItem,
    isShield,
} from "../item/itemProfile";
import { getItem } from "./contentRepoWrappers.dnd";
import { getEquipmentSlots } from "./equipmentSlots.dnd";

const CARRIED_CATEGORY_KEYS = new Set([
    "adventuring-gear",
    "ammunition",
    "poison",
    "tools",
    "trade-good",
    "land-vehicle",
    "waterborne-vehicle",
    "equipment-pack",
    "pack",
    "misc",
    "scroll",
]);

function wearableSingleSlotIds(system: ItemSystem): string[] {
    return getEquipmentSlots(system)
        .filter((slot) => slot.group === "wearable" && !slot.multi)
        .map((slot) => slot.id);
}

function wieldableSingleSlotIds(system: ItemSystem): string[] {
    return getEquipmentSlots(system)
        .filter((slot) => slot.group === "usable" && !slot.multi)
        .map((slot) => slot.id);
}

export function deriveItemEquipPolicy(item: ItemEntry): ItemEquipPolicy {
    if (item.weapon) {
        return "wieldable";
    }

    if (isShield(item)) {
        return "shield";
    }

    if (isBodyArmor(item)) {
        return "wearable";
    }

    if (hasGrants(item)) {
        return "granted";
    }

    if (isClothingItem(item)) {
        return "cosmetic";
    }

    const categoryKey = item.category.key;
    if (categoryKey === "ring") {
        return "cosmetic";
    }

    if (categoryKey === "wondrous-item") {
        return "wearable";
    }

    if (CARRIED_CATEGORY_KEYS.has(categoryKey)) {
        return "carried";
    }

    if (categoryKey === "rod" || categoryKey === "wand") {
        return "carried";
    }

    return "carried";
}

export function resolveItemEquipPolicy(item: ItemEntry): ItemEquipPolicy {
    return item.equipPolicy ?? deriveItemEquipPolicy(item);
}

export function getAllowedSlotIdsForPolicy(
    policy: ItemEquipPolicy,
    system: ItemSystem = "dnd"
): string[] {
    switch (policy) {
        case "carried":
            return [];
        case "cosmetic":
            return ["cosmetic"];
        case "wieldable":
            return wieldableSingleSlotIds(system);
        case "shield":
            return ["melee-off", "ranged-off"];
        case "wearable":
            return wearableSingleSlotIds(system);
        case "granted": {
            const combined = [
                ...wearableSingleSlotIds(system),
                ...wieldableSingleSlotIds(system),
            ];
            return [...new Set(combined)];
        }
        default: {
            const _exhaustive: never = policy;
            return _exhaustive;
        }
    }
}

export function getEquipableSlotIds(
    item: ItemEntry,
    system: ItemSystem = "dnd"
): string[] {
    return getAllowedSlotIdsForPolicy(resolveItemEquipPolicy(item), system);
}

export function isItemEquippable(item: ItemEntry): boolean {
    return resolveItemEquipPolicy(item) !== "carried";
}

export function canEquipItem(
    slug: string,
    slotId: string,
    system: ItemSystem = "dnd"
): boolean {
    const item = getItem(slug, system);
    if (!item) {
        return false;
    }

    return getEquipableSlotIds(item, system).includes(slotId);
}
