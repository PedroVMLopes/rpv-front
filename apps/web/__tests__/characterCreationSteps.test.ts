import {
    canCompleteStep,
    computeMaxUnlockedStep,
    getFirstErrorStepIndex,
    getStepIndexForField,
    getStepIndexForGrantPickKey,
    getStepIndexForValidationPath,
    CHARACTER_CREATION_STEP_COUNT,
} from "../lib/character/characterCreationSteps";
import { dndStatConfig } from "../presets/dnd/characterStats";

describe("characterCreationSteps", () => {
    it("always allows any step to complete", () => {
        expect(canCompleteStep("race", {})).toBe(true);
        expect(canCompleteStep("class", {})).toBe(true);
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
        ).toBe(true);
        expect(canCompleteStep("background", {})).toBe(true);
        expect(canCompleteStep("equipment", {})).toBe(true);
    });

    it("unlocks all steps immediately", () => {
        expect(computeMaxUnlockedStep({})).toBe(CHARACTER_CREATION_STEP_COUNT - 1);
        expect(computeMaxUnlockedStep({ race: "elf" })).toBe(
            CHARACTER_CREATION_STEP_COUNT - 1
        );
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

    it("routes choice errors with keys to the matching step", () => {
        expect(
            getStepIndexForValidationPath([
                "choices",
                "class:fighter:base:skill_proficiency:0:0",
            ])
        ).toBe(1);
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
