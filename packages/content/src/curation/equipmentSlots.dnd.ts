import type { ItemSystem } from "../item/item.types";

export type EquipmentSlotGroup = "wearable" | "usable";

export type EquipmentSlot = {
    id: string;
    labelKey: string;
    group: EquipmentSlotGroup;
};

export const dndEquipmentSlots: EquipmentSlot[] = [
    { id: "armor", labelKey: "equipmentSlots.armor", group: "wearable" },
    { id: "main-hand", labelKey: "equipmentSlots.mainHand", group: "usable" },
    { id: "off-hand", labelKey: "equipmentSlots.offHand", group: "usable" },
    { id: "neck", labelKey: "equipmentSlots.neck", group: "wearable" },
    { id: "ring", labelKey: "equipmentSlots.ring", group: "wearable" },
    { id: "usable", labelKey: "equipmentSlots.usable", group: "usable" },
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

export function isValidEquipmentSlot(
    slotId: string,
    system: ItemSystem = "dnd"
): boolean {
    return getEquipmentSlots(system).some((slot) => slot.id === slotId);
}
