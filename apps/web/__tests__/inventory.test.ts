import { emptyInventory } from "@rpv/domain";
import {
    addToBag,
    equipItem,
    equippedItemSlugs,
    removeFromBag,
    sanitizeInventory,
    unequipItem,
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
                    { slug: "scroll-of-fire-bolt", quantity: 1 },
                    { slug: "scroll-of-fire-bolt", quantity: 2 },
                ],
                equipped: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([
            { slug: "scroll-of-fire-bolt", quantity: 3 },
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
                    neck: "ring-of-hardiness",
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

    it("removes unknown equipment slots", () => {
        const result = sanitizeInventory(
            inventoryWithEquipped("scroll-of-fire-bolt", "hand"),
            "dnd"
        );

        expect(result.equipped).toEqual({});
    });

    it("removes items equipped in incompatible slots", () => {
        const result = sanitizeInventory(
            inventoryWithEquipped("ring-of-hardiness", "neck"),
            "dnd"
        );

        expect(result.equipped).toEqual({});
    });

    it("clamps non-stackable bag quantities to 1", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "amulet-of-vitality", quantity: 3 }],
                equipped: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([{ slug: "amulet-of-vitality", quantity: 1 }]);
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

describe("removeFromBag", () => {
    it("removes quantity from an existing stack", () => {
        const inventory = addToBag(emptyInventory(), "scroll-of-fire-bolt", 3);

        expect(removeFromBag(inventory, "scroll-of-fire-bolt", 2)).toEqual({
            bag: [{ slug: "scroll-of-fire-bolt", quantity: 1 }],
            equipped: {},
        });
    });

    it("removes the stack when quantity reaches zero", () => {
        const inventory = addToBag(emptyInventory(), "scroll-of-fire-bolt", 1);

        expect(removeFromBag(inventory, "scroll-of-fire-bolt", 1)).toEqual({
            bag: [],
            equipped: {},
        });
    });

    it("returns inventory unchanged when quantity is insufficient", () => {
        const inventory = addToBag(emptyInventory(), "scroll-of-fire-bolt", 1);

        expect(removeFromBag(inventory, "scroll-of-fire-bolt", 2)).toBe(inventory);
    });
});

describe("equipItem", () => {
    it("moves one item from bag to an empty slot", () => {
        const inventory = addToBag(emptyInventory(), "amulet-of-vitality", 1);

        expect(equipItem(inventory, "neck", "amulet-of-vitality", "dnd")).toEqual({
            bag: [],
            equipped: { neck: "amulet-of-vitality" },
        });
    });

    it("returns inventory unchanged when bag has no stock", () => {
        const inventory = emptyInventory();

        expect(equipItem(inventory, "neck", "amulet-of-vitality", "dnd")).toBe(inventory);
    });

    it("returns inventory unchanged when the slot is occupied", () => {
        const inventory = {
            bag: [{ slug: "ring-of-hardiness", quantity: 1 }],
            equipped: { neck: "amulet-of-vitality" },
        };

        expect(equipItem(inventory, "neck", "ring-of-hardiness", "dnd")).toBe(inventory);
    });

    it("returns inventory unchanged when the slug is already equipped elsewhere", () => {
        const inventory = {
            bag: [{ slug: "longsword", quantity: 1 }],
            equipped: { "main-hand": "longsword" },
        };

        expect(equipItem(inventory, "off-hand", "longsword", "dnd")).toBe(inventory);
    });

    it("returns inventory unchanged for incompatible slot and item pairs", () => {
        const inventory = addToBag(emptyInventory(), "longsword", 1);

        expect(equipItem(inventory, "ring", "longsword", "dnd")).toBe(inventory);
    });
});

describe("unequipItem", () => {
    it("returns the equipped item to the bag", () => {
        const inventory = {
            bag: [],
            equipped: { neck: "amulet-of-vitality" },
        };

        expect(unequipItem(inventory, "neck", "dnd")).toEqual({
            bag: [{ slug: "amulet-of-vitality", quantity: 1 }],
            equipped: {},
        });
    });

    it("returns inventory unchanged when the slot is empty", () => {
        const inventory = emptyInventory();

        expect(unequipItem(inventory, "neck", "dnd")).toBe(inventory);
    });
});
