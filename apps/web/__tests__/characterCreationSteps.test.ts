import {
    getFirstErrorStepId,
    resolveCreationGraph,
} from "../lib/character/characterCreationSteps";
import { dndStatConfig } from "../presets/dnd/characterStats";

describe("characterCreationSteps navigation helpers", () => {
    it("resolves the first validation error to a semantic step id", () => {
        const graph = resolveCreationGraph(
            { race: "elf", characterClass: "wizard", level: 1 },
            "dnd",
            "en"
        );

        const stepId = getFirstErrorStepId(
            {
                choices: {
                    "class:wizard:1:spell:1:0": { message: "Invalid" },
                },
            },
            graph,
            {
                formData: { race: "elf", characterClass: "wizard", level: 1 },
                locale: "en",
                system: "dnd",
            }
        );

        expect(stepId).toBe("class-level-1-cantrips");
    });

    it("maps background field errors to the background step", () => {
        const graph = resolveCreationGraph({}, "dnd", "en");

        const stepId = getFirstErrorStepId(
            {
                background: { message: "Required" },
            },
            graph
        );

        expect(stepId).toBe("background");
    });

    it("builds a dynamic graph for wizard level 3", () => {
        const graph = resolveCreationGraph(
            {
                race: "elf",
                subrace: "high-elf",
                characterClass: "wizard",
                level: 3,
            },
            "dnd",
            "en"
        );

        expect(graph.isValidStepId("class-level-3")).toBe(true);
        expect(graph.getStep("finalize")?.kind).toBe("finalize");
    });
});

describe("legacy stat config compatibility", () => {
    it("still exposes dnd stat config for ability tests", () => {
        expect(dndStatConfig.abilities.length).toBeGreaterThan(0);
    });
});
