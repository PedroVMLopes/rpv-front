import { d20StepTitleKey, d20ModeHintKey } from "../lib/roll/rollHints";
import type { D20RollMode } from "../lib/roll/rollRiders";

describe("rollHints", () => {
    it("maps d20 step title keys by mode and context", () => {
        expect(d20StepTitleKey("normal", "test", 1)).toBe("contextTitle");
        expect(d20StepTitleKey("advantage", "test", 2)).toBe(
            "d20PairTitleAdvantage"
        );
        expect(d20StepTitleKey("disadvantage", "attack", 2)).toBe(
            "attackPairTitleDisadvantage"
        );
        expect(d20StepTitleKey("inspiration", "test", 2)).toBe(
            "d20PairTitleInspiration"
        );
    });

    it("maps mode hint keys", () => {
        expect(d20ModeHintKey("inspiration")).toBe("modeHint.inspiration");
    });
});
