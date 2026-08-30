import { emptyInventory } from "@rpv/domain";
import type { ItemEntry } from "@rpv/content";
import {
    countMiscItems,
    filterInventoryRows,
    formatInventoryItemTitle,
    listBagDisplayRows,
    listCarriedRows,
    listCosmeticEquippedRows,
    listEquippedRowsByGroup,
    listInventoryRows,
    listMechanicalEquippedRows,
    listStowedEquippableRows,
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

const bagAndEquippedInventory = {
    bag: [
        { slug: "srd_arrow-bow", quantity: 5 },
        { slug: "rpv_pilot-test-pack-a", quantity: 1 },
        { slug: "rpv_amulet-of-vitality", quantity: 1 },
    ],
    equipped: { "ranged-main": "srd_longbow" },
    equippedMulti: {},
};

describe("listCarriedRows", () => {
    it("lists only carried-policy bag stacks", () => {
        const rows = listCarriedRows(bagAndEquippedInventory, "dnd");

        expect(rows.map((row) => row.slug).sort()).toEqual(
            ["rpv_pilot-test-pack-a", "srd_arrow-bow"].sort()
        );
        expect(rows.every((row) => row.displayKind === "carried")).toBe(true);
    });

    it("returns empty for empty inventory", () => {
        expect(listCarriedRows(emptyInventory(), "dnd")).toEqual([]);
    });
});

describe("listStowedEquippableRows", () => {
    it("lists equippable bag stacks not occupying a slot", () => {
        const rows = listStowedEquippableRows(bagAndEquippedInventory, "dnd");

        expect(rows).toEqual([
            expect.objectContaining({
                slug: "rpv_amulet-of-vitality",
                quantity: 1,
                displayKind: "stowed",
            }),
        ]);
    });
});

describe("listBagDisplayRows", () => {
    it("merges carried and stowed without equipped rows", () => {
        const rows = listBagDisplayRows(bagAndEquippedInventory, "dnd");

        expect(rows).toHaveLength(3);
        expect(rows.some((row) => row.slug === "srd_longbow")).toBe(false);
        expect(rows.some((row) => row.equipped)).toBe(false);
    });

    it("omits bag remainder when the same slug is equipped", () => {
        const rows = listBagDisplayRows(
            {
                bag: [
                    { slug: "srd_torch", quantity: 9 },
                    { slug: "srd_arrow-bow", quantity: 20 },
                ],
                equipped: {},
                equippedMulti: { usable: ["srd_torch"] },
            },
            "dnd"
        );

        expect(rows.filter((row) => row.slug === "srd_torch")).toEqual([]);
        expect(rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    slug: "srd_arrow-bow",
                    quantity: 20,
                    displayKind: "carried",
                }),
            ])
        );
    });
});

describe("listInventoryRows", () => {
    it("is an alias of listBagDisplayRows", () => {
        expect(listInventoryRows(bagAndEquippedInventory, "dnd")).toEqual(
            listBagDisplayRows(bagAndEquippedInventory, "dnd")
        );
    });
});

describe("listEquippedRowsByGroup", () => {
    const inventory = {
        bag: [],
        equipped: {
            breast: "srd_leather-armor",
            amulet: "rpv_amulet-of-vitality",
            "ranged-main": "srd_longbow",
            ring: "",
        },
        equippedMulti: {
            usable: ["rpv_scroll-of-fire-bolt"],
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
                displayKind: "equipped",
            },
            {
                key: "equipped:amulet",
                slug: "rpv_amulet-of-vitality",
                quantity: 1,
                equipped: true,
                slotId: "amulet",
                displayKind: "equipped",
            },
        ]);
    });

    it("returns hand slots only in usable group (skips legacy multi usable)", () => {
        expect(listEquippedRowsByGroup(inventory, "dnd", "usable")).toEqual([
            {
                key: "equipped:ranged-main",
                slug: "srd_longbow",
                quantity: 1,
                equipped: true,
                slotId: "ranged-main",
                displayKind: "equipped",
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
                displayKind: "cosmetic",
            },
        ]);
    });

    it("returns empty when no slots in the group are filled", () => {
        expect(
            listEquippedRowsByGroup(emptyInventory(), "dnd", "wearable")
        ).toEqual([]);
    });
});

describe("listMechanicalEquippedRows", () => {
    it("combines wearable and usable hand slots without legacy multi usable", () => {
        const rows = listMechanicalEquippedRows(
            {
                bag: [],
                equipped: {
                    breast: "srd_leather-armor",
                    "ranged-main": "srd_longbow",
                },
                equippedMulti: { usable: ["rpv_scroll-of-fire-bolt"] },
            },
            "dnd"
        );

        expect(rows.map((row) => row.slug)).toEqual([
            "srd_leather-armor",
            "srd_longbow",
        ]);
    });
});

describe("listCosmeticEquippedRows", () => {
    it("delegates to the cosmetic equipped group", () => {
        const inventory = {
            bag: [],
            equipped: {},
            equippedMulti: { cosmetic: ["srd_clothes-travelers"] },
        };

        expect(listCosmeticEquippedRows(inventory, "dnd")).toEqual(
            listEquippedRowsByGroup(inventory, "dnd", "cosmetic")
        );
    });
});

describe("countMiscItems", () => {
    it("sums carried possession rows in the misc filter category", () => {
        expect(countMiscItems(bagAndEquippedInventory, "dnd")).toBe(1);
    });

    it("counts unknown slugs as zero", () => {
        expect(
            countMiscItems(
                {
                    bag: [{ slug: "pilot-test-misc-gem", quantity: 3 }],
                    equipped: {},
                    equippedMulti: {},
                },
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
    const rows = listBagDisplayRows(bagAndEquippedInventory, "dnd");

    it("returns all rows for all filter", () => {
        expect(filterInventoryRows(rows, "all", "dnd")).toHaveLength(3);
    });

    it("filters consumables only", () => {
        const filtered = filterInventoryRows(rows, "consumables", "dnd");
        expect(filtered).toHaveLength(1);
        expect(filtered[0]?.slug).toBe("srd_arrow-bow");
    });

    it("filters misc for bag rows without equipped weapons", () => {
        const filtered = filterInventoryRows(rows, "misc", "dnd");
        expect(filtered.map((row) => row.slug).sort()).toEqual(
            ["rpv_amulet-of-vitality", "rpv_pilot-test-pack-a"].sort()
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
