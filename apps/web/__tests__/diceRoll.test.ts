import {
    ROLLABLE_DICE,
    combineD100,
    formatD100TensLabel,
    rollDie,
} from "../lib/roll/diceRoll";

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

describe("combineD100", () => {
    it("sums tens and units for results from 1 to 99", () => {
        expect(combineD100(0, 1)).toBe(1);
        expect(combineD100(0, 9)).toBe(9);
        expect(combineD100(50, 5)).toBe(55);
        expect(combineD100(90, 9)).toBe(99);
    });

    it("treats 00 tens and 0 units as 100", () => {
        expect(combineD100(0, 0)).toBe(100);
    });
});

describe("formatD100TensLabel", () => {
    it("displays 00 for zero tens", () => {
        expect(formatD100TensLabel(0)).toBe("00");
        expect(formatD100TensLabel(50)).toBe("50");
    });
});
