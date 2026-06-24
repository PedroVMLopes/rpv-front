import { act } from "@testing-library/react";
import { useCharacterStore } from "../store/useCharacterStore";
import { useContentLocale } from "../store/useContentLocale";

const baseFormData = {
    name: "Test Hero",
    ac: 12,
    attributes: [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ],
};

describe("useCharacterStore HP derivation", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    it("derives max HP from class, level, and constitution when maxHp is empty", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    characterClass: "fighter",
                    level: 3,
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.baseStats.hitPoints).toBe(28);
        expect(character.resources.hp).toBe(28);
    });

    it("keeps manual maxHp override when provided", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    characterClass: "fighter",
                    level: 3,
                    maxHp: 99,
                    hp: 50,
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.baseStats.hitPoints).toBe(99);
        expect(character.resources.hp).toBe(50);
    });

    it("uses race ASI when deriving HP on create", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    race: "dwarf",
                    characterClass: "fighter",
                    level: 1,
                    attributes: baseFormData.attributes.map((attribute) =>
                        attribute.name === "constitution"
                            ? { ...attribute, value: 10 }
                            : attribute
                    ),
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.baseStats.hitPoints).toBe(11);
    });
});
