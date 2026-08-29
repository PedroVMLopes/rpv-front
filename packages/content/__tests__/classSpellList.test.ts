import {
    getClassGrants,
    listClassListSpells,
    listFixedSpellRefsFromGrants,
    maxSpellSlotLevelFromGrants,
} from "../src";

describe("classSpellList", () => {
    it("reads max slot level from class resource grants", () => {
        expect(maxSpellSlotLevelFromGrants(getClassGrants("cleric", 1))).toBe(1);
        expect(maxSpellSlotLevelFromGrants(getClassGrants("cleric", 3))).toBe(2);
        expect(maxSpellSlotLevelFromGrants(getClassGrants("fighter", 1))).toBe(0);
    });

    it("lists cleric leveled spells up to the current slot maximum", () => {
        const l1 = listClassListSpells("cleric", 1).map((spell) => spell.slug);

        expect(l1).toEqual(
            expect.arrayContaining(["bless", "cure-wounds", "detect-magic", "guiding-bolt"])
        );
        expect(l1).not.toContain("hold-person");
        expect(l1).not.toContain("sacred-flame");
        expect(l1).not.toContain("fire-bolt");
    });

    it("collects fixed spell option refs", () => {
        expect(
            listFixedSpellRefsFromGrants([
                {
                    grantType: "spell",
                    choose: 0,
                    options: [
                        { optionType: "spell", ref: "bless" },
                        { optionType: "spell", ref: "cure-wounds" },
                    ],
                },
            ])
        ).toEqual(["bless", "cure-wounds"]);
    });
});
