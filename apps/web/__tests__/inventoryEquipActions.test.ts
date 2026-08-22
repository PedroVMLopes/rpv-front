import {
    canEquipSlugToSlot,
    isSlugEquipped,
} from "../lib/character/inventoryEquipActions";

describe("canEquipSlugToSlot", () => {
    it("allows equipping into an empty slot when slug is not equipped", () => {
        expect(
            canEquipSlugToSlot({}, "melee-main", "srd_longsword")
        ).toBe(true);
        expect(
            canEquipSlugToSlot(
                { armor: "srd_leather-armor" },
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

    it("allows a new slug on a multi slot even when that slot already has items", () => {
        expect(
            canEquipSlugToSlot(
                { "melee-main": "srd_longsword" },
                "usable",
                "rpv_amulet-of-vitality",
                { usable: ["srd_potion-of-healing"] }
            )
        ).toBe(true);
    });

    it("rejects a slug already present in equippedMulti", () => {
        expect(
            canEquipSlugToSlot(
                {},
                "usable",
                "rpv_amulet-of-vitality",
                { usable: ["RPV_Amulet-of-Vitality"] }
            )
        ).toBe(false);
        expect(
            canEquipSlugToSlot(
                {},
                "cosmetic",
                "srd_cloak-of-protection",
                { cosmetic: ["srd_cloak-of-protection"] }
            )
        ).toBe(false);
    });

    it("rejects adding a multi-slot slug that already occupies a single slot", () => {
        expect(
            canEquipSlugToSlot(
                { amulet: "rpv_amulet-of-vitality" },
                "usable",
                "rpv_amulet-of-vitality"
            )
        ).toBe(false);
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
                { usable: ["RPV_Amulet-of-Vitality"] }
            )
        ).toBe(true);
        expect(
            isSlugEquipped({}, "srd_longsword", { usable: ["rpv_amulet-of-vitality"] })
        ).toBe(false);
        expect(isSlugEquipped({ amulet: "rpv_amulet-of-vitality" }, "  ")).toBe(
            false
        );
    });
});
