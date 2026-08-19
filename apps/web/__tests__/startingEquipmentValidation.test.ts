import {
    collectValidStartingEquipmentPickKeys,
    findMissingExclusiveGroupPicks,
} from "../lib/character/startingEquipmentValidation";
import { emptyCharacterSelections } from "../lib/character/storedCharacter";

const baseSelections = { ...emptyCharacterSelections() };

describe("collectValidStartingEquipmentPickKeys", () => {
    it("always includes the fighter exclusive wealth key", () => {
        const keys = collectValidStartingEquipmentPickKeys(
            {
                ...baseSelections,
                characterClass: "fighter",
            },
            "en",
            "dnd",
            1
        );

        expect(keys.has("class:fighter:base:exclusive:starting-wealth")).toBe(
            true
        );
        expect(keys.has("class:fighter:base:inventory_item:8:0")).toBe(false);
    });

    it("includes equipment-branch inventory slots only after that branch is picked", () => {
        const keys = collectValidStartingEquipmentPickKeys(
            {
                ...baseSelections,
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:base:exclusive:starting-wealth":
                            "equipment",
                    },
                },
            },
            "en",
            "dnd",
            1
        );

        expect(keys.has("class:fighter:base:exclusive:starting-wealth")).toBe(
            true
        );
        expect(keys.has("class:fighter:base:inventory_item:5:0")).toBe(true);
        expect(keys.has("class:fighter:base:inventory_item:6:0")).toBe(true);
        expect(keys.has("class:fighter:base:inventory_item:7:0")).toBe(true);
        expect(keys.has("class:fighter:base:inventory_item:8:0")).toBe(true);
    });

    it("omits equipment-branch inventory slots when gold is selected", () => {
        const keys = collectValidStartingEquipmentPickKeys(
            {
                ...baseSelections,
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:base:exclusive:starting-wealth": "gold",
                    },
                },
            },
            "en",
            "dnd",
            1
        );

        expect(keys.has("class:fighter:base:exclusive:starting-wealth")).toBe(
            true
        );
        expect(keys.has("class:fighter:base:inventory_item:8:0")).toBe(false);
    });
});

describe("findMissingExclusiveGroupPicks", () => {
    it("requires fighter starting wealth when unpicked", () => {
        const missing = findMissingExclusiveGroupPicks(
            { characterClass: "fighter" },
            "en",
            "dnd"
        );

        expect(missing.map((group) => group.key)).toEqual([
            "class:fighter:base:exclusive:starting-wealth",
        ]);
    });

    it("returns empty when the exclusive branch is already picked", () => {
        const missing = findMissingExclusiveGroupPicks(
            {
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:base:exclusive:starting-wealth":
                            "equipment",
                    },
                },
            },
            "en",
            "dnd"
        );

        expect(missing).toEqual([]);
    });
});
