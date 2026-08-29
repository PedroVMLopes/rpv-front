import { mergeSessionResources } from "../lib/character/mergeSessionResources";

describe("mergeSessionResources", () => {
    it("starts derived resources at max when no existing session values", () => {
        expect(
            mergeSessionResources(
                { "spell-slots-1": 2, "rage-uses": 3 },
                undefined,
                8
            )
        ).toEqual({
            hp: 8,
            "spell-slots-1": 2,
            "rage-uses": 3,
        });
    });

    it("preserves spent resources and clamps to the new maximum", () => {
        expect(
            mergeSessionResources(
                { "spell-slots-1": 4, "spell-slots-2": 2 },
                { hp: 6, "spell-slots-1": 1, "spell-slots-2": 5 },
                7
            )
        ).toEqual({
            hp: 7,
            "spell-slots-1": 1,
            "spell-slots-2": 2,
        });
    });

    it("drops session resources whose grants no longer apply", () => {
        expect(
            mergeSessionResources(
                { "spell-slots-1": 2 },
                { "spell-slots-1": 1, "spell-slots-2": 1, "ki-points": 0 },
                8
            )
        ).toEqual({
            hp: 8,
            "spell-slots-1": 1,
        });
    });
});
