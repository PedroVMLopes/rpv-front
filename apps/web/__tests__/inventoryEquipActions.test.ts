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
});
