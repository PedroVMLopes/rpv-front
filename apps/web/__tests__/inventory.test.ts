import { emptyInventory } from "@rpv/domain";
import {
    addToBag,
    equippedItemSlugs,
    sanitizeInventory,
} from "../lib/character/inventory";

function inventoryWithEquipped(
    slug: string,
    slot = "ring",
    bagQty = 0
) {
    return {
        bag: bagQty > 0 ? [{ slug, quantity: bagQty }] : [],
        equipped: { [slot]: slug },
    };
}

describe("sanitizeInventory", () => {
    it("removes invalid slugs from the bag", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "not-a-real-item", quantity: 2 }],
                equipped: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([]);
    });

    it("merges duplicate bag stacks", () => {
        const result = sanitizeInventory(
            {
                bag: [
                    { slug: "amulet-of-vitality", quantity: 1 },
                    { slug: "amulet-of-vitality", quantity: 2 },
                ],
                equipped: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([
            { slug: "amulet-of-vitality", quantity: 3 },
        ]);
    });

    it("removes stacks with quantity below 1", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "amulet-of-vitality", quantity: 0 }],
                equipped: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([]);
    });

    it("keeps only one equipped slot when the same slug appears twice", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "ring-of-hardiness", quantity: 2 }],
                equipped: {
                    ring: "ring-of-hardiness",
                    "ring-2": "ring-of-hardiness",
                },
            },
            "dnd"
        );

        expect(result.equipped).toEqual({ ring: "ring-of-hardiness" });
    });

    it("keeps equipped slots when there is no matching bag stock", () => {
        const result = sanitizeInventory(
            inventoryWithEquipped("amulet-of-vitality", "neck"),
            "dnd"
        );

        expect(result).toEqual({
            bag: [],
            equipped: { neck: "amulet-of-vitality" },
        });
    });

    it("decrements bag quantity when an item is equipped with stock", () => {
        const result = sanitizeInventory(
            inventoryWithEquipped("amulet-of-vitality", "neck", 1),
            "dnd"
        );

        expect(result).toEqual({
            bag: [],
            equipped: { neck: "amulet-of-vitality" },
        });
    });

    it("keeps valid bag-only items without grants side effects", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "scroll-of-fire-bolt", quantity: 1 }],
                equipped: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([{ slug: "scroll-of-fire-bolt", quantity: 1 }]);
        expect(result.equipped).toEqual({});
    });
});

describe("equippedItemSlugs", () => {
    it("returns unique equipped slugs", () => {
        expect(
            equippedItemSlugs({
                bag: [],
                equipped: {
                    ring: "ring-of-hardiness",
                    neck: "amulet-of-vitality",
                },
            })
        ).toEqual(["ring-of-hardiness", "amulet-of-vitality"]);
    });
});

describe("addToBag", () => {
    it("adds a new stack when the slug is not present", () => {
        expect(addToBag(emptyInventory(), "amulet-of-vitality", 2)).toEqual({
            bag: [{ slug: "amulet-of-vitality", quantity: 2 }],
            equipped: {},
        });
    });

    it("increments an existing stack", () => {
        const inventory = addToBag(emptyInventory(), "amulet-of-vitality", 1);

        expect(addToBag(inventory, "amulet-of-vitality", 2)).toEqual({
            bag: [{ slug: "amulet-of-vitality", quantity: 3 }],
            equipped: {},
        });
    });
});
