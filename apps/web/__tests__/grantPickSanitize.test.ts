import { sanitizeGrantPicks } from "../lib/character/grantPickSanitize";

describe("sanitizeGrantPicks", () => {
    it("keeps picks that match pending choices for the current selection", () => {
        const selections = sanitizeGrantPicks(
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

        expect(selections.choices.grantPicks).toEqual({
            "race:high-elf:language:0:0": "draconic",
            "race:high-elf:spell:0:0": "fire-bolt",
        });
    });

    it("drops picks from a previous race when race changes", () => {
        const selections = sanitizeGrantPicks(
            {
                race: "dwarf",
                subrace: undefined,
                choices: {
                    grantPicks: {
                        "race:high-elf:language:0:0": "draconic",
                        "race:high-elf:spell:0:0": "fire-bolt",
                        "race:dwarf:tool_proficiency:0:0": "smiths-tools",
                    },
                },
            },
            {},
            "en"
        );

        expect(selections.choices.grantPicks).toEqual({
            "race:dwarf:tool_proficiency:0:0": "smiths-tools",
        });
    });

    it("drops class picks when class changes", () => {
        const selections = sanitizeGrantPicks(
            {
                race: "elf",
                choices: {
                    grantPicks: {
                        "class:fighter:skill_proficiency:3:0": "athletics",
                    },
                },
            },
            { characterClass: "wizard" },
            "en"
        );

        expect(selections.choices.grantPicks).toEqual({});
    });

    it("keeps class picks for the active class", () => {
        const selections = sanitizeGrantPicks(
            {
                race: "elf",
                choices: {
                    grantPicks: {
                        "class:fighter:skill_proficiency:3:0": "athletics",
                    },
                },
            },
            { characterClass: "fighter" },
            "en"
        );

        expect(selections.choices.grantPicks).toEqual({
            "class:fighter:skill_proficiency:3:0": "athletics",
        });
    });
});
