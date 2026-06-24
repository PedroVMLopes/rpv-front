import {
    averageHitDieGain,
    deriveDndMaxHp,
    formatDndHpBreakdown,
} from "../presets/dnd/hp";

describe("deriveDndMaxHp", () => {
    it("returns undefined when class or hit die is missing", () => {
        expect(
            deriveDndMaxHp({
                level: 1,
                constitution: 14,
            })
        ).toBeUndefined();

        expect(
            deriveDndMaxHp({
                level: 1,
                constitution: 14,
                classSlug: "fighter",
            })
        ).toBeUndefined();
    });

    it("returns undefined for invalid level", () => {
        expect(
            deriveDndMaxHp({
                level: 0,
                constitution: 14,
                classSlug: "fighter",
                hitDie: 10,
            })
        ).toBeUndefined();
    });

    it("computes level 1 HP for each hit die", () => {
        expect(
            deriveDndMaxHp({
                level: 1,
                constitution: 14,
                classSlug: "fighter",
                hitDie: 10,
            })
        ).toBe(12);

        expect(
            deriveDndMaxHp({
                level: 1,
                constitution: 14,
                classSlug: "wizard",
                hitDie: 6,
            })
        ).toBe(8);

        expect(
            deriveDndMaxHp({
                level: 1,
                constitution: 14,
                classSlug: "rogue",
                hitDie: 8,
            })
        ).toBe(10);

        expect(
            deriveDndMaxHp({
                level: 1,
                constitution: 14,
                classSlug: "cleric",
                hitDie: 8,
            })
        ).toBe(10);
    });

    it("computes multi-level HP using the average method", () => {
        expect(
            deriveDndMaxHp({
                level: 3,
                constitution: 14,
                classSlug: "fighter",
                hitDie: 10,
            })
        ).toBe(28);
    });

    it("clamps each level contribution to a minimum of 1", () => {
        expect(
            deriveDndMaxHp({
                level: 1,
                constitution: 8,
                classSlug: "wizard",
                hitDie: 6,
            })
        ).toBe(5);

        expect(
            deriveDndMaxHp({
                level: 3,
                constitution: 0,
                classSlug: "wizard",
                hitDie: 6,
            })
        ).toBe(3);
    });

    it("formats a readable breakdown", () => {
        expect(
            formatDndHpBreakdown({
                level: 3,
                constitution: 14,
                classSlug: "fighter",
                hitDie: 10,
            })
        ).toBe("d10 + CON +2 at L1, +8 x 2 = 28");
    });
});

describe("averageHitDieGain", () => {
    it("returns the fixed/average gain per level", () => {
        expect(averageHitDieGain(6)).toBe(4);
        expect(averageHitDieGain(8)).toBe(5);
        expect(averageHitDieGain(10)).toBe(6);
        expect(averageHitDieGain(12)).toBe(7);
    });
});
