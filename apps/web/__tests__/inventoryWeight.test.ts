import { emptyInventory } from "@rpv/domain";
import {
    formatCarriedWeight,
    sumInventoryWeight,
    deriveCarryingCapacity,
} from "../lib/character/inventoryWeight";

describe("inventory weight", () => {
    it("sums bag remainder and equipped item weights", () => {
        expect(
            sumInventoryWeight(
                {
                    bag: [
                        { slug: "srd_arrow-bow", quantity: 10 },
                        { slug: "rpv_pilot-test-pack-a", quantity: 1 },
                    ],
                    equipped: { "ranged-main": "srd_longbow" },
                    equippedMulti: {},
                },
                "dnd"
            )
        ).toBe(2.5);
    });

    it("uses Strength × 15 as D&D carrying capacity", () => {
        expect(deriveCarryingCapacity(14, "dnd")).toBe(210);
        expect(formatCarriedWeight(2.5)).toBe("2.5");
        expect(formatCarriedWeight(210)).toBe("210");
    });

    it("returns 0 for an empty inventory", () => {
        expect(sumInventoryWeight(emptyInventory(), "dnd")).toBe(0);
    });
});
