import { emptyInventory } from "@rpv/domain";
import type { ItemEntry } from "@rpv/content";
import {
    countMiscItems,
    filterInventoryRows,
    formatInventoryItemTitle,
    listEquippedRowsByGroup,
    listInventoryRows,
    resolveItemFilterCategory,
} from "../lib/character/inventoryDisplay";

function stubItem(
    partial: Pick<ItemEntry, "slug" | "name"> &
        Partial<Pick<ItemEntry, "category" | "grants" | "stackable">>
): ItemEntry {
    return {
        system: "dnd",
        description: "",
        category: partial.category ?? { name: "Misc", key: "misc" },
        weapon: null,
        armor: null,
        weight: null,
        weightUnit: null,
        cost: null,
        grants: partial.grants ?? [],
        stackable: partial.stackable ?? true,
        ...partial,
    };
}

describe("listInventoryRows", () => {
    it("maps bag stacks and equipped slots", () => {
        const rows = listInventoryRows(
            {
                bag: [
                    { slug: "srd_arrow-bow", quantity: 5 },
                    { slug: "rpv_pilot-test-pack-a", quantity: 1 },
                ],
                equipped: { "ranged-main": "srd_longbow" },
                equippedMulti: {},
            },
            "dnd"
        );

        expect(rows).toHaveLength(3);
        expect(rows[0]).toMatchObject({
            slug: "srd_arrow-bow",
            quantity: 5,
            equipped: false,
        });
        expect(rows[1]).toMatchObject({
            slug: "rpv_pilot-test-pack-a",
            quantity: 1,
            equipped: false,
        });
        expect(rows[2]).toMatchObject({
            key: "equipped:ranged-main",
            slug: "srd_longbow",
            quantity: 1,
            equipped: true,
            slotId: "ranged-main",
        });
    });

    it("returns empty list for empty inventory", () => {
        expect(listInventoryRows(emptyInventory(), "dnd")).toEqual([]);
    });
});

describe("listEquippedRowsByGroup", () => {
    const inventory = {
        bag: [],
        equipped: {
            breast: "srd_leather-armor",
            amulet: "rpv_amulet-of-vitality",
            "ranged-main": "srd_longbow",
            usable: "rpv_scroll-of-fire-bolt",
            ring: "",
        },
        equippedMulti: {
            cosmetic: ["rpv_pilot-test-pack-a"],
        },
    };

    it("returns filled wearable slots in slot-list order", () => {
        expect(listEquippedRowsByGroup(inventory, "dnd", "wearable")).toEqual([
            {
                key: "equipped:breast",
                slug: "srd_leather-armor",
                quantity: 1,
                equipped: true,
                slotId: "breast",
            },
            {
                key: "equipped:amulet",
                slug: "rpv_amulet-of-vitality",
                quantity: 1,
                equipped: true,
                slotId: "amulet",
            },
        ]);
    });

    it("returns filled usable slots in slot-list order", () => {
        expect(listEquippedRowsByGroup(inventory, "dnd", "usable")).toEqual([
            {
                key: "equipped:ranged-main",
                slug: "srd_longbow",
                quantity: 1,
                equipped: true,
                slotId: "ranged-main",
            },
            {
                key: "equipped:usable",
                slug: "rpv_scroll-of-fire-bolt",
                quantity: 1,
                equipped: true,
                slotId: "usable",
            },
        ]);
    });

    it("returns multi cosmetic rows", () => {
        expect(listEquippedRowsByGroup(inventory, "dnd", "cosmetic")).toEqual([
            {
                key: "equipped-multi:cosmetic:0:rpv_pilot-test-pack-a",
                slug: "rpv_pilot-test-pack-a",
                quantity: 1,
                equipped: true,
                slotId: "cosmetic",
                multiEquipped: true,
            },
        ]);
    });

    it("returns empty when no slots in the group are filled", () => {
        expect(
            listEquippedRowsByGroup(emptyInventory(), "dnd", "wearable")
        ).toEqual([]);
    });
});

describe("countMiscItems", () => {
    it("sums bag quantities for equipment packs and adventuring gear", () => {
        expect(
            countMiscItems(
                [
                    { slug: "srd_arrow-bow", quantity: 5 },
                    { slug: "rpv_pilot-test-pack-a", quantity: 2 },
                ],
                "dnd"
            )
        ).toBe(2);
    });

    it("counts unknown slugs as zero", () => {
        expect(
            countMiscItems(
                [{ slug: "pilot-test-misc-gem", quantity: 3 }],
                "dnd"
            )
        ).toBe(0);
    });
});

describe("resolveItemFilterCategory", () => {
    it("classifies consumables, tools, and misc fallbacks", () => {
        expect(
            resolveItemFilterCategory(
                stubItem({
                    slug: "srd_arrow-bow",
                    name: "Arrow (bow)",
                    category: { name: "Ammunition", key: "ammunition" },
                })
            )
        ).toBe("consumables");

        expect(
            resolveItemFilterCategory(
                stubItem({
                    slug: "smith-tools",
                    name: "Smith's Tools",
                    category: { name: "Tools", key: "tools" },
                })
            )
        ).toBe("tools");

        expect(
            resolveItemFilterCategory(
                stubItem({
                    slug: "rpv_pilot-test-pack-a",
                    name: "Pack",
                    category: { name: "Equipment Pack", key: "equipment-pack" },
                })
            )
        ).toBe("misc");

        expect(resolveItemFilterCategory(undefined)).toBe("misc");
    });
});

describe("filterInventoryRows", () => {
    const rows = listInventoryRows(
        {
            bag: [
                { slug: "srd_arrow-bow", quantity: 10 },
                { slug: "rpv_pilot-test-pack-a", quantity: 1 },
            ],
            equipped: { "ranged-main": "srd_longbow" },
            equippedMulti: {},
        },
        "dnd"
    );

    it("returns all rows for all filter", () => {
        expect(filterInventoryRows(rows, "all", "dnd")).toHaveLength(3);
    });

    it("filters consumables only", () => {
        const filtered = filterInventoryRows(rows, "consumables", "dnd");
        expect(filtered).toHaveLength(1);
        expect(filtered[0]?.slug).toBe("srd_arrow-bow");
    });

    it("filters misc for packs, weapons, and unknown slugs", () => {
        const filtered = filterInventoryRows(rows, "misc", "dnd");
        expect(filtered.map((row) => row.slug).sort()).toEqual(
            ["rpv_pilot-test-pack-a", "srd_longbow"].sort()
        );
    });

    it("returns empty when no rows match", () => {
        expect(filterInventoryRows(rows, "tools", "dnd")).toEqual([]);
        expect(filterInventoryRows(rows, "quest", "dnd")).toEqual([]);
    });
});

describe("formatInventoryItemTitle", () => {
    it("omits suffix for quantity 1", () => {
        expect(formatInventoryItemTitle("Torch", 1)).toBe("Torch");
    });

    it("appends quantity when not 1", () => {
        expect(formatInventoryItemTitle("Piton", 10)).toBe("Piton (10)");
        expect(formatInventoryItemTitle("Torch", 0)).toBe("Torch (0)");
    });
});
