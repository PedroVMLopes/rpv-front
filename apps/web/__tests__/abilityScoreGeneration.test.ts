import {
    assignStandardArrayScore,
    assignRollScore,
    defaultAbilityScoreMethodForLevel,
    getMethodDefaults,
    rollAbilityPool,
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

    it("assigns duplicate roll scores without swapping while pool allows it", () => {
        const pool = [14, 14, 15, 13, 12, 10];
        const values = [14, 0, 0, 0, 0, 0];
        expect(assignRollScore(values, 1, 14, pool)).toEqual([
            14, 14, 0, 0, 0, 0,
        ]);
    });

    it("swaps roll scores when the pool count is exhausted", () => {
        const pool = [14, 14, 15, 13, 12, 10];
        const values = [14, 14, 0, 0, 0, 0];
        expect(assignRollScore(values, 2, 14, pool)).toEqual([
            0, 14, 14, 0, 0, 0,
        ]);
    });

    it("returns rolled pools sorted descending", () => {
        let call = 0;
        const rng = () => {
            // Produce varied d6 faces so the six ability scores differ.
            const sequence = [0.1, 0.2, 0.3, 0.9, 0.5, 0.6, 0.7, 0.8, 0.4, 0.15, 0.25, 0.95, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.05, 0.12, 0.22, 0.32, 0.42, 0.52];
            const value = sequence[call % sequence.length]!;
            call += 1;
            return value;
        };

        const pool = rollAbilityPool(dndStatConfig.abilityGeneration!, rng);
        expect(pool).toHaveLength(6);
        expect(pool).toEqual([...pool].sort((a, b) => b - a));
    });
});
