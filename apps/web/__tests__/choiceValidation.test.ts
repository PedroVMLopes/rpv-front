import { createDynamicSchema } from "../lib/schema/zodDynamic";
import {
    applyChoiceValidation,
    findInvalidGrantPicks,
    findMissingRequiredChoices,
    findMissingSubclass,
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

const fighterEquipmentPicks = {
    "class:fighter:base:exclusive:starting-wealth": "equipment",
};

const allFighterInventoryPicks = {
    ...fighterEquipmentPicks,
    "class:fighter:base:inventory_item:5:0": "0",
    "class:fighter:base:inventory_item:6:0": "0",
    "class:fighter:base:inventory_item:7:0": "0",
    "class:fighter:base:inventory_item:8:0": "0",
};

describe("findMissingRequiredChoices", () => {
    it("returns dwarf tool proficiency slot when unpicked", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                race: "dwarf",
                choices: {},
            },
            "en",
            "dnd"
        );

        expect(missing.map((choice) => choice.key)).toEqual(
            expect.arrayContaining(["race:dwarf:base:tool_proficiency:0:0"])
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
            "en",
            "dnd"
        );

        expect(missing.map((choice) => choice.key)).toEqual(
            expect.arrayContaining([
                "race:high-elf:base:language:0:0",
                "race:high-elf:base:spell:0:0",
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
            "en",
            "dnd"
        );

        expect(missing.map((choice) => choice.key)).toEqual(
            expect.arrayContaining([
                "class:fighter:base:skill_proficiency:3:0",
                "class:fighter:base:skill_proficiency:3:1",
            ])
        );
    });

    it("requires five wizard L1 spell picks when unpicked", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                characterClass: "wizard",
                choices: {},
            },
            "en",
            "dnd"
        );

        const spellKeys = missing
            .filter((choice) => choice.grant.grantType === "spell")
            .map((choice) => choice.key);

        expect(spellKeys).toHaveLength(5);
        expect(spellKeys).toEqual(
            expect.arrayContaining([
                "class:wizard:1:spell:1:0",
                "class:wizard:1:spell:1:1",
                "class:wizard:1:spell:1:2",
                "class:wizard:1:spell:2:0",
                "class:wizard:1:spell:2:1",
            ])
        );
    });

    it("requires level 3 fighter skill pick when character level is 3", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                level: 3,
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        ...fighterEquipmentPicks,
                        "class:fighter:base:skill_proficiency:3:0": "athletics",
                        "class:fighter:base:skill_proficiency:3:1": "intimidation",
                    },
                },
            },
            "en",
            "dnd"
        );

        expect(missing.map((choice) => choice.key)).toEqual(
            expect.arrayContaining([
                "class:fighter:3:skill_proficiency:0:0",
                "class:fighter:base:inventory_item:5:0",
                "class:fighter:base:inventory_item:6:0",
                "class:fighter:base:inventory_item:7:0",
                "class:fighter:base:inventory_item:8:0",
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
                        ...fighterEquipmentPicks,
                        "race:high-elf:base:language:0:0": "draconic",
                        "race:high-elf:base:spell:0:0": "fire-bolt",
                        "class:fighter:base:skill_proficiency:3:0": "athletics",
                        "class:fighter:base:skill_proficiency:3:1": "intimidation",
                        ...allFighterInventoryPicks,
                    },
                },
            },
            "en",
            "dnd"
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
                        "class:fighter:base:skill_proficiency:3:0": "athletics",
                        "class:fighter:base:skill_proficiency:3:1": "athletics",
                    },
                },
            },
            "en",
            "dnd"
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
                        "class:fighter:base:skill_proficiency:3:0": "history",
                        "class:fighter:base:skill_proficiency:3:1": "athletics",
                    },
                },
            },
            "en",
            "dnd"
        );

        expect(invalid).toContain("alreadyGranted:history");
    });

    it("does not require fighter sidearm before equipment branch is selected", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                characterClass: "fighter",
                choices: {},
            },
            "en",
            "dnd"
        );

        expect(missing.map((choice) => choice.key)).not.toContain(
            "class:fighter:base:inventory_item:8:0"
        );
    });

    it("requires fighter sidearm inventory_item pick when equipment branch is selected", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                characterClass: "fighter",
                choices: {
                    grantPicks: fighterEquipmentPicks,
                },
            },
            "en",
            "dnd"
        );

        expect(missing.map((choice) => choice.key)).toEqual(
            expect.arrayContaining([
                "class:fighter:base:inventory_item:5:0",
                "class:fighter:base:inventory_item:6:0",
                "class:fighter:base:inventory_item:7:0",
                "class:fighter:base:inventory_item:8:0",
            ])
        );
    });

    it("accepts valid fighter sidearm inventory_item pick", () => {
        const missing = findMissingRequiredChoices(
            {
                ...baseFormData,
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        "class:fighter:base:skill_proficiency:3:0": "athletics",
                        "class:fighter:base:skill_proficiency:3:1": "intimidation",
                        ...allFighterInventoryPicks,
                    },
                },
            },
            "en",
            "dnd"
        );

        expect(
            missing.filter((choice) => choice.grant.grantType === "inventory_item")
        ).toEqual([]);
    });

    it("flags invalid inventory_item pick index", () => {
        const invalid = findInvalidGrantPicks(
            {
                ...baseFormData,
                characterClass: "fighter",
                choices: {
                    grantPicks: {
                        ...fighterEquipmentPicks,
                        "class:fighter:base:inventory_item:8:0": "9",
                    },
                },
            },
            "en",
            "dnd"
        );

        expect(invalid).toContain(
            "invalidInventoryPick:class:fighter:base:inventory_item:8:0"
        );
    });
});

describe("findMissingSubclass", () => {
    it("requires subclass for fighter at level 3", () => {
        expect(
            findMissingSubclass(
                {
                    ...baseFormData,
                    level: 3,
                    characterClass: "fighter",
                },
                "en"
            )
        ).toBe(true);
    });

    it("allows missing subclass for fighter at level 2", () => {
        expect(
            findMissingSubclass(
                {
                    ...baseFormData,
                    level: 2,
                    characterClass: "fighter",
                },
                "en"
            )
        ).toBe(false);
    });

    it("passes when subclass matches class at unlock level", () => {
        expect(
            findMissingSubclass(
                {
                    ...baseFormData,
                    level: 3,
                    characterClass: "fighter",
                    subclass: "fighter-champion",
                },
                "en"
            )
        ).toBe(false);
    });
});

describe("applyChoiceValidation", () => {
    const schema = applyChoiceValidation(
        createDynamicSchema(dndCharacterSchema, "player"),
        "en",
        "dnd"
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
                    "race:dwarf:base:tool_proficiency:0:0": "smiths-tools",
                },
            },
        });

        expect(result.success).toBe(true);
    });

    it("rejects levels above 20", () => {
        const result = schema.safeParse({
            ...baseFormData,
            level: 21,
            race: "dwarf",
            choices: {
                grantPicks: {
                    "race:dwarf:base:tool_proficiency:0:0": "smiths-tools",
                },
            },
        });

        expect(result.success).toBe(false);
    });

    it("fails validation when subclass is required but missing", () => {
        const result = schema.safeParse({
            ...baseFormData,
            level: 3,
            characterClass: "fighter",
            race: "elf",
            choices: {
                grantPicks: {
                    "class:fighter:base:skill_proficiency:3:0": "athletics",
                    "class:fighter:base:skill_proficiency:3:1": "intimidation",
                    "class:fighter:3:skill_proficiency:0:0": "history",
                },
            },
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.issues.some((issue) => issue.path[0] === "subclass")
            ).toBe(true);
        }
    });
});
