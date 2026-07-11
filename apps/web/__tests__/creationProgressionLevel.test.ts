import { getCreationProgressionLevel } from "../lib/character/creationSteps/progressionLevel";
import { readLevelFromForm } from "../lib/character/level";
import { CREATION_PROGRESSION_CAP } from "../lib/character/creationSteps/creationStep.types";

describe("creationProgressionLevel", () => {
    it("caps wizard progression at 3 when level is 5", () => {
        expect(getCreationProgressionLevel({ level: 5 })).toBe(3);
    });

    it("uses actual level when below cap", () => {
        expect(getCreationProgressionLevel({ level: 2 })).toBe(2);
        expect(getCreationProgressionLevel({ level: 1 })).toBe(1);
    });

    it("defaults to level 1 when missing", () => {
        expect(getCreationProgressionLevel({})).toBe(1);
    });

    it("exports cap constant as 3", () => {
        expect(CREATION_PROGRESSION_CAP).toBe(3);
    });

    it("does not mutate persisted level semantics", () => {
        expect(readLevelFromForm({ level: 5 })).toBe(5);
        expect(getCreationProgressionLevel({ level: 5 })).toBe(3);
    });
});
