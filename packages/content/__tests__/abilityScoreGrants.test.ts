import type { Modifier } from "@rpv/domain";
import {
    buildAbilityScoreChoiceKey,
    isValidAbilityScorePick,
    resolveAbilityScoreGrants,
    resolveAbilityScorePick,
} from "../src/grant/abilityScoreGrants";
import type { Grant } from "../src/grant/grant.types";

const distributableGrant: Grant = {
    grantType: "ability_score",
    choose: 2,
    amount: 1,
    options: [
        { optionType: "stat", ref: "strength" },
        { optionType: "stat", ref: "dexterity" },
        { optionType: "stat", ref: "constitution" },
    ],
};

describe("resolveAbilityScorePick", () => {
    it("returns stat when pick is in the pool", () => {
        expect(resolveAbilityScorePick(distributableGrant, "strength")).toBe(
            "strength"
        );
    });

    it("returns undefined for stats outside the pool", () => {
        expect(resolveAbilityScorePick(distributableGrant, "wisdom")).toBeUndefined();
        expect(resolveAbilityScorePick(distributableGrant, "")).toBeUndefined();
    });

    it("resolves stats from selectionFilter when options omitted", () => {
        const grant: Grant = {
            grantType: "ability_score",
            choose: 1,
            amount: 1,
            selectionFilter: { stats: ["intelligence", "wisdom"] },
        };

        expect(resolveAbilityScorePick(grant, "wisdom")).toBe("wisdom");
        expect(resolveAbilityScorePick(grant, "charisma")).toBeUndefined();
    });
});

describe("isValidAbilityScorePick", () => {
    it("validates picks against the stat pool", () => {
        expect(isValidAbilityScorePick(distributableGrant, "dexterity")).toBe(
            true
        );
        expect(isValidAbilityScorePick(distributableGrant, "charisma")).toBe(
            false
        );
    });
});

describe("resolveAbilityScoreGrants", () => {
    const context = {
        sourceType: "race",
        sourceId: "half-elf",
    };

    it("converts filled choice slots into modifiers", () => {
        const key0 = buildAbilityScoreChoiceKey({
            sourceType: "race",
            sourceId: "half-elf",
            grantIndex: 1,
            slot: 0,
        });
        const key1 = buildAbilityScoreChoiceKey({
            sourceType: "race",
            sourceId: "half-elf",
            grantIndex: 1,
            slot: 1,
        });

        const grants: Grant[] = [
            {
                grantType: "ability_score",
                choose: 0,
                targetStat: "charisma",
                amount: 2,
            },
            distributableGrant,
        ];

        const modifiers = resolveAbilityScoreGrants(
            grants,
            { [key0]: "strength", [key1]: "dexterity" },
            context
        );

        expect(modifiers).toEqual([
            expect.objectContaining({
                stat: "strength",
                value: 1,
                source: { type: "race", id: "half-elf" },
            }),
            expect.objectContaining({
                stat: "dexterity",
                value: 1,
                source: { type: "race", id: "half-elf" },
            }),
        ] satisfies Partial<Modifier>[]);
    });

    it("ignores empty or invalid picks", () => {
        const key0 = buildAbilityScoreChoiceKey({
            sourceType: "race",
            sourceId: "half-elf",
            grantIndex: 0,
            slot: 0,
        });

        expect(
            resolveAbilityScoreGrants(
                [distributableGrant],
                { [key0]: "not-a-stat" },
                context
            )
        ).toEqual([]);
    });
});

describe("buildAbilityScoreChoiceKey", () => {
    it("uses the standard grant pick key shape", () => {
        expect(
            buildAbilityScoreChoiceKey({
                sourceType: "race",
                sourceId: "half-elf",
                grantIndex: 1,
                slot: 0,
            })
        ).toBe("race:half-elf:base:ability_score:1:0");
    });
});
