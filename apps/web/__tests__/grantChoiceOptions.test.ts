import type { PendingChoiceGrant } from "../lib/character/grantChoices";
import {
    buildGrantChoiceSelectOptions,
    findDuplicateGrantPicksInPool,
    findGrantPicksOnOwnedRefs,
    getGrantChoicePoolKey,
    getOtherPickedRefsForGrantType,
} from "../lib/character/grantChoiceOptions";

const fighterSkillChoice: PendingChoiceGrant = {
    key: "class:fighter:skill_proficiency:3:0",
    grant: {
        grantType: "skill_proficiency",
        choose: 2,
        options: [
            { optionType: "skill", ref: "athletics" },
            { optionType: "skill", ref: "history" },
            { optionType: "skill", ref: "intimidation" },
        ],
    },
    source: { type: "class", id: "fighter" },
    label: "Choose two skills. (1/2)",
    options: [
        { value: "athletics", label: "Athletics" },
        { value: "history", label: "History" },
        { value: "intimidation", label: "Intimidation" },
    ],
};

describe("getGrantChoicePoolKey", () => {
    it("groups slots from the same grant", () => {
        expect(getGrantChoicePoolKey("class:fighter:skill_proficiency:3:0")).toBe(
            "class:fighter:skill_proficiency:3"
        );
        expect(getGrantChoicePoolKey("class:fighter:skill_proficiency:3:1")).toBe(
            "class:fighter:skill_proficiency:3"
        );
    });
});

describe("buildGrantChoiceSelectOptions", () => {
    it("marks fixed-grant refs as owned and disabled", () => {
        const options = buildGrantChoiceSelectOptions(
            fighterSkillChoice,
            {},
            new Set(["history"])
        );

        const history = options.find((option) => option.value === "history");
        expect(history).toEqual(
            expect.objectContaining({
                label: "✓ History",
                disabled: true,
                owned: true,
            })
        );
    });

    it("shows a sibling slot pick as disabled with a checkmark in other slots", () => {
        const options = buildGrantChoiceSelectOptions(
            {
                ...fighterSkillChoice,
                key: "class:fighter:skill_proficiency:3:1",
                label: "Choose two skills. (2/2)",
            },
            {
                "class:fighter:skill_proficiency:3:0": "athletics",
            },
            new Set()
        );

        const athletics = options.find((option) => option.value === "athletics");
        expect(athletics).toEqual(
            expect.objectContaining({
                label: "✓ Athletics",
                disabled: true,
                owned: true,
            })
        );
        expect(options.map((option) => option.value)).toContain("history");
    });

    it("keeps the current slot selection enabled even when picked in another slot", () => {
        const options = buildGrantChoiceSelectOptions(
            fighterSkillChoice,
            {
                "class:fighter:skill_proficiency:3:0": "athletics",
                "class:fighter:skill_proficiency:3:1": "athletics",
            },
            new Set()
        );

        const athletics = options.find((option) => option.value === "athletics");
        expect(athletics).toEqual(
            expect.objectContaining({
                label: "Athletics",
                disabled: false,
                owned: false,
            })
        );
    });

    it("shows a language picked in another slot as disabled with a checkmark", () => {
        const highElfLanguageChoice: PendingChoiceGrant = {
            key: "race:high-elf:language:0:0",
            grant: {
                grantType: "language",
                choose: 1,
                selectionFilter: { any: true },
            },
            source: { type: "race", id: "high-elf" },
            label: "Choose 1 language",
            options: [
                { value: "draconic", label: "Draconic" },
                { value: "dwarvish", label: "Dwarvish" },
            ],
        };

        const sageLanguageChoice: PendingChoiceGrant = {
            key: "background:sage:language:0:0",
            grant: {
                grantType: "language",
                choose: 2,
                selectionFilter: { any: true },
            },
            source: { type: "background", id: "sage" },
            label: "Two languages of your choice. (1/2)",
            options: [
                { value: "draconic", label: "Draconic" },
                { value: "dwarvish", label: "Dwarvish" },
            ],
        };

        const otherPicks = getOtherPickedRefsForGrantType(
            "language",
            [highElfLanguageChoice, sageLanguageChoice],
            { "race:high-elf:language:0:0": "draconic" },
            sageLanguageChoice.key
        );

        const options = buildGrantChoiceSelectOptions(
            sageLanguageChoice,
            { "race:high-elf:language:0:0": "draconic" },
            new Set(["common", "elvish"]),
            otherPicks
        );

        expect(options.find((option) => option.value === "draconic")).toEqual(
            expect.objectContaining({
                label: "✓ Draconic",
                disabled: true,
            })
        );
    });

    it("shows picks from other skill_proficiency slots as disabled with a checkmark", () => {
        const level3SkillChoice: PendingChoiceGrant = {
            key: "class:fighter:skill_proficiency:0:0",
            grant: {
                grantType: "skill_proficiency",
                choose: 1,
                description: "Additional skill",
                options: [
                    { optionType: "skill", ref: "athletics" },
                    { optionType: "skill", ref: "perception" },
                ],
            },
            source: { type: "class", id: "fighter" },
            label: "Additional skill (Level 3)",
            options: [
                { value: "athletics", label: "Athletics" },
                { value: "perception", label: "Perception" },
            ],
        };

        const fighterSkillChoice2: PendingChoiceGrant = {
            ...fighterSkillChoice,
            key: "class:fighter:skill_proficiency:3:1",
            label: "Choose two skills. (2/2)",
        };

        const otherPicks = getOtherPickedRefsForGrantType(
            "skill_proficiency",
            [fighterSkillChoice, fighterSkillChoice2, level3SkillChoice],
            {
                "class:fighter:skill_proficiency:3:0": "athletics",
                "class:fighter:skill_proficiency:3:1": "perception",
            },
            level3SkillChoice.key
        );

        const options = buildGrantChoiceSelectOptions(
            level3SkillChoice,
            {},
            new Set(),
            otherPicks
        );

        expect(options.find((option) => option.value === "athletics")).toEqual(
            expect.objectContaining({
                label: "✓ Athletics",
                disabled: true,
            })
        );
        expect(options.find((option) => option.value === "perception")).toEqual(
            expect.objectContaining({
                label: "✓ Perception",
                disabled: true,
            })
        );
    });

    it("keeps a selected ref visible even when it is missing from choice.options", () => {
        const options = buildGrantChoiceSelectOptions(
            fighterSkillChoice,
            { "class:fighter:skill_proficiency:3:0": "survival" },
            new Set()
        );

        expect(options.find((option) => option.value === "survival")).toEqual(
            expect.objectContaining({
                value: "survival",
                disabled: false,
            })
        );
    });
});

describe("findDuplicateGrantPicksInPool", () => {
    it("detects duplicate picks within the same grant pool", () => {
        const duplicates = findDuplicateGrantPicksInPool(
            [
                fighterSkillChoice,
                {
                    ...fighterSkillChoice,
                    key: "class:fighter:skill_proficiency:3:1",
                },
            ],
            {
                "class:fighter:skill_proficiency:3:0": "athletics",
                "class:fighter:skill_proficiency:3:1": "athletics",
            }
        );

        expect(duplicates).toEqual([
            expect.objectContaining({
                ref: "athletics",
                keys: [
                    "class:fighter:skill_proficiency:3:0",
                    "class:fighter:skill_proficiency:3:1",
                ],
            }),
        ]);
    });
});

describe("findGrantPicksOnOwnedRefs", () => {
    it("detects picks that repeat a fixed-grant ref", () => {
        const invalid = findGrantPicksOnOwnedRefs(
            [fighterSkillChoice],
            { "class:fighter:skill_proficiency:3:0": "history" },
            new Map([["skill_proficiency", new Set(["history"])]])
        );

        expect(invalid).toEqual([
            expect.objectContaining({
                key: "class:fighter:skill_proficiency:3:0",
                ref: "history",
            }),
        ]);
    });
});
