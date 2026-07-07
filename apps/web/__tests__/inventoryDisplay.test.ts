import { emptyInventory } from "@rpv/domain";
import {
    countMiscItems,
    filterInventoryRows,
    listInventoryRows,
    resolveItemFilterCategory,
} from "../lib/character/inventoryDisplay";

describe("listInventoryRows", () => {
    it("maps bag stacks and equipped slots", () => {
        const rows = listInventoryRows(
            {
                bag: [
                    { slug: "arrows", quantity: 5 },
                    { slug: "dungeoneers-pack", quantity: 1 },
                ],
                equipped: { "main-hand": "longbow" },
            },
            "dnd"
        );

        expect(rows).toHaveLength(3);
        expect(rows[0]).toMatchObject({
            slug: "arrows",
            quantity: 5,
            equipped: false,
        });
        expect(rows[1]).toMatchObject({
            slug: "dungeoneers-pack",
            quantity: 1,
            equipped: false,
        });
        expect(rows[2]).toMatchObject({
            key: "equipped:main-hand",
            slug: "longbow",
            quantity: 1,
            equipped: true,
            slotId: "main-hand",
        });
    });

    it("returns empty list for empty inventory", () => {
        expect(listInventoryRows(emptyInventory(), "dnd")).toEqual([]);
    });
});

describe("countMiscItems", () => {
    it("sums bag quantities for misc category or tag only", () => {
        expect(
            countMiscItems(
                [
                    { slug: "arrows", quantity: 5 },
                    { slug: "dungeoneers-pack", quantity: 2 },
                ],
                "dnd"
            )
        ).toBe(0);
    });

    it("counts stacks tagged misc", () => {
        expect(
            countMiscItems(
                [{ slug: "pilot-test-misc-gem", quantity: 3 }],
                "dnd"
            )
        ).toBe(0);
    });
});

describe("resolveItemFilterCategory", () => {
    it("classifies consumables, tools, quest, and misc fallbacks", () => {
        expect(
            resolveItemFilterCategory({
                slug: "arrows",
                system: "dnd",
                name: "Arrows",
                description: "",
                category: "consumable",
                grants: [],
            })
        ).toBe("consumables");

        expect(
            resolveItemFilterCategory({
                slug: "smith-tools",
                system: "dnd",
                name: "Smith's Tools",
                description: "",
                category: "tool",
                grants: [],
            })
        ).toBe("tools");

        expect(
            resolveItemFilterCategory({
                slug: "quest-key",
                system: "dnd",
                name: "Quest Key",
                description: "",
                tags: ["quest"],
                grants: [],
            })
        ).toBe("quest");

        expect(
            resolveItemFilterCategory({
                slug: "dungeoneers-pack",
                system: "dnd",
                name: "Pack",
                description: "",
                category: "pack",
                grants: [],
            })
        ).toBe("misc");

        expect(resolveItemFilterCategory(undefined)).toBe("misc");
    });
});

describe("filterInventoryRows", () => {
    const rows = listInventoryRows(
        {
            bag: [
                { slug: "arrows", quantity: 10 },
                { slug: "dungeoneers-pack", quantity: 1 },
            ],
            equipped: { "main-hand": "longbow" },
        },
        "dnd"
    );

    it("returns all rows for all filter", () => {
        expect(filterInventoryRows(rows, "all", "dnd")).toHaveLength(3);
    });

    it("filters consumables only", () => {
        const filtered = filterInventoryRows(rows, "consumables", "dnd");
        expect(filtered).toHaveLength(1);
        expect(filtered[0]?.slug).toBe("arrows");
    });

    it("filters misc for packs, weapons, and unknown slugs", () => {
        const filtered = filterInventoryRows(rows, "misc", "dnd");
        expect(filtered.map((row) => row.slug).sort()).toEqual(
            ["dungeoneers-pack", "longbow"].sort()
        );
    });

    it("returns empty when no rows match", () => {
        expect(filterInventoryRows(rows, "tools", "dnd")).toEqual([]);
        expect(filterInventoryRows(rows, "quest", "dnd")).toEqual([]);
    });
});
