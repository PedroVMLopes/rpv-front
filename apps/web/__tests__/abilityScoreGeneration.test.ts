import {
    defaultAbilityScoreMethodForLevel,
    shouldShowMigrationHint,
} from "../lib/character/abilityScoreGeneration";

describe("abilityScoreGeneration helpers", () => {
    it("defaults L1 to standard array and higher levels to manual", () => {
        expect(defaultAbilityScoreMethodForLevel(1)).toBe("standard-array");
        expect(defaultAbilityScoreMethodForLevel(3)).toBe("manual");
    });

    it("shows migration hint only for manual above L1", () => {
        expect(shouldShowMigrationHint(1, "manual")).toBe(false);
        expect(shouldShowMigrationHint(3, "manual")).toBe(true);
        expect(shouldShowMigrationHint(3, "standard-array")).toBe(false);
    });
});
