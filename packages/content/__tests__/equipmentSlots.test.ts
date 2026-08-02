import {
    getEquipmentSlots,
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
        ]);
    });

    it("returns empty list for unknown system", () => {
        expect(getEquipmentSlots("pf2e" as "dnd")).toEqual([]);
    });

    it("validates known slot ids", () => {
        expect(isValidEquipmentSlot("main-hand")).toBe(true);
        expect(isValidEquipmentSlot("hand")).toBe(false);
    });
});
