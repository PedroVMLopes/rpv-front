import {
    classGrantSourcesFromEntry,
    getClass,
    getClassGrants,
    getClassGrantSourcesForLevel,
    getClassHitDie,
    getClassPreparedQuotaKind,
    getClassSpellcastingMode,
    getClassSubclassLevel,
    listClasses,
} from "../src";

describe("classGrants.dnd", () => {
    it("lists curated classes", () => {
        const classes = listClasses();

        expect(classes.length).toBeGreaterThan(0);
        expect(classes.map((entry) => entry.slug)).toEqual(
            expect.arrayContaining([
                "fighter",
                "wizard",
                "barbarian",
                "monk",
                "rogue",
                "cleric",
                "warlock",
            ])
        );
    });

    it("returns fighter fixed proficiencies and skill choices", () => {
        const grants = getClassGrants("fighter");

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "saving_throw_proficiency",
                    choose: 0,
                }),
                expect.objectContaining({
                    grantType: "armor_proficiency",
                    choose: 0,
                }),
                expect.objectContaining({
                    grantType: "weapon_proficiency",
                    choose: 0,
                }),
                expect.objectContaining({
                    grantType: "skill_proficiency",
                    choose: 2,
                }),
            ])
        );
    });

    it("returns class metadata by slug", () => {
        expect(getClass("wizard")).toEqual(
            expect.objectContaining({
                slug: "wizard",
                name: "Wizard",
                hitDie: 6,
                spellcastingAbility: "intelligence",
                spellcastingMode: "spellbook",
            })
        );
        expect(getClass("fighter")?.spellcastingAbility).toBeUndefined();
        expect(getClass("fighter")?.spellcastingMode).toBeUndefined();
    });

    it("returns spellcasting mode by class slug", () => {
        expect(getClassSpellcastingMode("wizard")).toBe("spellbook");
        expect(getClassSpellcastingMode("cleric")).toBe("prepared-list");
        expect(getClassSpellcastingMode("warlock")).toBe("pact");
        expect(getClassSpellcastingMode("fighter")).toBeUndefined();
        expect(getClassSpellcastingMode("unknown")).toBeUndefined();
    });

    it("defaults prepared quota to level-plus-mod for casters", () => {
        expect(getClassPreparedQuotaKind("wizard")).toBe("level-plus-mod");
        expect(getClassPreparedQuotaKind("cleric")).toBe("level-plus-mod");
        expect(getClassPreparedQuotaKind("fighter")).toBeUndefined();
    });

    it("returns cleric spellcasting metadata and L1 slots", () => {
        expect(getClass("cleric")).toEqual(
            expect.objectContaining({
                slug: "cleric",
                spellcastingAbility: "wisdom",
                spellcastingMode: "prepared-list",
                subclassLevel: 1,
            })
        );
        expect(getClassSubclassLevel("cleric")).toBe(1);
        expect(getClassGrants("cleric", 1)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "resource",
                    ref: "spell-slots-1",
                    amount: 2,
                }),
                expect.objectContaining({
                    grantType: "spell",
                    choose: 3,
                    selectionFilter: {
                        spellLists: ["cleric"],
                        levelInt: 0,
                    },
                }),
            ])
        );
    });

    it("returns empty grants for unknown class", () => {
        expect(getClassGrants("unknown")).toEqual([]);
    });

    it("returns hit die by class slug", () => {
        expect(getClassHitDie("fighter")).toBe(10);
        expect(getClassHitDie("wizard")).toBe(6);
        expect(getClassHitDie("rogue")).toBe(8);
        expect(getClassHitDie("cleric")).toBe(8);
        expect(getClassHitDie("unknown")).toBeUndefined();
    });

    it("returns class-specific saving throw proficiencies", () => {
        const fighterSaveGrant = getClassGrants("fighter").find(
            (grant) => grant.grantType === "saving_throw_proficiency"
        );
        const wizardSaveGrant = getClassGrants("wizard").find(
            (grant) => grant.grantType === "saving_throw_proficiency"
        );
        const rogueSaveGrant = getClassGrants("rogue").find(
            (grant) => grant.grantType === "saving_throw_proficiency"
        );
        const clericSaveGrant = getClassGrants("cleric").find(
            (grant) => grant.grantType === "saving_throw_proficiency"
        );

        expect(
            fighterSaveGrant?.options
                ?.filter((option) => option.optionType === "proficiency")
                .map((option) => option.ref)
        ).toEqual([
            "strength",
            "constitution",
        ]);
        expect(
            wizardSaveGrant?.options
                ?.filter((option) => option.optionType === "proficiency")
                .map((option) => option.ref)
        ).toEqual([
            "intelligence",
            "wisdom",
        ]);
        expect(
            rogueSaveGrant?.options
                ?.filter((option) => option.optionType === "proficiency")
                .map((option) => option.ref)
        ).toEqual([
            "dexterity",
            "intelligence",
        ]);
        expect(
            clericSaveGrant?.options
                ?.filter((option) => option.optionType === "proficiency")
                .map((option) => option.ref)
        ).toEqual([
            "wisdom",
            "charisma",
        ]);
    });

    it("returns only base grants at level 1", () => {
        const level1 = getClassGrants("fighter", 1);
        const level2 = getClassGrants("fighter", 2);

        expect(level1).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ description: "Action Surge" }),
            ])
        );
        expect(level2.length).toBeGreaterThan(level1.length);
    });

    it("includes Action Surge at level 2 and above", () => {
        expect(getClassGrants("fighter", 2)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "ability",
                    description: "Action Surge",
                    activation: {
                        cost: "special",
                        resourceRef: "action-surge-uses",
                    },
                }),
                expect.objectContaining({
                    grantType: "resource",
                    ref: "action-surge-uses",
                    amount: 1,
                }),
            ])
        );
    });

    it("includes level 3 skill choice at level 3", () => {
        const grants = getClassGrants("fighter", 3);

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "skill_proficiency",
                    choose: 1,
                    description: "Additional skill",
                }),
            ])
        );
    });

    it("grants rogue expertise at levels 1 and 6", () => {
        expect(getClassGrants("rogue", 1)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "skill_expertise",
                    choose: 2,
                    selectionFilter: { fromProficientSkills: true },
                }),
            ])
        );

        const level1 = getClassGrantSourcesForLevel("rogue", 1);
        expect(level1.some((block) => block.featureLevel === 1)).toBe(true);
        expect(level1.some((block) => block.featureLevel === 6)).toBe(false);

        const level6 = getClassGrantSourcesForLevel("rogue", 6);
        const expertiseBlocks = level6.filter((block) =>
            block.grants.some((grant) => grant.grantType === "skill_expertise")
        );
        expect(expertiseBlocks).toHaveLength(2);
        expect(expertiseBlocks.map((block) => block.featureLevel).sort()).toEqual([
            1, 6,
        ]);
    });

    it("getClassGrantSourcesForLevel separates base and level blocks", () => {
        const blocks = getClassGrantSourcesForLevel("fighter", 3);

        expect(blocks).toHaveLength(3);
        expect(blocks[0].featureLevel).toBeUndefined();
        expect(blocks[1].featureLevel).toBe(2);
        expect(blocks[2].featureLevel).toBe(3);
    });

    it("grants Ability Score Improvement at 4/8/12/16/19 and Extra Attack at 5", () => {
        expect(
            getClassGrants("fighter", 1).some(
                (grant) => grant.description === "Extra Attack"
            )
        ).toBe(false);
        expect(
            getClassGrants("fighter", 4).some(
                (grant) =>
                    grant.grantType === "ability_score" &&
                    grant.description === "Ability Score Improvement"
            )
        ).toBe(true);
        expect(
            getClassGrants("fighter", 5).some(
                (grant) => grant.description === "Extra Attack"
            )
        ).toBe(true);
        expect(
            getClassGrantSourcesForLevel("fighter", 20).map(
                (block) => block.featureLevel
            )
        ).toEqual([undefined, 2, 3, 4, 5, 8, 12, 16, 19]);
    });
});

describe("wizard spell slot resources", () => {
    it("includes level 1 spell slot grant at level 1", () => {
        const grants = getClassGrants("wizard", 1);

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "resource",
                    ref: "spell-slots-1",
                    amount: 2,
                }),
            ])
        );
    });

    it("uses SRD levelIntMax on leveled learn grants by feature level", () => {
        const expectedMaxByFeatureLevel: Record<number, number> = {
            1: 1,
            2: 1,
            3: 2,
            4: 2,
            5: 3,
        };

        for (const [featureLevel, max] of Object.entries(
            expectedMaxByFeatureLevel
        )) {
            const level = Number(featureLevel);
            const leveledSpells = getClassGrantSourcesForLevel("wizard", level)
                .filter((block) => block.featureLevel === level)
                .flatMap((block) => block.grants)
                .filter(
                    (grant) =>
                        grant.grantType === "spell" &&
                        grant.selectionFilter?.levelInt !== 0
                );

            expect(leveledSpells.length).toBeGreaterThan(0);
            for (const grant of leveledSpells) {
                expect(grant.selectionFilter).toEqual(
                    expect.objectContaining({
                        spellLists: ["wizard"],
                        levelIntMax: max,
                    })
                );
                expect(grant.selectionFilter?.levelInt).toBeUndefined();
            }
        }

        const cantrips = getClassGrantSourcesForLevel("wizard", 1)
            .filter((block) => block.featureLevel === 1)
            .flatMap((block) => block.grants)
            .filter((grant) => grant.selectionFilter?.levelInt === 0);

        expect(cantrips).toHaveLength(1);
        expect(cantrips[0]?.selectionFilter).toEqual({
            spellLists: ["wizard"],
            levelInt: 0,
        });
    });

    it("accumulates six resource grants at level 3", () => {
        const grants = getClassGrants("wizard", 3);
        const resourceGrants = grants.filter(
            (grant) => grant.grantType === "resource"
        );

        expect(resourceGrants).toHaveLength(6);
    });

    it("returns subclass unlock level for pilot classes", () => {
        expect(getClassSubclassLevel("wizard")).toBe(3);
        expect(getClassSubclassLevel("fighter")).toBe(3);
        expect(getClassSubclassLevel("barbarian")).toBe(3);
        expect(getClassSubclassLevel("monk")).toBe(3);
        expect(getClassSubclassLevel("warlock")).toBe(3);
    });
});

describe("warlock pact resources", () => {
    it("grants pact slots at level 1, not wizard spell-slots", () => {
        expect(getClass("warlock")).toEqual(
            expect.objectContaining({
                slug: "warlock",
                spellcastingAbility: "charisma",
                spellcastingMode: "pact",
            })
        );

        const grants = getClassGrants("warlock", 1);
        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "resource",
                    ref: "pact-slots",
                    amount: 1,
                    display: "slots",
                    slotLevel: 1,
                    recoverOn: "short_rest",
                }),
            ])
        );
        expect(
            grants.some(
                (grant) =>
                    grant.grantType === "resource" &&
                    grant.ref?.startsWith("spell-slots-")
            )
        ).toBe(false);
    });

    it("raises pact slot count at level 2 and slotLevel at level 3", () => {
        const l2 = getClassGrants("warlock", 2).filter(
            (grant) =>
                grant.grantType === "resource" && grant.ref === "pact-slots"
        );
        const l3 = getClassGrants("warlock", 3).filter(
            (grant) =>
                grant.grantType === "resource" && grant.ref === "pact-slots"
        );

        expect(l2.reduce((sum, grant) => sum + (grant.amount ?? 0), 0)).toBe(2);
        expect(l3.reduce((sum, grant) => sum + (grant.amount ?? 0), 0)).toBe(2);
        expect(Math.max(...l3.map((grant) => grant.slotLevel ?? 0))).toBe(2);
    });
});

describe("barbarian progression", () => {
    it("grants rage uses at level 1", () => {
        const grants = getClassGrants("barbarian", 1);

        expect(grants).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "resource",
                    ref: "rage-uses",
                    amount: 2,
                }),
                expect.objectContaining({
                    grantType: "armor_class_formula",
                    amount: 10,
                    options: [
                        { optionType: "stat", ref: "dexterity" },
                        { optionType: "stat", ref: "constitution" },
                    ],
                }),
            ])
        );
    });

    it("adds a rage use at level 3", () => {
        const grants = getClassGrants("barbarian", 3);
        const rageGrants = grants.filter(
            (grant) =>
                grant.grantType === "resource" && grant.ref === "rage-uses"
        );

        expect(rageGrants).toEqual([
            expect.objectContaining({ amount: 2 }),
            expect.objectContaining({ amount: 1 }),
        ]);
    });
});

describe("monk progression", () => {
    it("grants Unarmored Defense formula at level 1", () => {
        expect(getClassGrants("monk", 1)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "armor_class_formula",
                    amount: 10,
                    options: [
                        { optionType: "stat", ref: "dexterity" },
                        { optionType: "stat", ref: "wisdom" },
                    ],
                }),
            ])
        );
    });

    it("includes Flurry of Blows as a bonus ki spend at level 2", () => {
        expect(getClassGrants("monk", 2)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    grantType: "ability",
                    description: "Flurry of Blows",
                    activation: {
                        cost: "bonus",
                        resourceRef: "ki-points",
                    },
                }),
            ])
        );
        expect(getClassGrants("monk", 1)).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ description: "Flurry of Blows" }),
            ])
        );
    });

    it("accumulates five ki point deltas by level 5", () => {
        const grants = getClassGrants("monk", 5);
        const kiGrants = grants.filter(
            (grant) => grant.grantType === "resource" && grant.ref === "ki-points"
        );

        expect(kiGrants).toEqual([
            expect.objectContaining({ amount: 2 }),
            expect.objectContaining({ amount: 1 }),
            expect.objectContaining({ amount: 1 }),
            expect.objectContaining({ amount: 1 }),
        ]);
        expect(kiGrants.reduce((sum, grant) => sum + (grant.amount ?? 0), 0)).toBe(
            5
        );
    });
});

describe("wizard L5 progression", () => {
    it("includes spell slot deltas through level 5", () => {
        const grants = getClassGrants("wizard", 5);
        const slotTotals = grants
            .filter((grant) => grant.grantType === "resource")
            .reduce<Record<string, number>>((totals, grant) => {
                if (grant.ref) {
                    totals[grant.ref] = (totals[grant.ref] ?? 0) + (grant.amount ?? 0);
                }
                return totals;
            }, {});

        expect(slotTotals).toEqual({
            "spell-slots-1": 4,
            "spell-slots-2": 3,
            "spell-slots-3": 2,
            "spell-slots-4": 1,
        });
    });

    it("accumulates six spell choice blocks by level 5", () => {
        const grants = getClassGrants("wizard", 5);
        const spellChoices = grants.filter(
            (grant) => grant.grantType === "spell" && grant.choose > 0
        );

        expect(spellChoices).toHaveLength(6);
        expect(
            spellChoices.reduce((sum, grant) => sum + grant.choose, 0)
        ).toBe(9);
    });
});

describe("classGrantSourcesFromEntry", () => {
    it("resolves features from the entry without looking up curated classes", () => {
        const blocks = classGrantSourcesFromEntry(
            {
                slug: "custom-class",
                name: "Custom",
                description: "Not in the bundled catalog",
                hitDie: 8,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Base Trait",
                    },
                ],
                featuresByLevel: [
                    {
                        level: 4,
                        grants: [
                            {
                                grantType: "ability_score",
                                choose: 2,
                                amount: 1,
                            },
                        ],
                    },
                ],
            },
            4
        );

        expect(blocks).toHaveLength(2);
        expect(blocks[0]?.grants[0]?.description).toBe("Base Trait");
        expect(blocks[1]?.featureLevel).toBe(4);
        expect(getClass("custom-class")).toBeUndefined();
    });
});
