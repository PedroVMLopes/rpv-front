import { formatRollButtonLabel } from "../lib/content/formatRollButtonLabel";

describe("formatRollButtonLabel", () => {
    it("appends formatted modifier when non-zero", () => {
        expect(formatRollButtonLabel({ primary: "d20", modifier: 5 })).toBe(
            "d20 +5"
        );
        expect(formatRollButtonLabel({ primary: "1d8", modifier: 3 })).toBe(
            "1d8 +3"
        );
    });

    it("omits modifier when null, undefined, or zero", () => {
        expect(formatRollButtonLabel({ primary: "1d10", modifier: null })).toBe(
            "1d10"
        );
        expect(formatRollButtonLabel({ primary: "1d10", modifier: 0 })).toBe(
            "1d10"
        );
        expect(formatRollButtonLabel({ primary: "3d6" })).toBe("3d6");
    });

    it("keeps curated flat in primary without duplicating modifier", () => {
        expect(formatRollButtonLabel({ primary: "3d4+1", modifier: null })).toBe(
            "3d4+1"
        );
    });

    it("formats negative modifiers", () => {
        expect(formatRollButtonLabel({ primary: "d20", modifier: -1 })).toBe(
            "d20 -1"
        );
    });
});
