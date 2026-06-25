import { emptyInventory } from "@rpv/domain";
import { sanitizeStartingMaterialization } from "../lib/character/sanitizeStartingMaterialization";
import { emptyCharacterSelections } from "../lib/character/storedCharacter";

const fighterEquipmentPicks = {
    "class:fighter:base:exclusive:starting-wealth": "equipment",
    "class:fighter:base:inventory_item:5:0": "0",
    "class:fighter:base:inventory_item:6:0": "0",
    "class:fighter:base:inventory_item:7:0": "0",
    "class:fighter:base:inventory_item:8:0": "0",
};

describe("sanitizeStartingMaterialization", () => {
    it("removes equipment-branch inventory picks and granted bag when switching to gold", () => {
        const result = sanitizeStartingMaterialization(
            {
                ...emptyCharacterSelections(),
                characterClass: "fighter",
                inventory: {
                    bag: [
                        {
                            slug: "longsword",
                            quantity: 1,
                            provenance: "grant:class:fighter:4",
                        },
                        { slug: "amulet-of-vitality", quantity: 1 },
                    ],
                    equipped: { "main-hand": "longsword" },
                },
                choices: {
                    grantPicks: {
                        ...fighterEquipmentPicks,
                        "class:fighter:base:exclusive:starting-wealth": "gold",
                    },
                },
            },
            "en",
            "dnd",
            1
        );

        expect(result.choices.grantPicks).toEqual({
            "class:fighter:base:exclusive:starting-wealth": "gold",
        });
        expect(result.grantedCurrency).toEqual({ gold: 50 });
        expect(
            result.inventory.bag.some((stack) => stack.slug === "longsword")
        ).toBe(false);
        expect(result.inventory.bag).toEqual([
            { slug: "amulet-of-vitality", quantity: 1 },
        ]);
        expect(result.inventory.equipped).toEqual({});
    });

    it("keeps manual longsword equipped when switching to gold branch", () => {
        const result = sanitizeStartingMaterialization(
            {
                ...emptyCharacterSelections(),
                characterClass: "fighter",
                inventory: {
                    bag: [
                        { slug: "longsword", quantity: 1 },
                        {
                            slug: "longsword",
                            quantity: 1,
                            provenance: "grant:class:fighter:4",
                        },
                    ],
                    equipped: { "main-hand": "longsword" },
                },
                choices: {
                    grantPicks: {
                        ...fighterEquipmentPicks,
                        "class:fighter:base:exclusive:starting-wealth": "gold",
                    },
                },
            },
            "en",
            "dnd",
            1
        );

        expect(result.inventory.bag).toEqual([]);
        expect(result.inventory.equipped).toEqual({ "main-hand": "longsword" });
    });

    it("materializes equipment branch granted items when switching from gold", () => {
        const result = sanitizeStartingMaterialization(
            {
                ...emptyCharacterSelections(),
                characterClass: "fighter",
                inventory: emptyInventory(),
                choices: {
                    grantPicks: {
                        "class:fighter:base:exclusive:starting-wealth": "equipment",
                    },
                },
            },
            "en",
            "dnd",
            1
        );

        expect(result.grantedCurrency).toEqual({});
        expect(
            result.inventory.bag.some(
                (stack) =>
                    stack.slug === "longsword" &&
                    stack.provenance === "grant:class:fighter:4"
            )
        ).toBe(true);
    });
});
