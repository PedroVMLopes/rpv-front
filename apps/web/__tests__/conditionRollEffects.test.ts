import {
    collectRollEffectsFromActiveConditions,
    rollEffectsFor,
} from "../lib/character/conditionRollEffects";

describe("collectRollEffectsFromActiveConditions", () => {
    it("returns nothing for missing, empty, or unknown slugs", () => {
        expect(collectRollEffectsFromActiveConditions(undefined, "dnd")).toEqual(
            []
        );
        expect(collectRollEffectsFromActiveConditions([], "dnd")).toEqual([]);
        expect(
            collectRollEffectsFromActiveConditions(["not-a-condition"], "dnd")
        ).toEqual([]);
    });

    it("flattens roll effects from curated conditions", () => {
        expect(
            collectRollEffectsFromActiveConditions(
                ["blessed", "poisoned", "blessed"],
                "dnd"
            )
        ).toEqual([
            { kind: "extra_die", sides: 4, appliesTo: ["attack", "save"] },
            {
                kind: "disadvantage",
                appliesTo: ["attack", "ability_check"],
            },
            { kind: "extra_die", sides: 4, appliesTo: ["attack", "save"] },
        ]);
    });
});

describe("rollEffectsFor", () => {
    const effects = collectRollEffectsFromActiveConditions(
        ["blessed", "poisoned"],
        "dnd"
    );

    it("keeps only effects that apply to the requested roll kind", () => {
        expect(rollEffectsFor(effects, "attack")).toHaveLength(2);
        expect(rollEffectsFor(effects, "save")).toEqual([
            { kind: "extra_die", sides: 4, appliesTo: ["attack", "save"] },
        ]);
        expect(rollEffectsFor(effects, "ability_check")).toEqual([
            {
                kind: "disadvantage",
                appliesTo: ["attack", "ability_check"],
            },
        ]);
    });
});
