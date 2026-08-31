import { buildCreationStepGraph } from "../lib/character/creationSteps/buildCreationStepGraph";
import type {
    CreationMacroGroupId,
    CreationStep,
} from "../lib/character/creationSteps/creationStep.types";

function step(
    id: string,
    macroGroupId: CreationMacroGroupId
): CreationStep {
    return {
        id,
        kind: "selection",
        labelKey: id,
        macroGroupId,
    };
}

describe("buildCreationStepGraph", () => {
    const graph = buildCreationStepGraph([
        step("race", "race"),
        step("class", "class"),
        step("review", "finalize"),
    ]);

    it("indexes steps and reports invalid ids as -1 / undefined", () => {
        expect(graph.getStepIndex("race")).toBe(0);
        expect(graph.getStepIndex("review")).toBe(2);
        expect(graph.getStepIndex("missing")).toBe(-1);
        expect(graph.getStep("class")?.id).toBe("class");
        expect(graph.getStep("missing")).toBeUndefined();
        expect(graph.isValidStepId("class")).toBe(true);
        expect(graph.isValidStepId("missing")).toBe(false);
    });

    it("walks next and previous ids without wrapping past the ends", () => {
        expect(graph.getPrevStepId("race")).toBeUndefined();
        expect(graph.getNextStepId("race")).toBe("class");
        expect(graph.getNextStepId("class")).toBe("review");
        expect(graph.getPrevStepId("review")).toBe("class");
        expect(graph.getNextStepId("review")).toBeUndefined();
        expect(graph.getNextStepId("missing")).toBeUndefined();
        expect(graph.getPrevStepId("missing")).toBeUndefined();
    });

    it("keeps the full macro order even when some groups have no steps", () => {
        expect(graph.macroGroups.map((group) => group.id)).toEqual([
            "levelUp",
            "race",
            "class",
            "background",
            "abilities",
            "spells",
            "finalize",
        ]);
        expect(graph.getMacroGroupForStep("race")).toBe("race");
        expect(graph.getMacroGroupForStep("review")).toBe("finalize");
        expect(graph.getMacroGroupForStep("missing")).toBeUndefined();
        expect(
            graph.macroGroups.find((group) => group.id === "spells")?.stepIds
        ).toEqual([]);
    });

    it("treats an empty list as a graph with no navigable steps", () => {
        const empty = buildCreationStepGraph([]);

        expect(empty.steps).toEqual([]);
        expect(empty.getStepIndex("race")).toBe(-1);
        expect(empty.getNextStepId("race")).toBeUndefined();
        expect(empty.isValidStepId("race")).toBe(false);
    });
});
