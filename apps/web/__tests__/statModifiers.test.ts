import { deriveStatModifiers } from "../lib/character/characterGrants";

describe("deriveStatModifiers", () => {
    it("derives hitPoints modifier from starting item", () => {
        const modifiers = deriveStatModifiers(
            { race: "human", choices: {} },
            { startingItem: "amulet-of-vitality" },
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
            { race: "elf", choices: {} },
            { characterClass: "fighter", background: "sage" },
            "en"
        );

        expect(modifiers).toEqual([]);
    });

    it("returns empty when no item is selected", () => {
        expect(
            deriveStatModifiers({ race: "human", choices: {} }, {}, "en")
        ).toEqual([]);
    });
});
