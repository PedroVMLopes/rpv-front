import {
    canEquipItem,
    getEquipmentSlots,
    isValidEquipmentSlot,
} from "../src/curation/equipmentSlots.dnd";

describe("equipmentSlots", () => {
    it("returns five D&D equipment slots", () => {
        expect(getEquipmentSlots("dnd").map((slot) => slot.id)).toEqual([
            "armor",
            "main-hand",
            "off-hand",
            "neck",
            "ring",
        ]);
    });

    it("returns an empty list for unknown systems", () => {
        expect(getEquipmentSlots("pf2e" as "dnd")).toEqual([]);
    });

    it("validates known slot ids", () => {
        expect(isValidEquipmentSlot("main-hand")).toBe(true);
        expect(isValidEquipmentSlot("hand")).toBe(false);
    });

    it("allows compatible item and slot pairs", () => {
        expect(canEquipItem("longsword", "main-hand")).toBe(true);
        expect(canEquipItem("scroll-of-fire-bolt", "main-hand")).toBe(true);
    });

    it("rejects incompatible item and slot pairs", () => {
        expect(canEquipItem("longsword", "off-hand")).toBe(false);
        expect(canEquipItem("amulet-of-vitality", "ring")).toBe(false);
        expect(canEquipItem("longsword", "hand")).toBe(false);
    });
});
