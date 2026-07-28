import {
    assignStandardArrayScore,
    defaultAbilityScoreMethodForLevel,
    getMethodDefaults,
    shouldShowMigrationHint,
    standardArrayParkingValue,
} from "../lib/character/abilityScoreGeneration";
import { dndStatConfig } from "../presets/dnd/characterStats";

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

    it("uses the minimum standard array value as parking", () => {
        expect(
            standardArrayParkingValue(dndStatConfig.abilityGeneration!)
        ).toBe(8);
    });

    it("defaults standard-array attributes to the parking value", () => {
        const defaults = getMethodDefaults(
            "standard-array",
            dndStatConfig.abilities,
            dndStatConfig
        );

        expect(defaults).toEqual(
            dndStatConfig.abilities.map((ability) => ({
                name: ability.name,
                value: 8,
            }))
        );
    });

    it("assigns a free standard array score without swapping", () => {
        const values = [8, 8, 8, 8, 8, 8];
        expect(assignStandardArrayScore(values, 0, 15)).toEqual([
            15, 8, 8, 8, 8, 8,
        ]);
    });

    it("swaps when selecting a score already held elsewhere, including 8", () => {
        const values = [15, 14, 8, 8, 8, 8];
        expect(assignStandardArrayScore(values, 0, 8)).toEqual([
            8, 14, 15, 8, 8, 8,
        ]);
    });

    it("swaps when selecting a score already held elsewhere", () => {
        const values = [15, 8, 8, 8, 8, 8];
        expect(assignStandardArrayScore(values, 1, 15)).toEqual([
            8, 15, 8, 8, 8, 8,
        ]);
    });

    it("is a no-op when selecting the current score", () => {
        const values = [15, 8, 8, 8, 8, 8];
        expect(assignStandardArrayScore(values, 0, 15)).toBe(values);
    });
});
