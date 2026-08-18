import { sliderFillFromOrigin } from "../components/ui/sliderFillFromOrigin";

describe("sliderFillFromOrigin", () => {
    const min = 1;
    const max = 20;
    const origin = 10;
    const originPct = ((origin - min) / (max - min)) * 100;

    it("fills from the origin to the left at 1", () => {
        expect(sliderFillFromOrigin(1, origin, min, max)).toEqual({
            leftPct: 0,
            widthPct: originPct,
        });
    });

    it("has no fill at the origin", () => {
        expect(sliderFillFromOrigin(10, origin, min, max)).toEqual({
            leftPct: originPct,
            widthPct: 0,
        });
    });

    it("fills from the origin to the right at 20", () => {
        expect(sliderFillFromOrigin(20, origin, min, max)).toEqual({
            leftPct: originPct,
            widthPct: 100 - originPct,
        });
    });
});
