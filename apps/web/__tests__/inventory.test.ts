import { emptyInventory } from "@rpv/domain";
import {
    addToBag,
    bagStackReactKey,
    deleteInventoryItem,
    equipItem,
    equippedItemSlugs,
    removeFromBag,
    sanitizeInventory,
    setBagQuantity,
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
        equippedMulti: {},
    };
}

describe("sanitizeInventory", () => {
    it("removes invalid slugs from the bag", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "not-a-real-item", quantity: 2 }],
                equipped: {},
                equippedMulti: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([]);
    });

    it("merges duplicate bag stacks", () => {
        const result = sanitizeInventory(
            {
                bag: [
                    { slug: "rpv_scroll-of-fire-bolt", quantity: 1 },
                    { slug: "rpv_scroll-of-fire-bolt", quantity: 2 },
                ],
                equipped: {},
                equippedMulti: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([
            { slug: "rpv_scroll-of-fire-bolt", quantity: 3 },
        ]);
    });

    it("does not merge stacks with different provenance", () => {
        const result = sanitizeInventory(
            {
                bag: [
                    { slug: "rpv_scroll-of-fire-bolt", quantity: 1 },
                    {
                        slug: "rpv_scroll-of-fire-bolt",
                        quantity: 1,
                        provenance: "grant:background:sage:2",
                    },
                ],
                equipped: {},
                equippedMulti: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([
            { slug: "rpv_scroll-of-fire-bolt", quantity: 1 },
            {
                slug: "rpv_scroll-of-fire-bolt",
                quantity: 1,
                provenance: "grant:background:sage:2",
            },
        ]);
    });

    it("keeps stacks with quantity 0", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "rpv_amulet-of-vitality", quantity: 0 }],
                equipped: {},
                equippedMulti: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([
            { slug: "rpv_amulet-of-vitality", quantity: 0 },
        ]);
    });

    it("removes stacks with negative quantity", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "rpv_amulet-of-vitality", quantity: -1 }],
                equipped: {},
                equippedMulti: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([]);
    });

    it("migrates legacy slot ids to BG3-style ids", () => {
        const result = sanitizeInventory(
            {
                bag: [
                    { slug: "srd_leather-armor", quantity: 1 },
                    { slug: "rpv_amulet-of-vitality", quantity: 1 },
                    { slug: "srd_longbow", quantity: 1 },
                    { slug: "srd_longsword", quantity: 1 },
                ],
                equipped: {
                    armor: "srd_leather-armor",
                    neck: "rpv_amulet-of-vitality",
                    "main-hand": "srd_longbow",
                    "off-hand": "srd_longsword",
                },
            },
            "dnd"
        );

        expect(result.equipped).toEqual({
            breast: "srd_leather-armor",
            amulet: "rpv_amulet-of-vitality",
            "ranged-main": "srd_longbow",
            "melee-off": "srd_longsword",
        });
        expect(result.equippedMulti).toEqual({});
    });

    it("equips multiple cosmetics without feeding equippedItemSlugs", () => {
        let inventory = addToBag(emptyInventory(), "rpv_pilot-test-pack-a", 1);
        inventory = addToBag(inventory, "rpv_scroll-of-fire-bolt", 1);
        inventory = equipItem(inventory, "cosmetic", "rpv_pilot-test-pack-a", "dnd");
        inventory = equipItem(inventory, "cosmetic", "rpv_scroll-of-fire-bolt", "dnd");

        expect(inventory.equippedMulti.cosmetic).toEqual([
            "rpv_pilot-test-pack-a",
            "rpv_scroll-of-fire-bolt",
        ]);
        expect(equippedItemSlugs(inventory)).toEqual([]);
    });

    it("keeps only one equipped slot when the same slug appears twice", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "rpv_ring-of-hardiness", quantity: 2 }],
                equipped: {
                    ring: "rpv_ring-of-hardiness",
                    amulet: "rpv_ring-of-hardiness",
                },
                equippedMulti: {},
            },
            "dnd"
        );

        expect(result.equipped).toEqual({ ring: "rpv_ring-of-hardiness" });
    });

    it("keeps equipped slots when there is no matching bag stock", () => {
        const result = sanitizeInventory(
            inventoryWithEquipped("rpv_amulet-of-vitality", "amulet"),
            "dnd"
        );

        expect(result).toEqual({
            bag: [],
            equipped: { amulet: "rpv_amulet-of-vitality" },
            equippedMulti: {},
        });
    });

    it("decrements bag quantity when an item is equipped with stock", () => {
        const result = sanitizeInventory(
            inventoryWithEquipped("rpv_amulet-of-vitality", "amulet", 1),
            "dnd"
        );

        expect(result).toEqual({
            bag: [],
            equipped: { amulet: "rpv_amulet-of-vitality" },
            equippedMulti: {},
        });
    });

    it("keeps valid bag-only items without grants side effects", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "rpv_scroll-of-fire-bolt", quantity: 1 }],
                equipped: {},
                equippedMulti: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([{ slug: "rpv_scroll-of-fire-bolt", quantity: 1 }]);
        expect(result.equipped).toEqual({});
    });

    it("removes unknown equipment slots", () => {
        const result = sanitizeInventory(
            inventoryWithEquipped("rpv_scroll-of-fire-bolt", "hand"),
            "dnd"
        );

        expect(result.equipped).toEqual({});
    });

    it("keeps any valid item in a valid equipment slot", () => {
        const result = sanitizeInventory(
            inventoryWithEquipped("rpv_ring-of-hardiness", "amulet"),
            "dnd"
        );

        expect(result.equipped).toEqual({ amulet: "rpv_ring-of-hardiness" });
    });

    it("clamps non-stackable bag quantities to 1", () => {
        const result = sanitizeInventory(
            {
                bag: [{ slug: "rpv_amulet-of-vitality", quantity: 3 }],
                equipped: {},
                equippedMulti: {},
            },
            "dnd"
        );

        expect(result.bag).toEqual([{ slug: "rpv_amulet-of-vitality", quantity: 1 }]);
    });
});

describe("equippedItemSlugs", () => {
    it("returns unique equipped slugs", () => {
        expect(
            equippedItemSlugs({
                bag: [],
                equipped: {
                    ring: "rpv_ring-of-hardiness",
                    amulet: "rpv_amulet-of-vitality",
                },
                equippedMulti: {},
            })
        ).toEqual(["rpv_ring-of-hardiness", "rpv_amulet-of-vitality"]);
    });
});

describe("addToBag", () => {
    it("adds a new stack when the slug is not present", () => {
        expect(addToBag(emptyInventory(), "rpv_amulet-of-vitality", 2)).toEqual({
            bag: [{ slug: "rpv_amulet-of-vitality", quantity: 2 }],
            equipped: {},
            equippedMulti: {},
        });
    });

    it("increments an existing stack", () => {
        const inventory = addToBag(emptyInventory(), "rpv_amulet-of-vitality", 1);

        expect(addToBag(inventory, "rpv_amulet-of-vitality", 2)).toEqual({
            bag: [{ slug: "rpv_amulet-of-vitality", quantity: 3 }],
            equipped: {},
            equippedMulti: {},
        });
    });

    it("keeps manual and granted stacks with the same slug separate", () => {
        const manual = addToBag(emptyInventory(), "rpv_scroll-of-fire-bolt", 1);
        const withGranted = addToBag(
            manual,
            "rpv_scroll-of-fire-bolt",
            1,
            "grant:background:sage:2"
        );

        expect(withGranted.bag).toEqual([
            { slug: "rpv_scroll-of-fire-bolt", quantity: 1 },
            {
                slug: "rpv_scroll-of-fire-bolt",
                quantity: 1,
                provenance: "grant:background:sage:2",
            },
        ]);
    });

    it("merges stacks that share slug and provenance", () => {
        const first = addToBag(
            emptyInventory(),
            "rpv_scroll-of-fire-bolt",
            1,
            "grant:background:sage:2"
        );

        expect(
            addToBag(first, "rpv_scroll-of-fire-bolt", 2, "grant:background:sage:2")
        ).toEqual({
            bag: [
                {
                    slug: "rpv_scroll-of-fire-bolt",
                    quantity: 3,
                    provenance: "grant:background:sage:2",
                },
            ],
            equipped: {},
            equippedMulti: {},
        });
    });
});

describe("removeFromBag", () => {
    it("removes quantity from an existing stack", () => {
        const inventory = addToBag(emptyInventory(), "rpv_scroll-of-fire-bolt", 3);

        expect(removeFromBag(inventory, "rpv_scroll-of-fire-bolt", 2)).toEqual({
            bag: [{ slug: "rpv_scroll-of-fire-bolt", quantity: 1 }],
            equipped: {},
            equippedMulti: {},
        });
    });

    it("removes the stack when quantity reaches zero", () => {
        const inventory = addToBag(emptyInventory(), "rpv_scroll-of-fire-bolt", 1);

        expect(removeFromBag(inventory, "rpv_scroll-of-fire-bolt", 1)).toEqual({
            bag: [],
            equipped: {},
            equippedMulti: {},
        });
    });

    it("returns inventory unchanged when quantity is insufficient", () => {
        const inventory = addToBag(emptyInventory(), "rpv_scroll-of-fire-bolt", 1);

        expect(removeFromBag(inventory, "rpv_scroll-of-fire-bolt", 2)).toBe(inventory);
    });
});

describe("equipItem", () => {
    it("moves one item from bag to an empty slot", () => {
        const inventory = addToBag(emptyInventory(), "rpv_amulet-of-vitality", 1);

        expect(equipItem(inventory, "amulet", "rpv_amulet-of-vitality", "dnd")).toEqual({
            bag: [],
            equipped: { amulet: "rpv_amulet-of-vitality" },
            equippedMulti: {},
        });
    });

    it("returns inventory unchanged when bag has no stock", () => {
        const inventory = emptyInventory();

        expect(equipItem(inventory, "amulet", "rpv_amulet-of-vitality", "dnd")).toBe(inventory);
    });

    it("returns inventory unchanged when the slot is occupied", () => {
        const inventory = {
            bag: [{ slug: "rpv_ring-of-hardiness", quantity: 1 }],
            equipped: { amulet: "rpv_amulet-of-vitality" },
            equippedMulti: {},
        };

        expect(equipItem(inventory, "amulet", "rpv_ring-of-hardiness", "dnd")).toBe(inventory);
    });

    it("returns inventory unchanged when the slug is already equipped elsewhere", () => {
        const inventory = {
            bag: [{ slug: "srd_longsword", quantity: 1 }],
            equipped: { "melee-main": "srd_longsword" },
            equippedMulti: {},
        };

        expect(equipItem(inventory, "melee-off", "srd_longsword", "dnd")).toBe(inventory);
    });

    it("allows equipping any item into a valid slot", () => {
        const inventory = addToBag(emptyInventory(), "srd_longsword", 1);

        expect(equipItem(inventory, "ring", "srd_longsword", "dnd")).toEqual({
            bag: [],
            equipped: { ring: "srd_longsword" },
            equippedMulti: {},
        });
    });
});

describe("bagStackReactKey", () => {
    it("uses different keys for manual and granted stacks with the same slug", () => {
        const manual = { slug: "rpv_scroll-of-fire-bolt", quantity: 1 };
        const granted = {
            slug: "rpv_scroll-of-fire-bolt",
            quantity: 1,
            provenance: "grant:background:sage:2",
        };

        expect(bagStackReactKey(manual)).not.toBe(bagStackReactKey(granted));
    });
});

describe("unequipItem", () => {
    it("returns the equipped item to the bag", () => {
        const inventory = {
            bag: [],
            equipped: { amulet: "rpv_amulet-of-vitality" },
            equippedMulti: {},
        };

        expect(unequipItem(inventory, "amulet", "dnd")).toEqual({
            bag: [{ slug: "rpv_amulet-of-vitality", quantity: 1 }],
            equipped: {},
            equippedMulti: {},
        });
    });

    it("returns inventory unchanged when the slot is empty", () => {
        const inventory = emptyInventory();

        expect(unequipItem(inventory, "amulet", "dnd")).toBe(inventory);
    });

    it("restores provenance when unequipping a background-granted item", () => {
        const inventory = {
            bag: [],
            equipped: { "melee-main": "rpv_scroll-of-fire-bolt" },
            equippedMulti: {},
        };

        expect(
            unequipItem(
                inventory,
                "melee-main",
                "dnd",
                "grant:background:sage:2"
            )
        ).toEqual({
            bag: [
                {
                    slug: "rpv_scroll-of-fire-bolt",
                    quantity: 1,
                    provenance: "grant:background:sage:2",
                },
            ],
            equipped: {},
            equippedMulti: {},
        });
    });

    it("can unequip into the bag with quantity 0", () => {
        const inventory = {
            bag: [],
            equipped: { amulet: "rpv_amulet-of-vitality" },
            equippedMulti: {},
        };

        expect(unequipItem(inventory, "amulet", "dnd", undefined, 0)).toEqual({
            bag: [{ slug: "rpv_amulet-of-vitality", quantity: 0 }],
            equipped: {},
            equippedMulti: {},
        });
    });
});

describe("setBagQuantity", () => {
    it("sets absolute quantity and keeps zero stacks", () => {
        const inventory = addToBag(emptyInventory(), "srd_arrow-bow", 5);

        expect(setBagQuantity(inventory, "srd_arrow-bow", 0, "dnd")).toEqual({
            bag: [{ slug: "srd_arrow-bow", quantity: 0 }],
            equipped: {},
            equippedMulti: {},
        });
    });

    it("clamps non-stackable items to 1", () => {
        const inventory = addToBag(emptyInventory(), "rpv_amulet-of-vitality", 1);

        expect(
            setBagQuantity(inventory, "rpv_amulet-of-vitality", 3, "dnd")
        ).toEqual({
            bag: [{ slug: "rpv_amulet-of-vitality", quantity: 1 }],
            equipped: {},
            equippedMulti: {},
        });
    });
});

describe("deleteInventoryItem", () => {
    it("removes a bag stack including quantity 0", () => {
        const inventory = setBagQuantity(
            emptyInventory(),
            "srd_arrow-bow",
            0,
            "dnd"
        );

        expect(deleteInventoryItem(inventory, { slug: "srd_arrow-bow" })).toEqual(
            emptyInventory()
        );
    });

    it("clears an equipped slot without restoring to bag", () => {
        const inventory = {
            bag: [{ slug: "srd_arrow-bow", quantity: 2 }],
            equipped: { amulet: "rpv_amulet-of-vitality" },
            equippedMulti: {},
        };

        expect(
            deleteInventoryItem(inventory, {
                slug: "rpv_amulet-of-vitality",
                slotId: "amulet",
            })
        ).toEqual({
            bag: [{ slug: "srd_arrow-bow", quantity: 2 }],
            equipped: {},
            equippedMulti: {},
        });
    });
});
