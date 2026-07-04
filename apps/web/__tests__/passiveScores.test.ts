import { computePassiveScore } from "../lib/character/passiveScores";

describe("computePassiveScore", () => {
    it("returns 10 plus the skill modifier", () => {
        expect(
            computePassiveScore(
                [
                    { slug: "perception", modifier: 5 },
                    { slug: "insight", modifier: 2 },
                ],
                "insight"
            )
        ).toBe(12);
    });

    it("defaults missing skills to 10", () => {
        expect(computePassiveScore([], "insight")).toBe(10);
    });
});
