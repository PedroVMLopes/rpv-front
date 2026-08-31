import {
    mergeCharacterSession,
    sanitizeCharacterSession,
} from "../lib/character/session";

describe("sanitizeCharacterSession", () => {
    it("drops empty or invalid concentration", () => {
        expect(sanitizeCharacterSession({})).toBeUndefined();
        expect(
            sanitizeCharacterSession({ concentratingOn: { slug: "  " } })
        ).toBeUndefined();
        expect(
            sanitizeCharacterSession({ concentratingOn: null })
        ).toBeUndefined();
    });

    it("keeps a valid concentration slug and slot", () => {
        expect(
            sanitizeCharacterSession({
                concentratingOn: { slug: " detect-magic ", slotLevel: 2.8 },
            })
        ).toEqual({
            concentratingOn: { slug: "detect-magic", slotLevel: 2 },
        });
    });

    it("keeps unique condition slugs", () => {
        expect(
            sanitizeCharacterSession({
                activeConditions: [" blessed ", "blessed", "poisoned"],
            })
        ).toEqual({
            activeConditions: ["blessed", "poisoned"],
        });
    });

    it("keeps temp HP and death-save pips", () => {
        expect(
            sanitizeCharacterSession({
                tempHp: 5.8,
                deathSaves: { successes: 2.2, failures: 1 },
            })
        ).toEqual({
            tempHp: 5,
            deathSaves: { successes: 2, failures: 1 },
        });
    });

    it("drops zero temp HP and empty death saves", () => {
        expect(
            sanitizeCharacterSession({
                tempHp: 0,
                deathSaves: { successes: 0, failures: 0 },
            })
        ).toBeUndefined();
    });

    it("clamps death-save pips to 0..3 and drops out-of-range slot levels", () => {
        expect(
            sanitizeCharacterSession({
                concentratingOn: { slug: "bless", slotLevel: 10 },
                deathSaves: { successes: 9, failures: -1 },
            })
        ).toEqual({
            concentratingOn: { slug: "bless" },
            deathSaves: { successes: 3, failures: 0 },
        });
        expect(
            sanitizeCharacterSession({
                concentratingOn: { slug: "bless", slotLevel: 0 },
            })
        ).toEqual({
            concentratingOn: { slug: "bless" },
        });
    });

    it("drops non-string condition entries", () => {
        expect(
            sanitizeCharacterSession({
                activeConditions: ["poisoned", 1, null, "  "] as unknown as string[],
            })
        ).toEqual({
            activeConditions: ["poisoned"],
        });
    });

    it("keeps meta points and clamps inspiration to 0..1", () => {
        expect(
            sanitizeCharacterSession({
                metaPoints: { inspiration: 1.8, luck: 3 },
            })
        ).toEqual({
            metaPoints: { inspiration: 1, luck: 3 },
        });
    });

    it("drops zero meta points", () => {
        expect(
            sanitizeCharacterSession({
                metaPoints: { inspiration: 0 },
            })
        ).toBeUndefined();
    });
});

describe("mergeCharacterSession", () => {
    it("replaces concentration and can clear it", () => {
        const current = {
            concentratingOn: { slug: "detect-magic", slotLevel: 1 },
        };

        expect(
            mergeCharacterSession(current, {
                concentratingOn: { slug: "bless", slotLevel: 2 },
            })
        ).toEqual({
            concentratingOn: { slug: "bless", slotLevel: 2 },
        });

        expect(
            mergeCharacterSession(current, { concentratingOn: null })
        ).toBeUndefined();
    });

    it("replaces conditions without dropping concentration", () => {
        const current = {
            concentratingOn: { slug: "detect-magic", slotLevel: 1 },
            activeConditions: ["poisoned"],
        };

        expect(
            mergeCharacterSession(current, {
                activeConditions: ["blessed", "poisoned"],
            })
        ).toEqual({
            concentratingOn: { slug: "detect-magic", slotLevel: 1 },
            activeConditions: ["blessed", "poisoned"],
        });
    });

    it("clears temp HP and death saves without dropping concentration", () => {
        const current = {
            concentratingOn: { slug: "detect-magic", slotLevel: 1 },
            tempHp: 8,
            deathSaves: { successes: 1, failures: 2 },
        };

        expect(
            mergeCharacterSession(current, { tempHp: 0, deathSaves: null })
        ).toEqual({
            concentratingOn: { slug: "detect-magic", slotLevel: 1 },
        });
    });

    it("merges meta points by ref", () => {
        expect(
            mergeCharacterSession(
                { metaPoints: { inspiration: 1 } },
                { metaPoints: { inspiration: 0 } }
            )
        ).toBeUndefined();

        expect(
            mergeCharacterSession(undefined, { metaPoints: { inspiration: 1 } })
        ).toEqual({
            metaPoints: { inspiration: 1 },
        });
    });
});
