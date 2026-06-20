import { deriveStatModifiers } from "../lib/character/characterGrants";
import { emptyCharacterSelections } from "../lib/character/storedCharacter";

const baseSelections = { ...emptyCharacterSelections() };

describe("deriveStatModifiers", () => {
    it("derives hitPoints modifier from starting item", () => {
        const modifiers = deriveStatModifiers(
            {
                ...baseSelections,
                race: "human",
                items: ["amulet-of-vitality"],
            },
            "en"
        );

        expect(modifiers).toEqual([
            expect.objectContaining({
                stat: "hitPoints",
                value: 5,
                operation: "add",
                source: { type: "item", id: "amulet-of-vitality" },
            }),
        ]);
    });

    it("ignores class and background stat sources", () => {
        const modifiers = deriveStatModifiers(
            {
                ...baseSelections,
                race: "elf",
                characterClass: "fighter",
                background: "sage",
            },
            "en"
        );

        expect(modifiers).toEqual([]);
    });

    it("returns empty when no item is selected", () => {
        expect(
            deriveStatModifiers({ ...baseSelections, race: "human" }, "en")
        ).toEqual([]);
    });
});
