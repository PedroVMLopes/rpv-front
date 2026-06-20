import {
    buildNewStoredCharacter,
    buildStoredCharacter,
    rebuildStoredCharacter,
} from "../lib/character/buildCharacter";
import { formDataToStoredCharacter } from "../lib/character/characterAdapter";
import { emptyCharacterSelections } from "../lib/character/storedCharacter";
import type { StoredCharacter } from "../lib/character/storedCharacter";

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

describe("buildStoredCharacter", () => {
    it("creates a player with race, class, background, and item grants", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                race: "elf",
                background: "sage",
                startingItem: "scroll-of-fire-bolt",
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.selections).toMatchObject({
            race: "elf",
            characterClass: "fighter",
            background: "sage",
            items: ["scroll-of-fire-bolt"],
        });
        expect(character.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "spell",
                    ref: "fire-bolt",
                    source: { type: "item", id: "scroll-of-fire-bolt" },
                }),
                expect.objectContaining({
                    kind: "proficiency",
                    ref: "arcana",
                    source: { type: "background", id: "sage" },
                }),
            ])
        );
        expect(
            character.modifiers.some((modifier) => modifier.source.type === "item")
        ).toBe(false);
    });

    it("derives item HP bonus and syncs current HP on create", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                startingItem: "amulet-of-vitality",
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.baseStats.hitPoints).toBe(12);
        expect(character.resources.hp).toBe(17);
        expect(
            character.modifiers.some(
                (modifier) =>
                    modifier.source.type === "item" &&
                    modifier.stat === "hitPoints"
            )
        ).toBe(true);
    });

    it("removes item modifier on update but preserves manual class modifiers", () => {
        const created = buildNewStoredCharacter(
            {
                ...baseFormData,
                startingItem: "amulet-of-vitality",
            },
            "player",
            "dnd",
            "en"
        );

        const withManualModifier: StoredCharacter = {
            ...created,
            modifiers: [
                ...created.modifiers,
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
        };

        const updated = rebuildStoredCharacter(
            withManualModifier,
            {
                ...baseFormData,
                startingItem: "",
            },
            "en"
        );

        expect(
            updated.modifiers.some((modifier) => modifier.source.type === "item")
        ).toBe(false);
        expect(updated.modifiers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: "class-fighter-hp",
                    source: { type: "class", id: "fighter" },
                }),
            ])
        );
    });

    it("sanitizes stale class grant picks when class changes", () => {
        const created = buildNewStoredCharacter(
            {
                ...baseFormData,
                race: "elf",
                choices: {
                    grantPicks: {
                        "class:fighter:skill_proficiency:3:0": "athletics",
                    },
                },
            },
            "player",
            "dnd",
            "en"
        );

        const updated = rebuildStoredCharacter(
            created,
            {
                ...baseFormData,
                race: "elf",
                characterClass: "wizard",
                choices: created.selections.choices,
            },
            "en"
        );

        expect(updated.selections.choices.grantPicks).toEqual({});
    });

    it("contributes grants from multiple items", () => {
        const character = buildStoredCharacter({
            id: "multi-item",
            type: "player",
            system: "dnd",
            locale: "en",
            formData: {
                ...baseFormData,
                items: ["scroll-of-fire-bolt", "amulet-of-vitality"],
            },
        });

        expect(character.selections.items).toEqual([
            "scroll-of-fire-bolt",
            "amulet-of-vitality",
        ]);
        expect(character.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "spell",
                    ref: "fire-bolt",
                }),
            ])
        );
        expect(
            character.modifiers.some(
                (modifier) =>
                    modifier.source.id === "amulet-of-vitality" &&
                    modifier.stat === "hitPoints"
            )
        ).toBe(true);
    });

    it("migrates grant sources from legacy systemData-only shape via form build", () => {
        const legacyForm = {
            name: "Legacy Hero",
            hp: 5,
            maxHp: 10,
            ac: 11,
            characterClass: "Wizard",
            background: "sage",
            startingItem: "scroll-of-fire-bolt",
            attributes: baseAttributes,
        };

        const stored = formDataToStoredCharacter(
            legacyForm,
            "legacy-1",
            "player",
            "dnd",
            []
        );

        expect(stored.selections).toMatchObject({
            characterClass: "Wizard",
            background: "sage",
            items: ["scroll-of-fire-bolt"],
        });
        expect(stored.systemData).not.toHaveProperty("characterClass");
    });
});
