import {
    spellSlotGridColumnCount,
    spellSlotGridPosition,
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
