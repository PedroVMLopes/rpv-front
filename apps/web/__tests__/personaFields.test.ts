import {
    parseDisposition,
    readDispositionAxis,
} from "../lib/character/personaFields";

describe("parseDisposition", () => {
    it("keeps only integer axes in 1–20", () => {
        expect(
            parseDisposition({
                solitarySociable: 14,
                improviserPlanner: 0,
                brusqueDelicate: 21,
                unadornedOpulent: 10.5,
                extra: 7,
            })
        ).toEqual({ solitarySociable: 14 });
    });

    it("accepts the inclusive 1 and 20 bounds", () => {
        expect(
            parseDisposition({
                solitarySociable: 1,
                improviserPlanner: 20,
            })
        ).toEqual({ solitarySociable: 1, improviserPlanner: 20 });
    });

    it("returns an empty map for missing or invalid values", () => {
        expect(parseDisposition(undefined)).toEqual({});
        expect(parseDisposition([])).toEqual({});
        expect(parseDisposition("nope")).toEqual({});
        expect(parseDisposition({ solitarySociable: "14" })).toEqual({});
    });
});

describe("readDispositionAxis", () => {
    it("reads a stored axis from systemData.disposition", () => {
        expect(
            readDispositionAxis(
                { disposition: { seriousEasygoing: 3 } },
                "seriousEasygoing"
            )
        ).toBe(3);
        expect(
            readDispositionAxis(
                { disposition: { seriousEasygoing: 3 } },
                "solitarySociable"
            )
        ).toBeNull();
    });
});
