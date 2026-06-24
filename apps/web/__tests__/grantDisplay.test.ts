import {
    isGrantedFeaturesEntry,
    listGrantsBySource,
    listOtherDerivedResources,
} from "../lib/character/grantDisplay";
import type { CharacterGrant } from "@rpv/domain";

function createGrant(
    overrides: Partial<CharacterGrant> & Pick<CharacterGrant, "kind" | "ref">
): CharacterGrant {
    return {
        id: `${overrides.source?.type ?? "class"}-${overrides.ref}`,
        source: { type: "class", id: "wizard" },
        ...overrides,
    };
}

describe("listGrantsBySource", () => {
    it("filters grants by source type and kind", () => {
        const grants: CharacterGrant[] = [
            createGrant({
                kind: "ability",
                ref: "Action Surge",
                source: { type: "class", id: "fighter" },
            }),
            createGrant({
                kind: "proficiency",
                ref: "athletics",
                source: { type: "class", id: "fighter" },
            }),
            createGrant({
                kind: "ability",
                ref: "Sculpt Spells",
                source: { type: "subclass", id: "wizard-evocation" },
            }),
        ];

        expect(listGrantsBySource(grants, "class", ["ability"])).toEqual([
            grants[0],
        ]);
        expect(listGrantsBySource(grants, "subclass", ["ability"])).toEqual([
            grants[2],
        ]);
    });
});

describe("isGrantedFeaturesEntry", () => {
    it("excludes class and subclass abilities and spells", () => {
        expect(
            isGrantedFeaturesEntry(
                createGrant({
                    kind: "ability",
                    ref: "Rage",
                    source: { type: "class", id: "barbarian" },
                })
            )
        ).toBe(false);
        expect(
            isGrantedFeaturesEntry(
                createGrant({
                    kind: "spell",
                    ref: "fire-bolt",
                    source: { type: "class", id: "wizard" },
                })
            )
        ).toBe(false);
        expect(
            isGrantedFeaturesEntry(
                createGrant({
                    kind: "ability",
                    ref: "Sculpt Spells",
                    source: { type: "subclass", id: "wizard-evocation" },
                })
            )
        ).toBe(false);
    });

    it("keeps proficiencies and saving throws", () => {
        expect(
            isGrantedFeaturesEntry(
                createGrant({ kind: "proficiency", ref: "arcana" })
            )
        ).toBe(true);
        expect(
            isGrantedFeaturesEntry(
                createGrant({ kind: "saving_throw", ref: "intelligence" })
            )
        ).toBe(true);
    });
});

describe("listOtherDerivedResources", () => {
    it("returns non-hp, non-spell-slot resources", () => {
        expect(
            listOtherDerivedResources({
                hp: 20,
                "spell-slots-1": 4,
                "rage-uses": 3,
                "ki-points": 5,
            })
        ).toEqual([
            { ref: "ki-points", count: 5 },
            { ref: "rage-uses", count: 3 },
        ]);
    });
});
