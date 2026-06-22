import { readLevelFromForm } from "../lib/character/level";

describe("readLevelFromForm", () => {
    it("reads numeric level", () => {
        expect(readLevelFromForm({ level: 5 })).toBe(5);
    });

    it("coerces string level", () => {
        expect(readLevelFromForm({ level: "3" })).toBe(3);
    });

    it("floors fractional levels", () => {
        expect(readLevelFromForm({ level: 2.9 })).toBe(2);
    });

    it("defaults to 1 when missing or invalid", () => {
        expect(readLevelFromForm({})).toBe(1);
        expect(readLevelFromForm({ level: 0 })).toBe(1);
        expect(readLevelFromForm({ level: "" })).toBe(1);
        expect(readLevelFromForm({ level: "abc" })).toBe(1);
    });

    it("clamps levels above 20", () => {
        expect(readLevelFromForm({ level: 25 })).toBe(20);
        expect(readLevelFromForm({ level: "21" })).toBe(20);
    });
});
