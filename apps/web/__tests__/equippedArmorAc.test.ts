import { emptyInventory } from "@rpv/domain";
import { getItem } from "@rpv/content";
import {
    computeEquippedArmorClass,
    itemProvidesBodyArmor,
} from "../lib/character/equippedArmorAc";

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

    it("reads body armor from the breast slot before the armor slot", () => {
        const inventory = {
            bag: [],
            equipped: {
                breast: "srd_leather-armor",
                armor: "srd_scale-mail",
            },
        };
        // Leather 11 + Dex 2, ignoring scale mail in the legacy slot
        expect(computeEquippedArmorClass(inventory, 14, "dnd")).toBe(13);
    });

    it("adds a shield onto unarmored 10 + Dex", () => {
        const inventory = {
            bag: [],
            equipped: { "off-hand": "srd_shield" },
        };
        expect(computeEquippedArmorClass(inventory, 14, "dnd")).toBe(14);
    });
});

describe("itemProvidesBodyArmor", () => {
    it("accepts body armor and rejects shields or missing items", () => {
        expect(itemProvidesBodyArmor(getItem("srd_leather-armor", "dnd"))).toBe(
            true
        );
        expect(itemProvidesBodyArmor(getItem("srd_shield", "dnd"))).toBe(false);
        expect(itemProvidesBodyArmor(undefined)).toBe(false);
    });
});
