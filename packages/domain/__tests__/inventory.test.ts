import type { ItemStack } from "../src/inventory/inventory.types";
import { emptyInventory } from "../src/inventory/inventory.types";

describe("emptyInventory", () => {
    it("returns an empty bag and equipped map", () => {
        expect(emptyInventory()).toEqual({
            bag: [],
            equipped: {},
        });
    });
});

describe("ItemStack", () => {
    it("allows optional provenance on stacks", () => {
        const manual: ItemStack = { slug: "longsword", quantity: 1 };
        const granted: ItemStack = {
            slug: "scroll-of-fire-bolt",
            quantity: 1,
            provenance: "grant:background:sage:2",
        };

        expect(manual.provenance).toBeUndefined();
        expect(granted.provenance).toBe("grant:background:sage:2");
    });
});
