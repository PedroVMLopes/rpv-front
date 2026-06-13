import {
    deriveCharacterGrants,
    getLanguageBudget,
    getFixedLanguageGrants,
    grantContextFromForm,
} from "../lib/character/characterGrants";

describe("deriveCharacterGrants", () => {
    it("derives fixed racial languages for dwarf", () => {
        const grants = deriveCharacterGrants(
            { race: "dwarf", choices: {} },
            {},
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
                race: "elf",
                subrace: "high-elf",
                choices: {
                    grantPicks: {
                        "race:high-elf:language:0:0": "draconic",
                        "race:high-elf:spell:0:0": "fire-bolt",
                    },
                },
            },
            {},
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
            { race: "elf", choices: {} },
            { background: "sage", startingItem: "scroll-of-fire-bolt" },
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
});

describe("getLanguageBudget", () => {
    it("sums language choice slots from race and background", () => {
        const budget = getLanguageBudget(
            { race: "elf", subrace: "high-elf", choices: {} },
            { background: "sage" },
            "en"
        );

        expect(budget).toBe(3);
    });
});

describe("getFixedLanguageGrants", () => {
    it("returns auto-known languages without choice slots", () => {
        const fixed = getFixedLanguageGrants(
            { race: "elf", choices: {} },
            {},
            "en"
        );

        expect(fixed.map((grant) => grant.ref)).toEqual(
            expect.arrayContaining(["common", "elvish"])
        );
    });
});

describe("grantContextFromForm", () => {
    it("extracts background and starting item slugs", () => {
        expect(
            grantContextFromForm({
                background: "sage",
                startingItem: "scroll-of-fire-bolt",
            })
        ).toEqual({
            background: "sage",
            startingItem: "scroll-of-fire-bolt",
        });
    });
});
