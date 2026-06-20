import { createDynamicSchema } from "../lib/schema/zodDynamic";
import {
    applyChoiceValidation,
    findInvalidGrantPicks,
    findMissingRequiredChoices,
} from "../lib/character/choiceValidation";
import { dndCharacterSchema } from "../presets/dnd/characterSchema";

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

describe("findMissingRequiredChoices", () => {
    it("returns dwarf tool proficiency slot when unpicked", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                race: "dwarf",
                choices: {},
            },
            "en"
        );

        expect(missing.map((choice) => choice.key)).toEqual(
            expect.arrayContaining(["race:dwarf:tool_proficiency:0:0"])
        );
    });

    it("returns high elf language and spell slots when unpicked", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                race: "elf",
                subrace: "high-elf",
                choices: {},
            },
            "en"
        );

        expect(missing.map((choice) => choice.key)).toEqual(
            expect.arrayContaining([
                "race:high-elf:language:0:0",
                "race:high-elf:spell:0:0",
            ])
        );
    });

    it("returns fighter skill slots when unpicked", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                race: "elf",
                characterClass: "fighter",
                choices: {},
            },
            "en"
        );

        expect(missing.map((choice) => choice.key)).toEqual(
            expect.arrayContaining([
                "class:fighter:skill_proficiency:3:0",
                "class:fighter:skill_proficiency:3:1",
            ])
        );
    });

    it("returns empty when all required picks are filled", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                race: "elf",
                subrace: "high-elf",
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "race:high-elf:language:0:0": "draconic",
                        "race:high-elf:spell:0:0": "fire-bolt",
                        "class:fighter:skill_proficiency:3:0": "athletics",
                        "class:fighter:skill_proficiency:3:1": "intimidation",
                    },
                },
            },
            "en"
        );

        expect(missing).toEqual([]);
    });

    it("flags duplicate skill picks in the same class pool", () => {
        const invalid = findInvalidGrantPicks(
            {
                ...baseFormData,
                race: "elf",
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:skill_proficiency:3:0": "athletics",
                        "class:fighter:skill_proficiency:3:1": "athletics",
                    },
                },
            },
            "en"
        );

        expect(invalid).toContain("duplicateGrantPick:athletics");
    });

    it("flags skill picks that repeat a fixed background proficiency", () => {
        const invalid = findInvalidGrantPicks(
            {
                ...baseFormData,
                race: "elf",
                background: "sage",
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:skill_proficiency:3:0": "history",
                        "class:fighter:skill_proficiency:3:1": "athletics",
                    },
                },
            },
            "en"
        );

        expect(invalid).toContain("alreadyGranted:history");
    });
});

describe("applyChoiceValidation", () => {
    const schema = applyChoiceValidation(
        createDynamicSchema(dndCharacterSchema, "player"),
        "en"
    );

    it("fails validation when required grant picks are missing", () => {
        const result = schema.safeParse({
            ...baseFormData,
            race: "dwarf",
            choices: {},
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.path[0] === "choices")).toBe(
                true
            );
        }
    });

    it("passes validation when required grant picks are filled", () => {
        const result = schema.safeParse({
            ...baseFormData,
            race: "dwarf",
            choices: {
                grantPicks: {
                    "race:dwarf:tool_proficiency:0:0": "smiths-tools",
                },
            },
        });

        expect(result.success).toBe(true);
    });
});
