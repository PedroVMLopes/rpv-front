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
});
