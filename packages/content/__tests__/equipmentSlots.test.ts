import {
    getEquipmentSlots,
    getEquipmentSlotsByGroup,
    isMultiEquipmentSlot,
    isValidEquipmentSlot,
} from "../src";

describe("equipmentSlots.dnd", () => {
    it("lists BG3-style dnd slots", () => {
        expect(getEquipmentSlots("dnd").map((slot) => slot.id)).toEqual([
            "helmet",
            "cloak",
            "breast",
            "gloves",
            "boots",
            "amulet",
            "ring",
            "ring-2",
            "melee-main",
            "melee-off",
            "ranged-main",
            "ranged-off",
            "usable",
            "cosmetic",
        ]);
    });

    it("returns empty list for unknown system", () => {
        expect(getEquipmentSlots("pf2e" as "dnd")).toEqual([]);
    });

    it("validates known slot ids", () => {
        expect(isValidEquipmentSlot("melee-main")).toBe(true);
        expect(isValidEquipmentSlot("cosmetic")).toBe(true);
        expect(isValidEquipmentSlot("main-hand")).toBe(false);
        expect(isValidEquipmentSlot("armor")).toBe(false);
    });

    it("partitions slots by group and marks cosmetic as multi", () => {
        expect(
            getEquipmentSlotsByGroup("dnd", "wearable").map((slot) => slot.id)
        ).toEqual([
            "helmet",
            "cloak",
            "breast",
            "gloves",
            "boots",
            "amulet",
            "ring",
            "ring-2",
        ]);
        expect(
            getEquipmentSlotsByGroup("dnd", "usable").map((slot) => slot.id)
        ).toEqual([
            "melee-main",
            "melee-off",
            "ranged-main",
            "ranged-off",
            "usable",
        ]);
        expect(
            getEquipmentSlotsByGroup("dnd", "cosmetic").map((slot) => slot.id)
        ).toEqual(["cosmetic"]);
        expect(isMultiEquipmentSlot("cosmetic")).toBe(true);
        expect(isMultiEquipmentSlot("usable")).toBe(true);
        expect(isMultiEquipmentSlot("breast")).toBe(false);
        expect(isMultiEquipmentSlot("melee-main")).toBe(false);
    });
});
