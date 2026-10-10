import { getCreationProgressionLevel } from "../lib/character/creationSteps/progressionLevel";
import { readLevelFromForm } from "../lib/character/level";
import { CREATION_PROGRESSION_CAP } from "../lib/character/creationSteps/creationStep.types";

describe("creationProgressionLevel", () => {
    it("caps wizard progression at 5 when level is above cap", () => {
        expect(getCreationProgressionLevel({ level: 8 })).toBe(5);
    });

    it("uses actual level when at or below cap", () => {
        expect(getCreationProgressionLevel({ level: 5 })).toBe(5);
        expect(getCreationProgressionLevel({ level: 2 })).toBe(2);
        expect(getCreationProgressionLevel({ level: 1 })).toBe(1);
    });

    it("defaults to level 1 when missing", () => {
        expect(getCreationProgressionLevel({})).toBe(1);
    });

    it("exports cap constant as 5", () => {
        expect(CREATION_PROGRESSION_CAP).toBe(5);
    });

    it("does not mutate persisted level semantics", () => {
        expect(readLevelFromForm({ level: 5 })).toBe(5);
        expect(getCreationProgressionLevel({ level: 5 })).toBe(5);
    });
});
