import { emptyInventory } from "@rpv/domain";
import type { Modifier } from "@rpv/domain";
import { deriveModifiersForCharacter } from "../lib/character/deriveModifiers";
import { emptyCharacterSelections } from "../lib/character/storedCharacter";

const conditionModifier: Modifier = {
    id: "condition-bless-strength",
    stat: "strength",
    operation: "add",
    value: 1,
    source: { type: "condition", id: "bless" },
    duration: { type: "temporary" },
    stacking: "stack",
    priority: 0,
};

const staleRaceModifier: Modifier = {
    id: "race-elf-dexterity",
    stat: "dexterity",
    operation: "add",
    value: 99,
    source: { type: "race", id: "elf" },
    duration: { type: "permanent" },
    stacking: "stack",
    priority: 0,
};

const staleOtherItemModifier: Modifier = {
    id: "item-old-ring-stat-hitPoints",
    stat: "hitPoints",
    operation: "add",
    value: 10,
    source: { type: "item", id: "rpv_ring-of-hardiness" },
    duration: { type: "permanent" },
    stacking: "stack",
    priority: 0,
};

describe("deriveModifiersForCharacter", () => {
    it("derives race and equipped item modifiers", () => {
        const modifiers = deriveModifiersForCharacter(
            {
                ...emptyCharacterSelections(),
                race: "elf",
                inventory: {
                    bag: [{ slug: "rpv_amulet-of-vitality", quantity: 1 }],
                    equipped: { amulet: "rpv_amulet-of-vitality" },
                    equippedMulti: {},
                },
            },
            "en"
        );

        expect(modifiers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    stat: "dexterity",
                    value: 2,
                    source: { type: "race", id: "elf" },
                }),
                expect.objectContaining({
                    stat: "hitPoints",
                    value: 5,
                    source: { type: "item", id: "rpv_amulet-of-vitality" },
                }),
            ])
        );
    });

    it("does not apply bag-only item modifiers", () => {
        const modifiers = deriveModifiersForCharacter(
            {
                ...emptyCharacterSelections(),
                inventory: {
                    bag: [{ slug: "rpv_amulet-of-vitality", quantity: 1 }],
                    equipped: {},
                    equippedMulti: {},
                },
            },
            "en"
        );

        expect(
            modifiers.some((modifier) => modifier.source.type === "item")
        ).toBe(false);
    });

    it("replaces race and item modifiers on preserve while keeping condition bonuses", () => {
        const modifiers = deriveModifiersForCharacter(
            {
                ...emptyCharacterSelections(),
                race: "elf",
                inventory: {
                    bag: [{ slug: "rpv_amulet-of-vitality", quantity: 1 }],
                    equipped: { amulet: "rpv_amulet-of-vitality" },
                    equippedMulti: {},
                },
            },
            "en",
            {
                preserve: [
                    staleRaceModifier,
                    staleOtherItemModifier,
                    conditionModifier,
                ],
            }
        );

        expect(modifiers.filter((modifier) => modifier.source.type === "race")).toEqual(
            [
                expect.objectContaining({
                    stat: "dexterity",
                    value: 2,
                    source: { type: "race", id: "elf" },
                }),
            ]
        );
        expect(
            modifiers.filter((modifier) => modifier.source.type === "item")
        ).toEqual([
            expect.objectContaining({
                source: { type: "item", id: "rpv_amulet-of-vitality" },
                value: 5,
            }),
        ]);
        expect(modifiers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: "condition-bless-strength",
                    source: { type: "condition", id: "bless" },
                }),
            ])
        );
        expect(
            modifiers.some(
                (modifier) => modifier.source.id === "rpv_ring-of-hardiness"
            )
        ).toBe(false);
    });

    it("returns only derived modifiers when preserve is omitted", () => {
        const modifiers = deriveModifiersForCharacter(
            {
                ...emptyCharacterSelections(),
                race: "elf",
                inventory: emptyInventory(),
            },
            "en"
        );

        expect(modifiers.every((modifier) => modifier.source.type === "race")).toBe(
            true
        );
    });
});
