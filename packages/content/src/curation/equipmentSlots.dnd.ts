import type { ItemSystem } from "../item/item.types";

export type EquipmentSlotGroup = "wearable" | "usable" | "cosmetic";

export type EquipmentSlot = {
    id: string;
    labelKey: string;
    group: EquipmentSlotGroup;
    /** When true, slot holds multiple slugs via equippedMulti. */
    multi?: boolean;
};

export const dndEquipmentSlots: EquipmentSlot[] = [
    { id: "helmet", labelKey: "equipmentSlots.helmet", group: "wearable" },
    { id: "cloak", labelKey: "equipmentSlots.cloak", group: "wearable" },
    { id: "breast", labelKey: "equipmentSlots.breast", group: "wearable" },
    { id: "gloves", labelKey: "equipmentSlots.gloves", group: "wearable" },
    { id: "boots", labelKey: "equipmentSlots.boots", group: "wearable" },
    { id: "amulet", labelKey: "equipmentSlots.amulet", group: "wearable" },
    { id: "ring", labelKey: "equipmentSlots.ring", group: "wearable" },
    { id: "ring-2", labelKey: "equipmentSlots.ring2", group: "wearable" },
    { id: "melee-main", labelKey: "equipmentSlots.meleeMain", group: "usable" },
    { id: "melee-off", labelKey: "equipmentSlots.meleeOff", group: "usable" },
    {
        id: "ranged-main",
        labelKey: "equipmentSlots.rangedMain",
        group: "usable",
    },
    {
        id: "ranged-off",
        labelKey: "equipmentSlots.rangedOff",
        group: "usable",
    },
    { id: "usable", labelKey: "equipmentSlots.usable", group: "usable", multi: true },
    {
        id: "cosmetic",
        labelKey: "equipmentSlots.cosmetic",
        group: "cosmetic",
        multi: true,
    },
];

export function getEquipmentSlots(system: ItemSystem = "dnd"): EquipmentSlot[] {
    if (system === "dnd") {
        return dndEquipmentSlots;
    }

    return [];
}

export function getEquipmentSlotsByGroup(
    system: ItemSystem = "dnd",
    group: EquipmentSlotGroup
): EquipmentSlot[] {
    return getEquipmentSlots(system).filter((slot) => slot.group === group);
}

export function getEquipmentSlot(
    slotId: string,
    system: ItemSystem = "dnd"
): EquipmentSlot | undefined {
    return getEquipmentSlots(system).find((slot) => slot.id === slotId);
}

export function isValidEquipmentSlot(
    slotId: string,
    system: ItemSystem = "dnd"
): boolean {
    return getEquipmentSlots(system).some((slot) => slot.id === slotId);
}

export function isMultiEquipmentSlot(
    slotId: string,
    system: ItemSystem = "dnd"
): boolean {
    return getEquipmentSlot(slotId, system)?.multi === true;
}
