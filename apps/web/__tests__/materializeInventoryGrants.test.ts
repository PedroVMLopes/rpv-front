import { emptyCharacterSelections } from "../lib/character/storedCharacter";
import {
    materializeInventoryGrants,
    mergeStartingGrants,
    resolveInventoryGrantProvenance,
} from "../lib/character/materializeInventoryGrants";

const fighterEquipmentPicks = {
    "class:fighter:base:exclusive:starting-wealth": "equipment",
};

describe("materializeInventoryGrants", () => {
    it("materializes sage background loot with provenance", () => {
        const bag = materializeInventoryGrants(
            {
                ...emptyCharacterSelections(),
                background: "sage",
            },
            "en",
            "dnd",
            1
        );

        expect(bag).toEqual([
            {
                slug: "rpv_scroll-of-fire-bolt",
                quantity: 1,
                provenance: "grant:background:sage:2",
            },
        ]);
    });

    it("materializes fighter fixed starting weapon", () => {
        const bag = materializeInventoryGrants(
            {
                ...emptyCharacterSelections(),
                characterClass: "fighter",
                choices: {
                    grantPicks: fighterEquipmentPicks,
                },
            },
            "en",
            "dnd",
            1
        );

        expect(bag).toEqual([
            {
                slug: "srd_longsword",
                quantity: 1,
                provenance: "grant:class:fighter:4",
            },
        ]);
    });

    it("materializes fighter sidearm when grant pick is present", () => {
        const bag = materializeInventoryGrants(
            {
                ...emptyCharacterSelections(),
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        ...fighterEquipmentPicks,
                        "class:fighter:base:inventory_item:8:0": "0",
                    },
                },
            },
            "en",
            "dnd",
            1
        );

        expect(bag).toEqual(
            expect.arrayContaining([
                {
                    slug: "srd_longsword",
                    quantity: 1,
                    provenance: "grant:class:fighter:4",
                },
                {
                    slug: "srd_crossbow-light",
                    quantity: 1,
                    provenance: "grant:class:fighter:8",
                },
            ])
        );
    });

    it("returns an empty bag when no grant sources are selected", () => {
        expect(
            materializeInventoryGrants(emptyCharacterSelections(), "en", "dnd", 1)
        ).toEqual([]);
    });

    it("drops class granted items when class changes on merge", () => {
        const merged = mergeStartingGrants(
            {
                ...emptyCharacterSelections(),
                characterClass: "wizard",
                inventory: {
                    bag: [
                        {
                            slug: "srd_longsword",
                            quantity: 1,
                            provenance: "grant:class:fighter:4",
                        },
                    ],
                    equipped: {},
                },
            },
            "en",
            "dnd",
            1
        );

        expect(merged.inventory?.bag).toEqual([]);
    });
});

describe("resolveInventoryGrantProvenance", () => {
    it("resolves provenance for class-granted items", () => {
        expect(
            resolveInventoryGrantProvenance(
                {
                    ...emptyCharacterSelections(),
                    characterClass: "fighter",
                    choices: {
                        grantPicks: fighterEquipmentPicks,
                    },
                },
                "srd_longsword",
                "en",
                "dnd",
                1
            )
        ).toBe("grant:class:fighter:4");
    });
});

describe("mergeStartingGrants", () => {
    it("preserves manual stacks and keeps edited granted quantities", () => {
        const merged = mergeStartingGrants(
            {
                ...emptyCharacterSelections(),
                background: "sage",
                inventory: {
                    bag: [
                        { slug: "rpv_amulet-of-vitality", quantity: 1 },
                        {
                            slug: "rpv_scroll-of-fire-bolt",
                            quantity: 9,
                            provenance: "grant:background:sage:2",
                        },
                    ],
                    equipped: {},
                },
            },
            "en",
            "dnd",
            1
        );

        expect(merged.inventory?.bag).toEqual([
            { slug: "rpv_amulet-of-vitality", quantity: 1 },
            {
                slug: "rpv_scroll-of-fire-bolt",
                quantity: 9,
                provenance: "grant:background:sage:2",
            },
        ]);
        expect(merged.grantedCurrency).toEqual({ gold: 15 });
    });

    it("preserves owned totals across rematerialize when a granted item is equipped", () => {
        const merged = mergeStartingGrants(
            {
                ...emptyCharacterSelections(),
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        ...fighterEquipmentPicks,
                        "class:fighter:base:inventory_item:5:0": "0",
                        "class:fighter:base:inventory_item:6:0": "0",
                        "class:fighter:base:inventory_item:7:0": "0",
                        "class:fighter:base:inventory_item:8:0": "0",
                    },
                },
                inventory: {
                    bag: [
                        {
                            slug: "srd_piton",
                            quantity: 9,
                            provenance: "grant:class:fighter:7",
                        },
                    ],
                    equipped: {},
                    equippedMulti: { usable: ["srd_piton"] },
                },
            },
            "en",
            "dnd",
            1
        );

        expect(
            merged.inventory?.bag.find((stack) => stack.slug === "srd_piton")
        ).toEqual({
            slug: "srd_piton",
            quantity: 9,
            provenance: "grant:class:fighter:7",
        });
        expect(merged.inventory?.equippedMulti?.usable).toEqual(["srd_piton"]);
    });

    it("drops manual bag copies when the same slug is still granted", () => {
        const merged = mergeStartingGrants(
            {
                ...emptyCharacterSelections(),
                background: "sage",
                characterClass: "fighter",
                choices: {
                    grantPicks: fighterEquipmentPicks,
                },
                inventory: {
                    bag: [
                        { slug: "rpv_scroll-of-fire-bolt", quantity: 1 },
                        { slug: "srd_longsword", quantity: 1 },
                    ],
                    equipped: {},
                },
            },
            "en",
            "dnd",
            1
        );

        expect(merged.inventory?.bag).toEqual([
            {
                slug: "rpv_scroll-of-fire-bolt",
                quantity: 1,
                provenance: "grant:background:sage:2",
            },
            {
                slug: "srd_longsword",
                quantity: 1,
                provenance: "grant:class:fighter:4",
            },
        ]);
    });

    it("removes equipped slug from bag after materializing granted stacks", () => {
        const merged = mergeStartingGrants(
            {
                ...emptyCharacterSelections(),
                background: "sage",
                characterClass: "fighter",
                choices: {
                    grantPicks: fighterEquipmentPicks,
                },
                inventory: {
                    bag: [],
                    equipped: { "melee-main": "rpv_scroll-of-fire-bolt" },
                },
            },
            "en",
            "dnd",
            1
        );

        expect(merged.inventory?.equipped).toEqual({
            "melee-main": "rpv_scroll-of-fire-bolt",
        });
        expect(
            merged.inventory?.bag.filter(
                (stack) => stack.slug === "rpv_scroll-of-fire-bolt"
            )
        ).toEqual([]);
        expect(merged.inventory?.bag).toEqual(
            expect.arrayContaining([
                {
                    slug: "srd_longsword",
                    quantity: 1,
                    provenance: "grant:class:fighter:4",
                },
            ])
        );
    });
});
