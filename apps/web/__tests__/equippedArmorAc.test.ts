import { emptyInventory } from "@rpv/domain";
import { computeEquippedArmorClass } from "../lib/character/equippedArmorAc";

describe("computeEquippedArmorClass", () => {
    it("uses unarmored 10 + Dex when nothing is equipped", () => {
        // DEX 14 → +2
        expect(computeEquippedArmorClass(emptyInventory(), 14, "dnd")).toBe(12);
    });

    it("uses leather armor formula 11 + Dex", () => {
        const inventory = {
            bag: [],
            equipped: { armor: "srd_leather-armor" },
        };
        expect(computeEquippedArmorClass(inventory, 14, "dnd")).toBe(13);
    });

    it("adds shield +2 on top of leather", () => {
        const inventory = {
            bag: [],
            equipped: {
                armor: "srd_leather-armor",
                "off-hand": "srd_shield",
            },
        };
        expect(computeEquippedArmorClass(inventory, 14, "dnd")).toBe(15);
    });

    it("caps medium armor Dex when applicable", () => {
        const inventory = {
            bag: [],
            equipped: { armor: "srd_scale-mail" },
        };
        // DEX 18 → +4 but scale mail caps at 2 → 14+2=16
        expect(computeEquippedArmorClass(inventory, 18, "dnd")).toBe(16);
    });
});
