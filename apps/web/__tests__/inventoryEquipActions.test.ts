import {
    canEquipSlugToSlot,
    isInventorySlugEquippable,
    isSlugEquipped,
} from "../lib/character/inventoryEquipActions";

describe("canEquipSlugToSlot", () => {
    it("allows equipping into an empty slot when slug is not equipped", () => {
        expect(
            canEquipSlugToSlot({}, "melee-main", "srd_longsword")
        ).toBe(true);
        expect(
            canEquipSlugToSlot(
                { breast: "srd_leather-armor" },
                "melee-main",
                "srd_longsword"
            )
        ).toBe(true);
    });

    it("rejects occupied slots", () => {
        expect(
            canEquipSlugToSlot(
                { "melee-main": "srd_longbow" },
                "melee-main",
                "srd_longsword"
            )
        ).toBe(false);
    });

    it("rejects when slug is already equipped elsewhere", () => {
        expect(
            canEquipSlugToSlot(
                { "melee-main": "srd_longsword" },
                "melee-off",
                "srd_longsword"
            )
        ).toBe(false);
    });

    it("rejects blank slugs and empty slot ids", () => {
        expect(canEquipSlugToSlot({}, "melee-main", "   ")).toBe(false);
        expect(canEquipSlugToSlot({}, "", "srd_longsword")).toBe(false);
    });

    it("treats equipped slugs as case-insensitive", () => {
        expect(
            canEquipSlugToSlot(
                { "melee-main": "SRD_Longsword" },
                "melee-off",
                "srd_longsword"
            )
        ).toBe(false);
    });

    it("rejects legacy usable multi slot under equip policy", () => {
        expect(
            canEquipSlugToSlot(
                { "melee-main": "srd_longsword" },
                "usable",
                "rpv_amulet-of-vitality",
                { usable: ["srd_potion-of-healing"] }
            )
        ).toBe(false);
    });

    it("rejects policy-invalid slot for wieldable item", () => {
        expect(canEquipSlugToSlot({}, "ring", "srd_longsword")).toBe(false);
    });

    it("rejects carried items in any slot", () => {
        expect(canEquipSlugToSlot({}, "melee-main", "srd_waterskin")).toBe(
            false
        );
    });

    it("allows cosmetic items in cosmetic multi slot", () => {
        expect(
            canEquipSlugToSlot({}, "cosmetic", "srd_clothes-travelers")
        ).toBe(true);
    });

    it("rejects a slug already present in equippedMulti", () => {
        expect(
            canEquipSlugToSlot(
                {},
                "cosmetic",
                "srd_clothes-travelers",
                { cosmetic: ["srd_clothes-travelers"] }
            )
        ).toBe(false);
    });

    it("rejects adding a multi-slot slug that already occupies a single slot", () => {
        expect(
            canEquipSlugToSlot(
                { amulet: "rpv_amulet-of-vitality" },
                "cosmetic",
                "rpv_amulet-of-vitality"
            )
        ).toBe(false);
    });
});

describe("isInventorySlugEquippable", () => {
    it("is false for carried adventuring gear", () => {
        expect(isInventorySlugEquippable("srd_waterskin")).toBe(false);
        expect(isInventorySlugEquippable("rpv_pilot-test-pack-a")).toBe(false);
    });

    it("is true for weapons and granted wondrous items", () => {
        expect(isInventorySlugEquippable("srd_longsword")).toBe(true);
        expect(isInventorySlugEquippable("rpv_amulet-of-vitality")).toBe(true);
    });
});

describe("isSlugEquipped", () => {
    it("detects equipped slugs case-insensitively", () => {
        expect(
            isSlugEquipped({ amulet: "rpv_amulet-of-vitality" }, "rpv_amulet-of-vitality")
        ).toBe(true);
        expect(
            isSlugEquipped({ amulet: "rpv_amulet-of-vitality" }, "srd_longsword")
        ).toBe(false);
    });

    it("detects slugs in equippedMulti and rejects blanks", () => {
        expect(
            isSlugEquipped(
                {},
                "rpv_amulet-of-vitality",
                { cosmetic: ["RPV_Amulet-of-Vitality"] }
            )
        ).toBe(true);
        expect(
            isSlugEquipped({}, "srd_longsword", { cosmetic: ["rpv_amulet-of-vitality"] })
        ).toBe(false);
        expect(isSlugEquipped({ amulet: "rpv_amulet-of-vitality" }, "  ")).toBe(
            false
        );
    });
});
