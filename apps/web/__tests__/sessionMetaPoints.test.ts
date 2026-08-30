import {
    getMetaPoint,
    INSPIRATION_REF,
    mergeMetaPointPatch,
    sanitizeMetaPoints,
} from "../lib/character/sessionMetaPoints";

describe("sessionMetaPoints", () => {
    it("sanitizes inspiration to 0..1 and drops zero values", () => {
        expect(sanitizeMetaPoints({ inspiration: 2 })).toEqual({
            inspiration: 1,
        });
        expect(sanitizeMetaPoints({ inspiration: 0 })).toBeUndefined();
    });

    it("reads meta points from session", () => {
        expect(
            getMetaPoint({ metaPoints: { [INSPIRATION_REF]: 1 } }, INSPIRATION_REF)
        ).toBe(1);
        expect(getMetaPoint(undefined, INSPIRATION_REF)).toBe(0);
    });

    it("merges meta point patches", () => {
        expect(
            mergeMetaPointPatch({ inspiration: 1 }, { inspiration: 0 })
        ).toBeUndefined();
        expect(mergeMetaPointPatch(undefined, { inspiration: 1 })).toEqual({
            inspiration: 1,
        });
    });
});
