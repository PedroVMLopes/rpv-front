import { resolveCreationSteps } from "../lib/character/creationSteps/resolveCreationSteps";
import { mapGrantPickToStep } from "../lib/character/creationSteps/mapGrantPickToStep";

describe("mapGrantPickToStep", () => {
    const wizardL3Graph = resolveCreationSteps({
        formValues: {
            race: "elf",
            subrace: "high-elf",
            characterClass: "wizard",
            level: 3,
        },
        system: "dnd",
        contentLocale: "en",
    });

    it("maps racial cantrip picks to race-cantrips", () => {
        expect(
            mapGrantPickToStep(
                "race:high-elf:base:spell:0:0",
                {
                    grantType: "spell",
                    choose: 1,
                    selectionFilter: { levelInt: 0 },
                },
                wizardL3Graph
            )
        ).toBe("race-cantrips");
    });

    it("maps wizard L1 cantrip picks to class-level-1-cantrips", () => {
        expect(
            mapGrantPickToStep(
                "class:wizard:1:spell:1:0",
                {
                    grantType: "spell",
                    choose: 3,
                    selectionFilter: { spellLists: ["wizard"], levelInt: 0 },
                },
                wizardL3Graph
            )
        ).toBe("class-level-1-cantrips");
    });

    it("maps fighter skill picks to class-level-1-choices", () => {
        const fighterGraph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "fighter",
                level: 1,
            },
            system: "dnd",
            contentLocale: "en",
        });

        expect(
            mapGrantPickToStep(
                "class:fighter:base:skill_proficiency:3:0",
                {
                    grantType: "skill_proficiency",
                    choose: 2,
                },
                fighterGraph
            )
        ).toBe("class-level-1-choices");
    });

    it("maps inventory picks to equipment", () => {
        expect(
            mapGrantPickToStep("class:fighter:base:inventory_item:0:0")
        ).toBe("equipment");
    });

    it("maps L4 spell keys to class-level-4-spells even when absent from wizard graph", () => {
        expect(
            mapGrantPickToStep(
                "class:wizard:4:spell:0:0",
                {
                    grantType: "spell",
                    choose: 1,
                    selectionFilter: { spellLists: ["wizard"], levelInt: 1 },
                },
                wizardL3Graph
            )
        ).toBe("class-level-4-spells");
    });
});
