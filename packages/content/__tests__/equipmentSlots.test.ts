import {
    getEquipmentSlots,
    getEquipmentSlotsByGroup,
    isValidEquipmentSlot,
} from "../src";

describe("equipmentSlots.dnd", () => {
    it("lists pilot dnd slots", () => {
        expect(getEquipmentSlots("dnd").map((slot) => slot.id)).toEqual([
            "armor",
            "main-hand",
            "off-hand",
            "neck",
            "ring",
            "usable",
        ]);
    });

    it("returns empty list for unknown system", () => {
        expect(getEquipmentSlots("pf2e" as "dnd")).toEqual([]);
    });

    it("validates known slot ids", () => {
        expect(isValidEquipmentSlot("main-hand")).toBe(true);
        expect(isValidEquipmentSlot("usable")).toBe(true);
        expect(isValidEquipmentSlot("hand")).toBe(false);
    });

    it("partitions slots by wearable and usable groups", () => {
        expect(
            getEquipmentSlotsByGroup("dnd", "wearable").map((slot) => slot.id)
        ).toEqual(["armor", "neck", "ring"]);
        expect(
            getEquipmentSlotsByGroup("dnd", "usable").map((slot) => slot.id)
        ).toEqual(["main-hand", "off-hand", "usable"]);
    });
});
