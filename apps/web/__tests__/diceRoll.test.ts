import { ROLLABLE_DICE, rollDie } from "../lib/roll/diceRoll";

describe("rollDie", () => {
    it("returns a value within the die range", () => {
        for (const sides of ROLLABLE_DICE) {
            const value = rollDie(sides, () => 0.5);
            expect(value).toBeGreaterThanOrEqual(1);
            expect(value).toBeLessThanOrEqual(sides);
        }
    });

    it("uses the injected rng", () => {
        expect(rollDie(20, () => 0)).toBe(1);
        expect(rollDie(20, () => 0.999)).toBe(20);
        expect(rollDie(6, () => 0.5)).toBe(4);
    });
});
