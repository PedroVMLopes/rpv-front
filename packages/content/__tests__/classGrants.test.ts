import {
    getClass,
    getClassGrants,
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
            })
        );
    });

    it("returns empty grants for unknown class", () => {
        expect(getClassGrants("unknown")).toEqual([]);
    });
});
