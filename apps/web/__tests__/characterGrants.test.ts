import {
    deriveCharacterGrants,
    getLanguageBudget,
    getFixedLanguageGrants,
} from "../lib/character/characterGrants";
import { buildSelectionsFromForm } from "../lib/character/characterAdapter";
import { emptyCharacterSelections } from "../lib/character/storedCharacter";

const baseSelections = { ...emptyCharacterSelections() };

describe("deriveCharacterGrants", () => {
    it("derives fixed racial languages for dwarf", () => {
        const grants = deriveCharacterGrants(
            { ...baseSelections, race: "dwarf" },
            "en"
        );

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "language",
                    ref: "common",
                    source: { type: "race", id: "dwarf" },
                }),
                expect.objectContaining({
                    kind: "language",
                    ref: "dwarvish",
                    source: { type: "race", id: "dwarf" },
                }),
                expect.objectContaining({
                    kind: "ability",
                    ref: "Dwarven Resilience",
                }),
            ])
        );
    });

    it("resolves language and spell choices from grantPicks", () => {
        const grants = deriveCharacterGrants(
            {
                ...baseSelections,
                race: "elf",
                subrace: "high-elf",
                choices: {
                    grantPicks: {
                        "race:high-elf:language:0:0": "draconic",
                        "race:high-elf:spell:0:0": "fire-bolt",
                    },
                },
            },
            "en"
        );

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "language",
                    ref: "draconic",
                }),
                expect.objectContaining({
                    kind: "spell",
                    ref: "fire-bolt",
                }),
            ])
        );
    });

    it("includes background and item grants", () => {
        const grants = deriveCharacterGrants(
            {
                ...baseSelections,
                race: "elf",
                background: "sage",
                items: ["scroll-of-fire-bolt"],
            },
            "en"
        );

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "proficiency",
                    ref: "arcana",
                    source: { type: "background", id: "sage" },
                }),
                expect.objectContaining({
                    kind: "spell",
                    ref: "fire-bolt",
                    source: { type: "item", id: "scroll-of-fire-bolt" },
                }),
            ])
        );
    });

    it("derives fixed class proficiencies from characterClass selection", () => {
        const grants = deriveCharacterGrants(
            {
                ...baseSelections,
                race: "elf",
                characterClass: "fighter",
            },
            "en"
        );

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "proficiency",
                    ref: "light-armor",
                    source: { type: "class", id: "fighter" },
                }),
                expect.objectContaining({
                    kind: "proficiency",
                    ref: "martial-weapons",
                    source: { type: "class", id: "fighter" },
                }),
                expect.objectContaining({
                    kind: "saving_throw",
                    ref: "strength",
                    source: { type: "class", id: "fighter" },
                }),
                expect.objectContaining({
                    kind: "saving_throw",
                    ref: "constitution",
                    source: { type: "class", id: "fighter" },
                }),
            ])
        );
    });

    it("resolves class skill choices from grantPicks", () => {
        const grants = deriveCharacterGrants(
            {
                ...baseSelections,
                race: "elf",
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:skill_proficiency:3:0": "athletics",
                        "class:fighter:skill_proficiency:3:1": "intimidation",
                    },
                },
            },
            "en"
        );

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "proficiency",
                    ref: "athletics",
                    source: { type: "class", id: "fighter" },
                }),
                expect.objectContaining({
                    kind: "proficiency",
                    ref: "intimidation",
                    source: { type: "class", id: "fighter" },
                }),
            ])
        );
    });

    it("includes Action Surge for fighter at level 2", () => {
        const level1 = deriveCharacterGrants(
            {
                ...baseSelections,
                characterClass: "fighter",
            },
            "en",
            1
        );
        const level2 = deriveCharacterGrants(
            {
                ...baseSelections,
                characterClass: "fighter",
            },
            "en",
            2
        );

        expect(level1).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ref: "Action Surge" }),
            ])
        );
        expect(level2).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "ability",
                    ref: "Action Surge",
                    source: { type: "class", id: "fighter" },
                }),
            ])
        );
    });

    it("derives subclass grants with namespaced slug source", () => {
        const grants = deriveCharacterGrants(
            {
                ...baseSelections,
                characterClass: "wizard",
                subclass: "wizard-evocation",
            },
            "en"
        );

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "ability",
                    ref: "Sculpt Spells",
                    source: { type: "subclass", id: "wizard-evocation" },
                }),
            ])
        );
    });

    it("includes level-gated subclass features", () => {
        const level2 = deriveCharacterGrants(
            {
                ...baseSelections,
                characterClass: "fighter",
                subclass: "fighter-champion",
            },
            "en",
            2
        );
        const level3 = deriveCharacterGrants(
            {
                ...baseSelections,
                characterClass: "fighter",
                subclass: "fighter-champion",
            },
            "en",
            3
        );

        expect(level2).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ ref: "Improved Critical" }),
            ])
        );
        expect(level3).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    kind: "ability",
                    ref: "Improved Critical",
                    source: { type: "subclass", id: "fighter-champion" },
                }),
            ])
        );
    });

    it("ignores subclass when classSlug does not match characterClass", () => {
        const grants = deriveCharacterGrants(
            {
                ...baseSelections,
                characterClass: "wizard",
                subclass: "fighter-champion",
            },
            "en",
            3
        );

        expect(grants).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    source: { type: "subclass", id: "fighter-champion" },
                }),
            ])
        );
    });

    it("ignores unknown subclass slugs", () => {
        const grants = deriveCharacterGrants(
            {
                ...baseSelections,
                characterClass: "fighter",
                subclass: "unknown-subclass",
            },
            "en"
        );

        expect(grants).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ source: { type: "subclass" } }),
            ])
        );
    });
});

describe("getLanguageBudget", () => {
    it("sums language choice slots from race and background", () => {
        const budget = getLanguageBudget(
            {
                ...baseSelections,
                race: "elf",
                subrace: "high-elf",
                background: "sage",
            },
            "en"
        );

        expect(budget).toBe(3);
    });
});

describe("getFixedLanguageGrants", () => {
    it("returns auto-known languages without choice slots", () => {
        const fixed = getFixedLanguageGrants(
            { ...baseSelections, race: "elf" },
            "en"
        );

        expect(fixed.map((grant) => grant.ref)).toEqual(
            expect.arrayContaining(["common", "elvish"])
        );
    });
});

describe("buildSelectionsFromForm", () => {
    it("maps grant source fields and starting item into selections", () => {
        expect(
            buildSelectionsFromForm({
                race: "elf",
                characterClass: "fighter",
                subclass: "fighter-champion",
                background: "sage",
                startingItem: "scroll-of-fire-bolt",
            })
        ).toEqual({
            race: "elf",
            subrace: undefined,
            characterClass: "fighter",
            subclass: "fighter-champion",
            background: "sage",
            items: ["scroll-of-fire-bolt"],
            choices: {},
        });
    });

    it("normalizes catalog slug fields to lowercase", () => {
        expect(
            buildSelectionsFromForm({
                race: "Elf",
                characterClass: "Fighter",
                subclass: "Fighter-Champion",
                background: "Sage",
            })
        ).toEqual({
            race: "elf",
            subrace: undefined,
            characterClass: "fighter",
            subclass: "fighter-champion",
            background: "sage",
            items: [],
            choices: {},
        });
    });
});
