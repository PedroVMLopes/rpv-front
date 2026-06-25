import {
    getSubclass,
    getSubclassGrantSourcesForLevel,
    getSubclassGrants,
    listSubclassesForClass,
} from "../src";

describe("subclassGrants.dnd", () => {
    it("lists subclasses for a class slug", () => {
        const fighterSubclasses = listSubclassesForClass("fighter");
        expect(fighterSubclasses.map((entry) => entry.slug)).toEqual([
            "fighter-champion",
        ]);

        expect(listSubclassesForClass("unknown")).toEqual([]);
    });

    it("lists barbarian and monk pilot subclasses", () => {
        expect(listSubclassesForClass("barbarian").map((entry) => entry.slug)).toEqual([
            "barbarian-berserker",
        ]);
        expect(listSubclassesForClass("monk").map((entry) => entry.slug)).toEqual([
            "monk-open-hand",
        ]);
    });

    it("returns subclass metadata by namespaced slug", () => {
        expect(getSubclass("fighter-champion")).toEqual(
            expect.objectContaining({
                slug: "fighter-champion",
                name: "Champion",
                classSlug: "fighter",
            })
        );
        expect(getSubclass("unknown")).toBeUndefined();
    });

    it("applies pt-BR overlay for subclass names", () => {
        expect(getSubclass("fighter-champion", "pt-BR")?.name).toBe("Campeão");
        expect(getSubclass("wizard-evocation", "pt-BR")?.name).toBe("Evocação");
    });

    it("returns base and level blocks separately", () => {
        const wizardBlocks = getSubclassGrantSourcesForLevel(
            "wizard-evocation",
            1
        );
        expect(wizardBlocks).toHaveLength(1);
        expect(wizardBlocks[0].grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "ability",
                    description: "Sculpt Spells",
                }),
            ])
        );

        const championLevel1 = getSubclassGrantSourcesForLevel(
            "fighter-champion",
            1
        );
        expect(championLevel1).toHaveLength(1);
        expect(championLevel1[0].grants).toEqual([]);

        const championLevel3 = getSubclassGrantSourcesForLevel(
            "fighter-champion",
            3
        );
        expect(championLevel3).toHaveLength(2);
        expect(championLevel3[1]).toEqual(
            expect.objectContaining({
                featureLevel: 3,
                grants: expect.arrayContaining([
                    expect.objectContaining({
                        grantType: "ability",
                        description: "Improved Critical",
                    }),
                ]),
            })
        );
    });

    it("flattens subclass grants for a level", () => {
        const grants = getSubclassGrants("fighter-champion", 3);
        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "ability",
                    description: "Improved Critical",
                }),
            ])
        );
    });

    it("includes level 3 feature for monk open hand", () => {
        const grants = getSubclassGrants("monk-open-hand", 3);

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "ability",
                    description: "Open Hand Technique",
                }),
            ])
        );
    });
});
