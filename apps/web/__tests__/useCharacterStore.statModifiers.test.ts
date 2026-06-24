import { act } from "@testing-library/react";
import { useCharacterStore } from "../store/useCharacterStore";
import { useContentLocale } from "../store/useContentLocale";

const baseAttributes = [
    { name: "strength", value: 10 },
    { name: "dexterity", value: 10 },
    { name: "constitution", value: 14 },
    { name: "intelligence", value: 10 },
    { name: "wisdom", value: 10 },
    { name: "charisma", value: 10 },
];

const baseFormData = {
    name: "Test Hero",
    ac: 12,
    attributes: baseAttributes,
    characterClass: "fighter",
    level: 1,
};

describe("useCharacterStore stat modifiers", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    it("adds item HP bonus to resolved max HP when item is equipped", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    inventory: {
                        bag: [],
                        equipped: { neck: "amulet-of-vitality" },
                    },
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.baseStats.hitPoints).toBe(12);
        expect(character.resources.hp).toBe(17);
        expect(
            useCharacterStore.getState().getResolvedStats(character.id)?.hitPoints
        ).toBe(17);
    });

    it("does not add item HP bonus when item is only in bag", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    inventory: {
                        bag: [{ slug: "amulet-of-vitality", quantity: 1 }],
                        equipped: {},
                    },
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.baseStats.hitPoints).toBe(12);
        expect(character.resources.hp).toBe(12);
        expect(
            useCharacterStore.getState().getResolvedStats(character.id)?.hitPoints
        ).toBe(12);
    });

    it("removes item HP bonus when equipment is cleared on update", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    inventory: {
                        bag: [],
                        equipped: { neck: "amulet-of-vitality" },
                    },
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        act(() => {
            useCharacterStore.getState().updateCharacter(character.id, {
                ...baseFormData,
                inventory: { bag: [], equipped: {} },
            });
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.hitPoints
        ).toBe(12);
        expect(
            updated.modifiers.some(
                (modifier) => modifier.source.type === "item"
            )
        ).toBe(false);
    });

    it("preserves manual non-derived modifiers when equipment changes", () => {
        act(() => {
            useCharacterStore.getState().addCharacter(
                {
                    ...baseFormData,
                    inventory: {
                        bag: [],
                        equipped: { neck: "amulet-of-vitality" },
                    },
                },
                "player",
                "dnd"
            );
        });

        const character = useCharacterStore.getState().characters[0];

        act(() => {
            useCharacterStore.setState({
                characters: [
                    {
                        ...character,
                        modifiers: [
                            ...character.modifiers,
                            {
                                id: "class-fighter-hp",
                                stat: "hitPoints",
                                operation: "add",
                                value: 2,
                                source: { type: "class", id: "fighter" },
                                duration: { type: "permanent" },
                                stacking: "stack",
                                priority: 0,
                            },
                        ],
                    },
                ],
            });
        });

        act(() => {
            useCharacterStore.getState().updateCharacter(character.id, {
                ...baseFormData,
                inventory: { bag: [], equipped: {} },
            });
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((entry) => entry.id === character.id)!;

        expect(updated.modifiers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: "class-fighter-hp",
                    source: { type: "class", id: "fighter" },
                }),
            ])
        );
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.hitPoints
        ).toBe(14);
    });
});
