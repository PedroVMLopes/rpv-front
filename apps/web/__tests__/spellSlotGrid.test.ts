import {
    isSlotUsed,
    spellSlotGridColumnCount,
    spellSlotGridPosition,
    spellSlotGridRowCount,
    toggleSlotCount,
    updateUsedCountByKey,
} from "../components/characters/PlayerSheet/overview/sheetResourceSquares";

describe("spellSlotGridPosition", () => {
    it("places the first four slots in a 2x2 reading-order block", () => {
        expect(spellSlotGridPosition(0)).toEqual({ col: 1, row: 1 });
        expect(spellSlotGridPosition(1)).toEqual({ col: 2, row: 1 });
        expect(spellSlotGridPosition(2)).toEqual({ col: 1, row: 2 });
        expect(spellSlotGridPosition(3)).toEqual({ col: 2, row: 2 });
    });

    it("fills extra columns top then bottom", () => {
        expect(spellSlotGridPosition(4)).toEqual({ col: 3, row: 1 });
        expect(spellSlotGridPosition(5)).toEqual({ col: 3, row: 2 });
        expect(spellSlotGridPosition(6)).toEqual({ col: 4, row: 1 });
        expect(spellSlotGridPosition(7)).toEqual({ col: 4, row: 2 });
    });
});

describe("spellSlotGridColumnCount", () => {
    it("uses one or two columns for the first four slots", () => {
        expect(spellSlotGridColumnCount(0)).toBe(0);
        expect(spellSlotGridColumnCount(1)).toBe(1);
        expect(spellSlotGridColumnCount(2)).toBe(2);
        expect(spellSlotGridColumnCount(3)).toBe(2);
        expect(spellSlotGridColumnCount(4)).toBe(2);
    });

    it("adds a column for every two extra slots", () => {
        expect(spellSlotGridColumnCount(5)).toBe(3);
        expect(spellSlotGridColumnCount(6)).toBe(3);
        expect(spellSlotGridColumnCount(7)).toBe(4);
        expect(spellSlotGridColumnCount(8)).toBe(4);
    });
});

describe("spellSlotGridRowCount", () => {
    it("keeps a single row until a third slot needs the bottom line", () => {
        expect(spellSlotGridRowCount(0)).toBe(0);
        expect(spellSlotGridRowCount(1)).toBe(1);
        expect(spellSlotGridRowCount(2)).toBe(1);
        expect(spellSlotGridRowCount(3)).toBe(2);
        expect(spellSlotGridRowCount(4)).toBe(2);
        expect(spellSlotGridRowCount(5)).toBe(2);
    });
});

describe("isSlotUsed", () => {
    it("marks the last usedCount squares as used", () => {
        expect(isSlotUsed(0, 4, 2)).toBe(false);
        expect(isSlotUsed(1, 4, 2)).toBe(false);
        expect(isSlotUsed(2, 4, 2)).toBe(true);
        expect(isSlotUsed(3, 4, 2)).toBe(true);
        expect(isSlotUsed(0, 2, 0)).toBe(false);
        expect(isSlotUsed(0, 1, 1)).toBe(true);
    });
});

describe("toggleSlotCount", () => {
    it("uses a used square to restore one slot and an unused square to spend one", () => {
        expect(toggleSlotCount(3, 4, 2)).toBe(1);
        expect(toggleSlotCount(0, 4, 2)).toBe(3);
        expect(toggleSlotCount(0, 2, 0)).toBe(1);
        expect(toggleSlotCount(1, 2, 2)).toBe(1);
    });
});

describe("updateUsedCountByKey", () => {
    it("writes the toggled count and drops the row key when used count returns to 0", () => {
        expect(updateUsedCountByKey({}, "spell-slots-1", 1, 2)).toEqual({
            "spell-slots-1": 1,
        });
        expect(
            updateUsedCountByKey({ "spell-slots-1": 1 }, "spell-slots-1", 1, 2)
        ).toEqual({});
        expect(
            updateUsedCountByKey(
                { "spell-slots-1": 1, "spell-slots-2": 2 },
                "spell-slots-2",
                0,
                2
            )
        ).toEqual({ "spell-slots-1": 1, "spell-slots-2": 1 });
    });
});
