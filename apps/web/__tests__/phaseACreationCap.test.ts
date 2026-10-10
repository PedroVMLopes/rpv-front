import { resolveSpellcastingProfile } from "@rpv/content";
import { CREATION_PROGRESSION_CAP } from "../lib/character/creationSteps/creationStep.types";
import { getCreationProgressionLevel } from "../lib/character/creationSteps/progressionLevel";
import { resolveCreationSteps } from "../lib/character/creationSteps/resolveCreationSteps";

describe("Phase A creation progression", () => {
    it("walks class levels through 5 during creation", () => {
        expect(CREATION_PROGRESSION_CAP).toBe(5);
        expect(getCreationProgressionLevel({ level: 5 })).toBe(5);

        const graph = resolveCreationSteps({
            formValues: {
                race: "human",
                characterClass: "wizard",
                subclass: "wizard-illusion",
                level: 5,
                background: "sage",
            },
            system: "dnd",
            contentLocale: "en",
        });

        const stepIds = graph.steps.map((step) => step.id);
        expect(stepIds.some((id) => id.startsWith("class-level-1"))).toBe(true);
        expect(stepIds).toEqual(
            expect.arrayContaining([
                "class-level-2",
                "class-level-3",
                "class-level-4",
                "class-level-5",
            ])
        );
    });

    it("exposes Arcane Trickster casting on the sheet profile helpers", () => {
        expect(
            resolveSpellcastingProfile("rogue", "rogue-arcane-trickster").ability
        ).toBe("intelligence");
    });
});
