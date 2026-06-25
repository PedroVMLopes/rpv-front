import {
    canCompleteStep,
    computeMaxUnlockedStep,
    getFirstErrorStepIndex,
    getStepIndexForField,
    getStepIndexForGrantPickKey,
} from "../lib/character/characterCreationSteps";
import { dndStatConfig } from "../presets/dnd/characterStats";

describe("characterCreationSteps", () => {
    it("requires race before race step can complete", () => {
        expect(canCompleteStep("race", {})).toBe(false);
        expect(canCompleteStep("race", { race: "elf" })).toBe(true);
    });

    it("requires class before class step can complete", () => {
        expect(canCompleteStep("class", { race: "elf" })).toBe(false);
        expect(
            canCompleteStep("class", { race: "elf", characterClass: "wizard" })
        ).toBe(true);
    });

    it("requires valid ability scores before abilities step can complete", () => {
        expect(
            canCompleteStep(
                "abilities",
                {
                    abilityScoreMethod: "standard-array",
                    attributes: dndStatConfig.abilities.map((ability) => ({
                        name: ability.name,
                        value: 0,
                    })),
                },
                { statConfig: dndStatConfig }
            )
        ).toBe(false);

        expect(
            canCompleteStep(
                "abilities",
                {
                    abilityScoreMethod: "standard-array",
                    attributes: [
                        { name: "strength", value: 15 },
                        { name: "dexterity", value: 14 },
                        { name: "constitution", value: 13 },
                        { name: "intelligence", value: 12 },
                        { name: "wisdom", value: 10 },
                        { name: "charisma", value: 8 },
                    ],
                },
                { statConfig: dndStatConfig }
            )
        ).toBe(true);
    });

    it("always allows abilities step to complete without stat config", () => {
        expect(canCompleteStep("abilities", {})).toBe(true);
    });

    it("requires background before background step can complete", () => {
        expect(canCompleteStep("background", {})).toBe(false);
        expect(canCompleteStep("background", { background: "sage" })).toBe(true);
    });

    it("computes max unlocked step from primary selections", () => {
        expect(computeMaxUnlockedStep({})).toBe(0);
        expect(computeMaxUnlockedStep({ race: "elf" })).toBe(1);
        expect(
            computeMaxUnlockedStep({
                race: "elf",
                characterClass: "wizard",
            })
        ).toBe(3);
        expect(
            computeMaxUnlockedStep({
                race: "elf",
                characterClass: "wizard",
                background: "sage",
            })
        ).toBe(4);
    });

    it("maps level field to class step index", () => {
        expect(getStepIndexForField("level")).toBe(1);
    });

    it("maps validation paths to step indexes", () => {
        expect(getStepIndexForField("race")).toBe(0);
        expect(getStepIndexForField("characterClass")).toBe(1);
        expect(getStepIndexForField("attributes")).toBe(2);
        expect(getStepIndexForField("background")).toBe(3);
        expect(getStepIndexForField("gold")).toBe(4);
    });

    it("maps grant pick keys to step indexes", () => {
        expect(getStepIndexForGrantPickKey("race:dwarf:base:tool_proficiency:0:0")).toBe(
            0
        );
        expect(getStepIndexForGrantPickKey("class:wizard:1:spell:2:0")).toBe(1);
        expect(getStepIndexForGrantPickKey("background:sage:base:language:0:0")).toBe(
            3
        );
        expect(
            getStepIndexForGrantPickKey(
                "class:fighter:base:exclusive:starting-wealth"
            )
        ).toBe(4);
    });

    it("finds the earliest step with form errors", () => {
        expect(
            getFirstErrorStepIndex({
                name: { message: "Required" },
                choices: { message: "Incomplete" },
            })
        ).toBe(3);
    });
});
