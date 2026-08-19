import { normalizeSpellActionCost } from "../src/spell/castingTime";

describe("normalizeSpellActionCost", () => {
    it("classifies bonus action before the generic action substring", () => {
        expect(normalizeSpellActionCost("1 bonus action")).toBe("bonus_action");
        expect(normalizeSpellActionCost("Bonus Action")).toBe("bonus_action");
    });

    it("classifies standard action, reaction, and timed casts", () => {
        expect(normalizeSpellActionCost("1 action")).toBe("action");
        expect(normalizeSpellActionCost("1 reaction")).toBe("reaction");
        expect(normalizeSpellActionCost("1 minute")).toBe("minute");
        expect(normalizeSpellActionCost("10 minutes")).toBe("minute");
        expect(normalizeSpellActionCost("1 hour")).toBe("hour");
        expect(normalizeSpellActionCost("8 hours")).toBe("hour");
    });

    it("falls back to special for unknown or empty casting times", () => {
        expect(normalizeSpellActionCost("instantaneous")).toBe("special");
        expect(normalizeSpellActionCost("  ")).toBe("special");
    });
});
