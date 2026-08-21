import type { Grant } from "@rpv/content";
import {
    featureLevelFromGrantPickKey,
    isCantripGrant,
    isGrantPickAboveProgressionCap,
    isInventoryOrExclusiveKey,
    isLeveledSpellGrant,
    parseGrantPickKey,
} from "../lib/character/creationSteps/grantPickKey";

describe("parseGrantPickKey", () => {
    it("parses a six-segment class pick key", () => {
        expect(parseGrantPickKey("class:wizard:1:spell:2:0")).toEqual({
            sourceType: "class",
            sourceId: "wizard",
            levelSegment: "1",
            grantType: "spell",
            grantIndex: "2",
            slot: "0",
        });
    });

    it("returns undefined for keys with fewer than six segments", () => {
        expect(parseGrantPickKey("class:wizard:1:spell")).toBeUndefined();
        expect(
            parseGrantPickKey("class:fighter:base:exclusive:starting-wealth")
        ).toBeUndefined();
        expect(parseGrantPickKey("")).toBeUndefined();
    });

    it("keeps only the sixth segment as the slot when extras are present", () => {
        expect(parseGrantPickKey("class:wizard:1:spell:2:0:extra")?.slot).toBe(
            "0"
        );
    });
});

describe("featureLevelFromGrantPickKey", () => {
    it("treats base and exclusive level segments as level 1", () => {
        expect(featureLevelFromGrantPickKey("race:elf:base:language:0:0")).toBe(
            1
        );
        expect(
            featureLevelFromGrantPickKey(
                "class:fighter:base:exclusive:starting-wealth:0"
            )
        ).toBe(1);
    });

    it("parses numeric level segments and floors fractions", () => {
        expect(featureLevelFromGrantPickKey("class:wizard:4:spell:0:0")).toBe(4);
        expect(featureLevelFromGrantPickKey("class:wizard:3.9:spell:0:0")).toBe(
            3
        );
    });

    it("falls back to 1 for malformed or non-positive levels", () => {
        expect(featureLevelFromGrantPickKey("not-a-key")).toBe(1);
        expect(featureLevelFromGrantPickKey("class:wizard:0:spell:0:0")).toBe(1);
        expect(featureLevelFromGrantPickKey("class:wizard:-2:spell:0:0")).toBe(
            1
        );
        expect(featureLevelFromGrantPickKey("class:wizard:NaN:spell:0:0")).toBe(
            1
        );
    });
});

describe("isGrantPickAboveProgressionCap", () => {
    it("is false for base, exclusive, malformed, and in-cap levels", () => {
        expect(
            isGrantPickAboveProgressionCap("race:elf:base:language:0:0", 3)
        ).toBe(false);
        expect(
            isGrantPickAboveProgressionCap(
                "class:fighter:base:exclusive:starting-wealth",
                3
            )
        ).toBe(false);
        expect(isGrantPickAboveProgressionCap("bad", 3)).toBe(false);
        expect(
            isGrantPickAboveProgressionCap("class:wizard:3:spell:0:0", 3)
        ).toBe(false);
    });

    it("is true only when the numeric feature level exceeds the cap", () => {
        expect(
            isGrantPickAboveProgressionCap("class:wizard:4:spell:0:0", 3)
        ).toBe(true);
    });
});

describe("isCantripGrant / isLeveledSpellGrant", () => {
    const cantrip: Grant = {
        grantType: "spell",
        choose: 1,
        selectionFilter: { levelInt: 0 },
    };
    const leveled: Grant = {
        grantType: "spell",
        choose: 1,
        selectionFilter: { levelInt: 1 },
    };
    const maxLeveled: Grant = {
        grantType: "spell",
        choose: 1,
        selectionFilter: { levelIntMax: 2 },
    };
    const both: Grant = {
        grantType: "spell",
        choose: 1,
        selectionFilter: { levelInt: 0, levelIntMax: 3 },
    };
    const skill: Grant = { grantType: "skill_proficiency", choose: 1 };

    it("treats exact levelInt 0 as a cantrip, not a leveled spell", () => {
        expect(isCantripGrant(cantrip)).toBe(true);
        expect(isLeveledSpellGrant(cantrip)).toBe(false);
    });

    it("treats levelInt > 0 and levelIntMax >= 1 as leveled spells", () => {
        expect(isLeveledSpellGrant(leveled)).toBe(true);
        expect(isLeveledSpellGrant(maxLeveled)).toBe(true);
        expect(isCantripGrant(leveled)).toBe(false);
        expect(isCantripGrant(maxLeveled)).toBe(false);
    });

    it("classifies both-filter spells as cantrip and leveled when levelIntMax is set", () => {
        expect(isCantripGrant(both)).toBe(true);
        expect(isLeveledSpellGrant(both)).toBe(true);
    });

    it("rejects non-spell grants and spells without a selection filter", () => {
        expect(isCantripGrant(skill)).toBe(false);
        expect(isLeveledSpellGrant(skill)).toBe(false);
        expect(isLeveledSpellGrant({ grantType: "spell", choose: 1 })).toBe(
            false
        );
    });
});

describe("isInventoryOrExclusiveKey", () => {
    it("matches inventory, currency, and exclusive segments", () => {
        expect(
            isInventoryOrExclusiveKey("class:fighter:base:inventory_item:5:0")
        ).toBe(true);
        expect(
            isInventoryOrExclusiveKey("class:fighter:base:currency:0:0")
        ).toBe(true);
        expect(
            isInventoryOrExclusiveKey(
                "class:fighter:base:exclusive:starting-wealth"
            )
        ).toBe(true);
    });

    it("does not match skill or spell pick keys", () => {
        expect(
            isInventoryOrExclusiveKey(
                "class:fighter:base:skill_proficiency:3:0"
            )
        ).toBe(false);
        expect(isInventoryOrExclusiveKey("class:wizard:1:spell:0:0")).toBe(
            false
        );
    });
});
