import { sanitizeGrantPicks, sanitizeSelections } from "../lib/character/grantPickSanitize";
import { emptyCharacterSelections } from "../lib/character/storedCharacter";

const baseSelections = { ...emptyCharacterSelections() };

describe("sanitizeGrantPicks", () => {
    it("keeps picks that match pending choices for the current selection", () => {
        const selections = sanitizeGrantPicks(
            {
                ...baseSelections,
                race: "elf",
                subrace: "high-elf",
                choices: {
                    grantPicks: {
                        "race:high-elf:base:language:0:0": "draconic",
                        "race:high-elf:base:spell:0:0": "fire-bolt",
                    },
                },
            },
            "en"
        );

        expect(selections.choices.grantPicks).toEqual({
            "race:high-elf:base:language:0:0": "draconic",
            "race:high-elf:base:spell:0:0": "fire-bolt",
        });
    });

    it("drops picks from a previous race when race changes", () => {
        const selections = sanitizeGrantPicks(
            {
                ...baseSelections,
                race: "dwarf",
                subrace: undefined,
                choices: {
                    grantPicks: {
                        "race:high-elf:base:language:0:0": "draconic",
                        "race:high-elf:base:spell:0:0": "fire-bolt",
                        "race:dwarf:base:tool_proficiency:0:0": "smiths-tools",
                    },
                },
            },
            "en"
        );

        expect(selections.choices.grantPicks).toEqual({
            "race:dwarf:base:tool_proficiency:0:0": "smiths-tools",
        });
    });

    it("drops class picks when class changes", () => {
        const selections = sanitizeGrantPicks(
            {
                ...baseSelections,
                race: "elf",
                characterClass: "wizard",
                choices: {
                    grantPicks: {
                        "class:fighter:base:skill_proficiency:3:0": "athletics",
                    },
                },
            },
            "en"
        );

        expect(selections.choices.grantPicks).toEqual({});
    });

    it("keeps class picks for the active class", () => {
        const selections = sanitizeGrantPicks(
            {
                ...baseSelections,
                race: "elf",
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:base:skill_proficiency:3:0": "athletics",
                    },
                },
            },
            "en"
        );

        expect(selections.choices.grantPicks).toEqual({
            "class:fighter:base:skill_proficiency:3:0": "athletics",
        });
    });

    it("drops level 3 class picks when character level falls below 3", () => {
        const selections = sanitizeGrantPicks(
            {
                ...baseSelections,
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:base:skill_proficiency:3:0": "athletics",
                        "class:fighter:base:skill_proficiency:3:1": "intimidation",
                        "class:fighter:3:skill_proficiency:0:0": "history",
                    },
                },
            },
            "en",
            2
        );

        expect(selections.choices.grantPicks).toEqual({
            "class:fighter:base:skill_proficiency:3:0": "athletics",
            "class:fighter:base:skill_proficiency:3:1": "intimidation",
        });
    });
});

describe("sanitizeSelections", () => {
    it("clears subclass when it does not belong to the selected class", () => {
        const selections = sanitizeSelections(
            {
                ...baseSelections,
                characterClass: "wizard",
                subclass: "fighter-champion",
                choices: {
                    grantPicks: {
                        "subclass:fighter-champion:ability:0:0": "unused",
                    },
                },
            },
            "en",
            3
        );

        expect(selections.subclass).toBeUndefined();
        expect(selections.choices.grantPicks).toEqual({});
    });

    it("keeps subclass and picks when class and slug match at unlock level", () => {
        const selections = sanitizeSelections(
            {
                ...baseSelections,
                characterClass: "wizard",
                subclass: "wizard-evocation",
            },
            "en",
            3
        );

        expect(selections.subclass).toBe("wizard-evocation");
    });

    it("clears subclass when character level is below subclass unlock", () => {
        const selections = sanitizeSelections(
            {
                ...baseSelections,
                characterClass: "wizard",
                subclass: "wizard-evocation",
            },
            "en",
            2
        );

        expect(selections.subclass).toBeUndefined();
    });

    it("preserves subclass at level 5 when unlocked", () => {
        const selections = sanitizeSelections(
            {
                ...baseSelections,
                characterClass: "wizard",
                subclass: "wizard-evocation",
            },
            "en",
            5
        );

        expect(selections.subclass).toBe("wizard-evocation");
    });

    it("clears subclass and stale picks when level drops below unlock", () => {
        const selections = sanitizeSelections(
            {
                ...baseSelections,
                characterClass: "fighter",
                subclass: "fighter-champion",
                choices: {
                    grantPicks: {
                        "class:fighter:base:skill_proficiency:3:0": "athletics",
                        "class:fighter:base:skill_proficiency:3:1": "intimidation",
                        "class:fighter:3:skill_proficiency:0:0": "history",
                        "subclass:fighter-champion:base:ability:0:0": "unused",
                    },
                },
            },
            "en",
            2
        );

        expect(selections.subclass).toBeUndefined();
        expect(selections.choices.grantPicks).toEqual({
            "class:fighter:base:skill_proficiency:3:0": "athletics",
            "class:fighter:base:skill_proficiency:3:1": "intimidation",
        });
    });
});
