import type { ItemSystem } from "../item/item.types";

export type EquipmentSlot = {
    id: string;
    labelKey: string;
};

export const dndEquipmentSlots: EquipmentSlot[] = [
    { id: "armor", labelKey: "equipmentSlots.armor" },
    { id: "main-hand", labelKey: "equipmentSlots.mainHand" },
    { id: "off-hand", labelKey: "equipmentSlots.offHand" },
    { id: "neck", labelKey: "equipmentSlots.neck" },
    { id: "ring", labelKey: "equipmentSlots.ring" },
];

export function getEquipmentSlots(system: ItemSystem = "dnd"): EquipmentSlot[] {
    if (system === "dnd") {
        return dndEquipmentSlots;
    }

    return [];
}

export function isValidEquipmentSlot(
    slotId: string,
    system: ItemSystem = "dnd"
): boolean {
    return getEquipmentSlots(system).some((slot) => slot.id === slotId);
}
