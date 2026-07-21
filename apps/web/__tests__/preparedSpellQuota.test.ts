import {
    computePreparedSpellQuota,
    prunePreparedSpellsToQuota,
} from "../lib/character/preparedSpellQuota";

describe("computePreparedSpellQuota", () => {
    it("adds ability modifier to level", () => {
        // INT 16 → +3; level 1 → 4
        expect(
            computePreparedSpellQuota({
                characterLevel: 1,
                abilityScore: 16,
                system: "dnd",
            })
        ).toBe(4);
    });

    it("floors at 1 when modifier is negative", () => {
        // INT 8 → −1; level 1 → 0 → floor 1
        expect(
            computePreparedSpellQuota({
                characterLevel: 1,
                abilityScore: 8,
                system: "dnd",
            })
        ).toBe(1);
    });

    it("scales with character level", () => {
        // INT 14 → +2; level 5 → 7
        expect(
            computePreparedSpellQuota({
                characterLevel: 5,
                abilityScore: 14,
                system: "dnd",
            })
        ).toBe(7);
    });
});

describe("prunePreparedSpellsToQuota", () => {
    it("keeps a stable prefix when over quota", () => {
        expect(
            prunePreparedSpellsToQuota(
                ["a", "b", "c", "d", "e"],
                3
            )
        ).toEqual(["a", "b", "c"]);
    });

    it("returns the same list when within quota", () => {
        const list = ["a", "b"];
        expect(prunePreparedSpellsToQuota(list, 3)).toEqual(["a", "b"]);
    });

    it("returns undefined when prepared is undefined", () => {
        expect(prunePreparedSpellsToQuota(undefined, 3)).toBeUndefined();
    });
});
