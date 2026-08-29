import { mergeSessionResources } from "../lib/character/mergeSessionResources";
import { HIT_DICE_RESOURCE } from "../lib/character/vitality";

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

    it("injects hit dice and credits new dice on level-up", () => {
        expect(
            mergeSessionResources(
                { "spell-slots-1": 2 },
                { hp: 6, [HIT_DICE_RESOURCE]: 2 },
                7,
                { ref: HIT_DICE_RESOURCE, max: 6, previousMax: 5 }
            )
        ).toEqual({
            hp: 7,
            "spell-slots-1": 2,
            [HIT_DICE_RESOURCE]: 3,
        });
    });

    it("starts hit dice at max when creating a character", () => {
        expect(
            mergeSessionResources({ "rage-uses": 2 }, undefined, 12, {
                ref: HIT_DICE_RESOURCE,
                max: 3,
            })
        ).toEqual({
            hp: 12,
            "rage-uses": 2,
            [HIT_DICE_RESOURCE]: 3,
        });
    });

    it("does not drop hit dice just because they are not grant-derived", () => {
        expect(
            mergeSessionResources(
                { "spell-slots-1": 2 },
                { "spell-slots-1": 1, [HIT_DICE_RESOURCE]: 1 },
                8,
                { ref: HIT_DICE_RESOURCE, max: 3, previousMax: 3 }
            )
        ).toEqual({
            hp: 8,
            "spell-slots-1": 1,
            [HIT_DICE_RESOURCE]: 1,
        });
    });
});
