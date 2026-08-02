import {
    canEquipSlugToSlot,
    isSlugEquipped,
} from "../lib/character/inventoryEquipActions";

describe("canEquipSlugToSlot", () => {
    it("allows equipping into an empty slot when slug is not equipped", () => {
        expect(
            canEquipSlugToSlot({}, "main-hand", "srd_longsword")
        ).toBe(true);
        expect(
            canEquipSlugToSlot(
                { armor: "srd_leather-armor" },
                "main-hand",
                "srd_longsword"
            )
        ).toBe(true);
    });

    it("rejects occupied slots", () => {
        expect(
            canEquipSlugToSlot(
                { "main-hand": "srd_longbow" },
                "main-hand",
                "srd_longsword"
            )
        ).toBe(false);
    });

    it("rejects when slug is already equipped elsewhere", () => {
        expect(
            canEquipSlugToSlot(
                { "main-hand": "srd_longsword" },
                "off-hand",
                "srd_longsword"
            )
        ).toBe(false);
    });
});

describe("isSlugEquipped", () => {
    it("detects equipped slugs case-insensitively", () => {
        expect(
            isSlugEquipped({ neck: "rpv_amulet-of-vitality" }, "rpv_amulet-of-vitality")
        ).toBe(true);
        expect(
            isSlugEquipped({ neck: "rpv_amulet-of-vitality" }, "srd_longsword")
        ).toBe(false);
    });
});
