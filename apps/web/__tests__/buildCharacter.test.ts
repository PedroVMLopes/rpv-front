import {
    buildNewStoredCharacter,
    buildStoredCharacter,
    rebuildStoredCharacter,
} from "../lib/character/buildCharacter";
import { formDataToStoredCharacter } from "../lib/character/characterAdapter";
import { collectPendingChoiceGrants } from "../lib/character/grantChoices";
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
    it("creates a player with race, class, background, and equipped item grants", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                race: "elf",
                background: "sage",
                inventory: {
                    bag: [],
                    equipped: { "main-hand": "scroll-of-fire-bolt" },
                },
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.selections).toMatchObject({
            race: "elf",
            characterClass: "fighter",
            background: "sage",
            inventory: {
                bag: [],
                equipped: { "main-hand": "scroll-of-fire-bolt" },
            },
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

    it("includes Action Surge when fighter is built at level 2", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                level: 2,
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "ability",
                    ref: "Action Surge",
                    source: { type: "class", id: "fighter" },
                }),
            ])
        );
    });

    it("puts inventory bag items without applying grants when not equipped", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                inventory: {
                    bag: [{ slug: "scroll-of-fire-bolt", quantity: 1 }],
                    equipped: {},
                },
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.selections.inventory).toEqual({
            bag: [{ slug: "scroll-of-fire-bolt", quantity: 1 }],
            equipped: {},
        });
        expect(
            character.grants.some(
                (grant) =>
                    grant.source.type === "item" &&
                    grant.source.id === "scroll-of-fire-bolt"
            )
        ).toBe(false);
    });

    it("removes invalid bag slugs during build sanitize", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                inventory: {
                    bag: [
                        { slug: "not-a-real-item", quantity: 2 },
                        { slug: "amulet-of-vitality", quantity: 1 },
                    ],
                    equipped: {},
                },
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.selections.inventory.bag).toEqual([
            { slug: "amulet-of-vitality", quantity: 1 },
        ]);
    });

    it("derives item HP bonus when equipped and syncs current HP on create", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                inventory: {
                    bag: [],
                    equipped: { neck: "amulet-of-vitality" },
                },
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
                inventory: {
                    bag: [],
                    equipped: { neck: "amulet-of-vitality" },
                },
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
                inventory: { bag: [], equipped: {} },
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
                        "class:fighter:base:skill_proficiency:3:0": "athletics",
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

    it("contributes grants from multiple equipped items", () => {
        const character = buildStoredCharacter({
            id: "multi-item",
            type: "player",
            system: "dnd",
            locale: "en",
            formData: {
                ...baseFormData,
                inventory: {
                    bag: [],
                    equipped: {
                        "main-hand": "scroll-of-fire-bolt",
                        neck: "amulet-of-vitality",
                    },
                },
            },
        });

        expect(character.selections.inventory.equipped).toEqual({
            "main-hand": "scroll-of-fire-bolt",
            neck: "amulet-of-vitality",
        });
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
            inventory: {
                bag: [{ slug: "scroll-of-fire-bolt", quantity: 1 }],
                equipped: {},
            },
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
            characterClass: "wizard",
            background: "sage",
            inventory: {
                bag: [{ slug: "scroll-of-fire-bolt", quantity: 1 }],
                equipped: {},
            },
        });
        expect(stored.systemData).not.toHaveProperty("characterClass");
    });

    it("derives subclass grants through the build pipeline at level 3", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                characterClass: "wizard",
                subclass: "wizard-evocation",
                level: 3,
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.selections.subclass).toBe("wizard-evocation");
        expect(character.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "ability",
                    ref: "Sculpt Spells",
                    source: { type: "subclass", id: "wizard-evocation" },
                }),
            ])
        );
    });

    it("clears invalid subclass during build when class does not match", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                characterClass: "wizard",
                subclass: "fighter-champion",
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.selections.subclass).toBeUndefined();
        expect(character.grants).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    source: { type: "subclass", id: "fighter-champion" },
                }),
            ])
        );
    });

    it("derives wizard spell slot resources at level 1", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                characterClass: "wizard",
                level: 1,
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.resources["spell-slots-1"]).toBe(2);
        expect(character.resources["spell-slots-2"]).toBeUndefined();
        expect(character.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "resource",
                    ref: "spell-slots-1",
                    amount: 2,
                    source: { type: "class", id: "wizard" },
                }),
            ])
        );
    });

    it("derives wizard spell slot totals at level 3", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                characterClass: "wizard",
                level: 3,
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.resources).toMatchObject({
            "spell-slots-1": 4,
            "spell-slots-2": 2,
            "spell-slots-3": 1,
        });
    });

    it("preserves form-driven hp when merging derived resources", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                characterClass: "wizard",
                level: 1,
                hp: 8,
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.resources.hp).toBe(8);
        expect(character.resources["spell-slots-1"]).toBe(2);
    });

    it("derives barbarian resources and abilities at level 5", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                characterClass: "barbarian",
                subclass: "barbarian-berserker",
                level: 5,
                choices: {
                    grantPicks: {
                        "class:barbarian:base:skill_proficiency:3:0": "athletics",
                        "class:barbarian:base:skill_proficiency:3:1": "intimidation",
                    },
                },
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.resources["rage-uses"]).toBe(3);
        expect(character.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "ability",
                    ref: "Extra Attack",
                    source: { type: "class", id: "barbarian" },
                }),
                expect.objectContaining({
                    kind: "ability",
                    ref: "Frenzy",
                    source: { type: "subclass", id: "barbarian-berserker" },
                }),
            ])
        );
    });

    it("derives monk ki and abilities at level 5", () => {
        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                characterClass: "monk",
                subclass: "monk-open-hand",
                level: 5,
                choices: {
                    grantPicks: {
                        "class:monk:base:tool_proficiency:2:0": "lute",
                        "class:monk:base:skill_proficiency:3:0": "acrobatics",
                        "class:monk:base:skill_proficiency:3:1": "stealth",
                    },
                },
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.resources["ki-points"]).toBe(5);
        expect(character.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "ability",
                    ref: "Stunning Strike",
                    source: { type: "class", id: "monk" },
                }),
                expect.objectContaining({
                    kind: "ability",
                    ref: "Open Hand Technique",
                    source: { type: "subclass", id: "monk-open-hand" },
                }),
            ])
        );
    });

    it("builds wizard level 5 with evocation and all accumulated picks", () => {
        const selections = {
            ...emptyCharacterSelections(),
            characterClass: "wizard",
            subclass: "wizard-evocation",
        };
        const pending = collectPendingChoiceGrants(selections, "en", 5);
        const grantPicks: Record<string, string> = {};

        for (const choice of pending) {
            if (choice.grant.grantType === "spell" && choice.label.includes("cantrip")) {
                grantPicks[choice.key] = "fire-bolt";
                continue;
            }

            const firstOption = choice.options[0]?.value;
            if (firstOption) {
                grantPicks[choice.key] = firstOption;
            }
        }

        expect(Object.keys(grantPicks).length).toBeGreaterThan(0);

        const character = buildNewStoredCharacter(
            {
                ...baseFormData,
                characterClass: "wizard",
                subclass: "wizard-evocation",
                level: 5,
                choices: { grantPicks },
            },
            "player",
            "dnd",
            "en"
        );

        expect(character.resources).toMatchObject({
            "spell-slots-1": 4,
            "spell-slots-2": 3,
            "spell-slots-3": 2,
            "spell-slots-4": 1,
        });
        expect(character.selections.subclass).toBe("wizard-evocation");
        expect(character.grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "spell",
                    ref: "fire-bolt",
                    source: { type: "class", id: "wizard" },
                }),
                expect.objectContaining({
                    kind: "ability",
                    ref: "Sculpt Spells",
                    source: { type: "subclass", id: "wizard-evocation" },
                }),
            ])
        );
    });
});
