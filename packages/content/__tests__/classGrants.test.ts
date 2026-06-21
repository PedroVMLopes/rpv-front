import {
    getClass,
    getClassGrants,
    getClassGrantSourcesForLevel,
    getClassHitDie,
    listClasses,
} from "../src/curation/classGrants.dnd";

describe("classGrants.dnd", () => {
    it("lists curated classes", () => {
        const classes = listClasses();

        expect(classes.length).toBeGreaterThan(0);
        expect(classes.map((entry) => entry.slug)).toEqual(
            expect.arrayContaining(["fighter", "wizard", "rogue", "cleric"])
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
            })
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

        expect(fighterSaveGrant?.options?.map((option) => option.ref)).toEqual([
            "strength",
            "constitution",
        ]);
        expect(wizardSaveGrant?.options?.map((option) => option.ref)).toEqual([
            "intelligence",
            "wisdom",
        ]);
        expect(rogueSaveGrant?.options?.map((option) => option.ref)).toEqual([
            "dexterity",
            "intelligence",
        ]);
        expect(clericSaveGrant?.options?.map((option) => option.ref)).toEqual([
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
                    description: "Additional skill (Level 3)",
                }),
            ])
        );
    });

    it("getClassGrantSourcesForLevel separates base and level blocks", () => {
        const blocks = getClassGrantSourcesForLevel("fighter", 3);

        expect(blocks).toHaveLength(3);
        expect(blocks[0].featureLevel).toBeUndefined();
        expect(blocks[1].featureLevel).toBe(2);
        expect(blocks[2].featureLevel).toBe(3);
    });
});
