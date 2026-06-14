import { dndStatConfig } from "../presets/dnd/characterStats";
import {
    getMethodDefaults,
    isPointBuyValid,
    isRollValid,
    isStandardArrayValid,
    pointBuyCost,
    pointBuyRemaining,
    pointBuySpent,
    rollAbilityPool,
    rollAbilityScore,
    UNASSIGNED_ABILITY_VALUE,
} from "../lib/character/abilityScoreGeneration";

const generation = dndStatConfig.abilityGeneration!;

describe("point buy", () => {
    it("calculates cost from the D&D table", () => {
        expect(pointBuyCost(8, generation.pointBuy)).toBe(0);
        expect(pointBuyCost(15, generation.pointBuy)).toBe(9);
    });

    it("tracks spent and remaining points", () => {
        const values = [15, 14, 13, 12, 10, 8];
        expect(pointBuySpent(values, generation.pointBuy)).toBe(27);
        expect(pointBuyRemaining(values, generation.pointBuy)).toBe(0);
    });

    it("rejects over-budget and out-of-range values", () => {
        expect(isPointBuyValid([15, 15, 13, 12, 10, 8], generation.pointBuy)).toBe(
            false
        );
        expect(isPointBuyValid([16, 14, 13, 12, 10, 8], generation.pointBuy)).toBe(
            false
        );
        expect(isPointBuyValid([15, 14, 13, 12, 10, 8], generation.pointBuy)).toBe(
            true
        );
    });
});

describe("standard array", () => {
    it("accepts a complete permutation", () => {
        expect(
            isStandardArrayValid([15, 14, 13, 12, 10, 8], generation)
        ).toBe(true);
        expect(
            isStandardArrayValid([8, 10, 12, 13, 14, 15], generation)
        ).toBe(true);
    });

    it("rejects incomplete or duplicate assignments", () => {
        expect(
            isStandardArrayValid(
                [15, 14, 13, 12, 10, UNASSIGNED_ABILITY_VALUE],
                generation
            )
        ).toBe(false);
        expect(
            isStandardArrayValid([15, 15, 13, 12, 10, 8], generation)
        ).toBe(false);
    });
});

describe("roll generation", () => {
    it("rolls 4d6 drop lowest with deterministic rng", () => {
        const rngValues = [0, 0.99, 0.5, 0.25];
        let index = 0;
        const rng = () => rngValues[index++ % rngValues.length];

        const score = rollAbilityScore(generation.roll, rng);
        expect(score).toBeGreaterThanOrEqual(3);
        expect(score).toBeLessThanOrEqual(18);
    });

    it("returns the configured number of rolled scores", () => {
        const pool = rollAbilityPool(generation, () => 0.5);
        expect(pool).toHaveLength(6);
        pool.forEach((score) => {
            expect(score).toBeGreaterThanOrEqual(3);
            expect(score).toBeLessThanOrEqual(18);
        });
    });

    it("validates roll assignments against the pool", () => {
        const rolls = [16, 14, 13, 12, 11, 9];
        expect(isRollValid([16, 14, 13, 12, 11, 9], rolls, generation)).toBe(
            true
        );
        expect(
            isRollValid(
                [16, 14, 13, 12, 11, UNASSIGNED_ABILITY_VALUE],
                rolls,
                generation
            )
        ).toBe(false);
        expect(isRollValid([16, 16, 13, 12, 11, 9], rolls, generation)).toBe(
            false
        );
    });
});

describe("getMethodDefaults", () => {
    it("seeds values per method", () => {
        expect(
            getMethodDefaults("manual", dndStatConfig.abilities, dndStatConfig).map(
                (entry) => entry.value
            )
        ).toEqual([10, 10, 10, 10, 10, 10]);

        expect(
            getMethodDefaults(
                "point-buy",
                dndStatConfig.abilities,
                dndStatConfig
            ).map((entry) => entry.value)
        ).toEqual([8, 8, 8, 8, 8, 8]);

        expect(
            getMethodDefaults(
                "standard-array",
                dndStatConfig.abilities,
                dndStatConfig
            ).map((entry) => entry.value)
        ).toEqual([
            UNASSIGNED_ABILITY_VALUE,
            UNASSIGNED_ABILITY_VALUE,
            UNASSIGNED_ABILITY_VALUE,
            UNASSIGNED_ABILITY_VALUE,
            UNASSIGNED_ABILITY_VALUE,
            UNASSIGNED_ABILITY_VALUE,
        ]);
    });
});
