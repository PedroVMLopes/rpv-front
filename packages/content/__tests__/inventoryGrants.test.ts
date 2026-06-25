import {
    buildInventoryItemChoiceKey,
    collectInventoryItemChoiceGrants,
    extractInventoryItemGrants,
    flattenGrantOptionToEntries,
    inventoryGrantProvenance,
    isValidInventoryItemPick,
    resolveInventoryItemGrants,
    resolveInventoryItemPick,
} from "../src/grant/inventoryGrants";
import { fixedGrantsToCharacterGrants } from "../src/grant/grants";
import type { Grant } from "../src/grant/grant.types";

describe("extractInventoryItemGrants", () => {
    it("extracts fixed inventory_item grants with ref and amount", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "scroll-of-fire-bolt",
                amount: 2,
            },
        ];

        expect(extractInventoryItemGrants(grants)).toEqual([
            { slug: "scroll-of-fire-bolt", quantity: 2, grantIndex: 0 },
        ]);
    });

    it("defaults quantity to 1 when amount is omitted", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "amulet-of-vitality",
            },
        ];

        expect(extractInventoryItemGrants(grants)).toEqual([
            { slug: "amulet-of-vitality", quantity: 1, grantIndex: 0 },
        ]);
    });

    it("ignores inventory_item grants with choose greater than 0", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 1,
                options: [{ optionType: "item", ref: "longsword" }],
            },
        ];

        expect(extractInventoryItemGrants(grants)).toEqual([]);
    });

    it("ignores non-inventory grants", () => {
        const grants: Grant[] = [
            {
                grantType: "language",
                choose: 0,
                options: [{ optionType: "language", ref: "elvish" }],
            },
        ];

        expect(extractInventoryItemGrants(grants)).toEqual([]);
    });
});

describe("inventoryGrantProvenance", () => {
    it("builds a stable provenance key", () => {
        expect(inventoryGrantProvenance("background", "sage", 2)).toBe(
            "grant:background:sage:2"
        );
    });
});

describe("buildInventoryItemChoiceKey", () => {
    it("uses base level segment when feature level is omitted", () => {
        expect(
            buildInventoryItemChoiceKey({
                sourceType: "class",
                sourceId: "fighter",
                grantIndex: 3,
                slot: 0,
            })
        ).toBe("class:fighter:base:inventory_item:3:0");
    });

    it("uses feature level segment when provided", () => {
        expect(
            buildInventoryItemChoiceKey({
                sourceType: "class",
                sourceId: "fighter",
                grantIndex: 1,
                slot: 0,
                featureLevel: 3,
            })
        ).toBe("class:fighter:3:inventory_item:1:0");
    });
});

describe("flattenGrantOptionToEntries", () => {
    it("flattens a single item option", () => {
        expect(
            flattenGrantOptionToEntries({
                optionType: "item",
                ref: "pilot-test-dagger",
            })
        ).toEqual([{ slug: "pilot-test-dagger", quantity: 1 }]);
    });

    it("flattens an inventory bundle option", () => {
        expect(
            flattenGrantOptionToEntries({
                optionType: "inventory_bundle",
                label: "Starter kit",
                items: [
                    { ref: "leather-armor", amount: 1 },
                    { ref: "pilot-test-dagger", amount: 2 },
                ],
            })
        ).toEqual([
            { slug: "leather-armor", quantity: 1 },
            { slug: "pilot-test-dagger", quantity: 2 },
        ]);
    });
});

describe("resolveInventoryItemPick", () => {
    const weaponGrant: Grant = {
        grantType: "inventory_item",
        choose: 1,
        description: "Starting weapon",
        options: [
            { optionType: "item", ref: "pilot-test-dagger" },
            { optionType: "item", ref: "longsword" },
        ],
    };

    it("resolves pick by option index for item options", () => {
        expect(resolveInventoryItemPick(weaponGrant, "0")).toEqual([
            { slug: "pilot-test-dagger", quantity: 1 },
        ]);
        expect(resolveInventoryItemPick(weaponGrant, "1")).toEqual([
            { slug: "longsword", quantity: 1 },
        ]);
    });

    it("returns empty for invalid pick index", () => {
        expect(resolveInventoryItemPick(weaponGrant, "9")).toEqual([]);
        expect(resolveInventoryItemPick(weaponGrant, "")).toEqual([]);
    });
});

describe("isValidInventoryItemPick", () => {
    const weaponGrant: Grant = {
        grantType: "inventory_item",
        choose: 1,
        options: [
            { optionType: "item", ref: "pilot-test-dagger" },
            { optionType: "item", ref: "longsword" },
        ],
    };

    it("validates picks whose item slugs exist in the catalog", () => {
        expect(isValidInventoryItemPick(weaponGrant, "0")).toBe(true);
        expect(isValidInventoryItemPick(weaponGrant, "1")).toBe(true);
        expect(isValidInventoryItemPick(weaponGrant, "9")).toBe(false);
    });
});

describe("resolveInventoryItemGrants", () => {
    const context = {
        sourceType: "class",
        sourceId: "fighter",
    };

    it("resolves fixed and choice grants with provenance", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "shield",
            },
            {
                grantType: "inventory_item",
                choose: 1,
                description: "Starting weapon",
                options: [
                    { optionType: "item", ref: "pilot-test-dagger" },
                    { optionType: "item", ref: "longsword" },
                ],
            },
        ];

        const key = buildInventoryItemChoiceKey({
            sourceType: "class",
            sourceId: "fighter",
            grantIndex: 1,
            slot: 0,
        });

        expect(
            resolveInventoryItemGrants(grants, { [key]: "1" }, context)
        ).toEqual([
            {
                slug: "shield",
                quantity: 1,
                grantIndex: 0,
                provenance: "grant:class:fighter:0",
            },
            {
                slug: "longsword",
                quantity: 1,
                grantIndex: 1,
                provenance: "grant:class:fighter:1",
            },
        ]);
    });

    it("resolves inventory bundle picks into multiple bag entries", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 1,
                description: "Adventuring pack",
                options: [
                    { optionType: "item", ref: "pilot-test-pack-a" },
                    {
                        optionType: "inventory_bundle",
                        label: "Starter kit",
                        items: [
                            { ref: "leather-armor", amount: 1 },
                            { ref: "pilot-test-dagger", amount: 2 },
                        ],
                    },
                ],
            },
        ];

        const key = buildInventoryItemChoiceKey({
            sourceType: "class",
            sourceId: "fighter",
            grantIndex: 0,
            slot: 0,
        });

        expect(
            resolveInventoryItemGrants(grants, { [key]: "1" }, context)
        ).toEqual([
            {
                slug: "leather-armor",
                quantity: 1,
                grantIndex: 0,
                provenance: "grant:class:fighter:0",
            },
            {
                slug: "pilot-test-dagger",
                quantity: 2,
                grantIndex: 0,
                provenance: "grant:class:fighter:0",
            },
        ]);
    });

    it("ignores missing or invalid picks", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 1,
                options: [{ optionType: "item", ref: "longsword" }],
            },
        ];

        expect(resolveInventoryItemGrants(grants, {}, context)).toEqual([]);
    });
});

describe("collectInventoryItemChoiceGrants", () => {
    it("returns one slot per choose count with stable keys", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 2,
                description: "Pick gear",
                options: [
                    { optionType: "item", ref: "pilot-test-dagger" },
                    { optionType: "item", ref: "longsword" },
                ],
            },
        ];

        const choices = collectInventoryItemChoiceGrants(grants, {
            type: "class",
            id: "fighter",
        });

        expect(choices).toHaveLength(2);
        expect(choices[0].key).toBe(
            "class:fighter:base:inventory_item:0:0"
        );
        expect(choices[1].key).toBe(
            "class:fighter:base:inventory_item:0:1"
        );
        expect(choices[0].label).toBe("Pick gear (1/2)");
        expect(choices[1].label).toBe("Pick gear (2/2)");
    });
});

describe("fixedGrantsToCharacterGrants", () => {
    it("ignores inventory_item grants", () => {
        const grants: Grant[] = [
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "scroll-of-fire-bolt",
                amount: 1,
            },
        ];

        expect(
            fixedGrantsToCharacterGrants(grants, { type: "background", id: "sage" })
        ).toEqual([]);
    });
});
