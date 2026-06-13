import { act } from "@testing-library/react";
import { useCharacterStore } from "../store/useCharacterStore";
import { useContentLocale } from "../store/useContentLocale";

const baseFormData = {
    name: "Test Hero",
    hp: 8,
    maxHp: 10,
    ac: 12,
    attributes: [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 10 },
        { name: "constitution", value: 10 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ],
};

describe("useCharacterStore race modifiers", () => {
    beforeEach(() => {
        act(() => {
            useCharacterStore.setState({ characters: [] });
            useContentLocale.setState({ contentLocale: "en" });
        });
    });

    it("derives race ASI modifiers on create", () => {
        act(() => {
            useCharacterStore
                .getState()
                .addCharacter(
                    { ...baseFormData, race: "elf" },
                    "player",
                    "dnd"
                );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.selections).toEqual({
            race: "elf",
            subrace: undefined,
            choices: {},
        });
        expect(character.modifiers).toEqual([
            expect.objectContaining({
                stat: "dexterity",
                value: 2,
                source: { type: "race", id: "elf" },
            }),
        ]);
        expect(
            useCharacterStore.getState().getResolvedStats(character.id)?.dexterity
        ).toBe(12);
    });

    it("derives racial language and ability grants on create", () => {
        act(() => {
            useCharacterStore
                .getState()
                .addCharacter(
                    { ...baseFormData, race: "dwarf" },
                    "player",
                    "dnd"
                );
        });

        const character = useCharacterStore.getState().characters[0];

        expect(character.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "language",
                    ref: "common",
                }),
                expect.objectContaining({
                    kind: "language",
                    ref: "dwarvish",
                }),
                expect.objectContaining({
                    kind: "ability",
                    ref: "Dwarven Resilience",
                }),
            ])
        );
    });

    it("replaces grants when race changes on update", () => {
        act(() => {
            useCharacterStore
                .getState()
                .addCharacter(
                    { ...baseFormData, race: "elf" },
                    "player",
                    "dnd"
                );
        });

        const character = useCharacterStore.getState().characters[0];

        act(() => {
            useCharacterStore.getState().updateCharacter(character.id, {
                ...baseFormData,
                race: "dwarf",
                subrace: "hill-dwarf",
            });
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((c) => c.id === character.id)!;

        expect(updated.modifiers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    stat: "constitution",
                    value: 2,
                    source: { type: "race", id: "dwarf" },
                }),
                expect.objectContaining({
                    stat: "wisdom",
                    value: 1,
                    source: { type: "race", id: "hill-dwarf" },
                }),
            ])
        );
        expect(updated.modifiers).toHaveLength(2);
        expect(updated.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "language",
                    ref: "common",
                    source: { type: "race", id: "dwarf" },
                }),
            ])
        );
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.dexterity
        ).toBe(10);
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.constitution
        ).toBe(12);
        expect(
            useCharacterStore.getState().getResolvedStats(updated.id)?.wisdom
        ).toBe(11);
    });

    it("preserves non-race modifiers when race changes on update", () => {
        act(() => {
            useCharacterStore
                .getState()
                .addCharacter(
                    { ...baseFormData, race: "elf" },
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
                race: "dwarf",
            });
        });

        const updated = useCharacterStore
            .getState()
            .characters.find((c) => c.id === character.id)!;

        expect(updated.modifiers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: "class-fighter-hp",
                    source: { type: "class", id: "fighter" },
                }),
                expect.objectContaining({
                    stat: "constitution",
                    source: { type: "race", id: "dwarf" },
                }),
            ])
        );
    });
});
