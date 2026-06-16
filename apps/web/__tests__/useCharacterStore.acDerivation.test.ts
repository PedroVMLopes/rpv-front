import { act } from "@testing-library/react";
import { useCharacterStore } from "../store/useCharacterStore";
import { useContentLocale } from "../store/useContentLocale";

const baseFormData = {
    name: "Test Hero",
    attributes: [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ],
};

describe("useCharacterStore AC derivation", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    it("derives base AC from dexterity when ac is empty", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    attributes: baseFormData.attributes.map((attribute) =>
                        attribute.name === "dexterity"
                            ? { ...attribute, value: 14 }
                            : attribute
                    ),
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.baseStats.armorClass).toBe(12);
    });

    it("keeps manual ac override when provided", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    ac: 18,
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.baseStats.armorClass).toBe(18);
    });

    it("uses race ASI when deriving AC on create", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    race: "elf",
                    attributes: baseFormData.attributes.map((attribute) =>
                        attribute.name === "dexterity"
                            ? { ...attribute, value: 10 }
                            : attribute
                    ),
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.baseStats.armorClass).toBe(11);
    });
});
