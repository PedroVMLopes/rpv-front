import { resolveLevelFeatures } from "../src/grant/levelFeatures";
import type { LevelFeature } from "../src/grant/levelFeature.types";

const sampleFeatures: LevelFeature[] = [
    { level: 1, grants: [{ grantType: "ability", choose: 0, description: "L1" }] },
    { level: 2, grants: [{ grantType: "ability", choose: 0, description: "L2" }] },
    { level: 3, grants: [{ grantType: "ability", choose: 0, description: "L3" }] },
    { level: 4, grants: [{ grantType: "ability", choose: 0, description: "L4" }] },
];

describe("resolveLevelFeatures", () => {
    it("returns no features when character level is 1 and features start at L2", () => {
        expect(resolveLevelFeatures(sampleFeatures.slice(1), 1)).toEqual([]);
    });

    it("returns features up to character level", () => {
        const result = resolveLevelFeatures(sampleFeatures, 3);

        expect(result).toHaveLength(3);
        expect(result.map((feature) => feature.level)).toEqual([1, 2, 3]);
    });

    it("filters features above character level", () => {
        const result = resolveLevelFeatures(sampleFeatures, 2);

        expect(result.map((feature) => feature.level)).toEqual([1, 2]);
    });

    it("sorts features by level ascending", () => {
        const unordered: LevelFeature[] = [
            { level: 4, grants: [{ grantType: "ability", choose: 0 }] },
            { level: 2, grants: [{ grantType: "ability", choose: 0 }] },
        ];

        expect(resolveLevelFeatures(unordered, 5).map((f) => f.level)).toEqual([
            2, 4,
        ]);
    });

    it("floors fractional character levels", () => {
        expect(resolveLevelFeatures(sampleFeatures, 2.9)).toHaveLength(2);
    });

    it("treats invalid levels below 1 as level 1", () => {
        expect(resolveLevelFeatures(sampleFeatures, 0)).toHaveLength(1);
    });
});
