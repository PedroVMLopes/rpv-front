import { applyDerivedCombatStats } from "../lib/character/applyDerivedCombatStats";

const fighterForm = {
    characterClass: "fighter",
    level: 1,
    attributes: [
        { name: "strength", value: 10 },
        { name: "dexterity", value: 14 },
        { name: "constitution", value: 14 },
        { name: "intelligence", value: 10 },
        { name: "wisdom", value: 10 },
        { name: "charisma", value: 10 },
    ],
};

describe("applyDerivedCombatStats", () => {
    it("fills empty maxHp, current hp, and ac from class and ability scores", () => {
        expect(applyDerivedCombatStats({ ...fighterForm }, "dnd", "en")).toEqual(
            expect.objectContaining({
                maxHp: 12,
                hp: 12,
                ac: 12,
            })
        );
    });

    it("does not overwrite provided combat stats", () => {
        expect(
            applyDerivedCombatStats(
                { ...fighterForm, maxHp: 20, hp: 7, ac: 18 },
                "dnd",
                "en"
            )
        ).toEqual(
            expect.objectContaining({
                maxHp: 20,
                hp: 7,
                ac: 18,
            })
        );
    });

    it("fills maxHp without clobbering an already-entered current hp", () => {
        expect(
            applyDerivedCombatStats(
                { ...fighterForm, hp: 8 },
                "dnd",
                "en"
            )
        ).toEqual(
            expect.objectContaining({
                maxHp: 12,
                hp: 8,
                ac: 12,
            })
        );
    });

    it("leaves maxHp empty when there is no class to derive from, but still fills ac", () => {
        const withoutClass = {
            level: fighterForm.level,
            attributes: fighterForm.attributes,
        };

        const result = applyDerivedCombatStats(withoutClass, "dnd", "en");

        expect(result).toEqual(expect.objectContaining({ ac: 12 }));
        expect(result).not.toHaveProperty("maxHp");
        expect(result).not.toHaveProperty("hp");
    });

    it("does not backfill current hp when maxHp is already set", () => {
        expect(
            applyDerivedCombatStats(
                { ...fighterForm, maxHp: 12 },
                "dnd",
                "en"
            )
        ).toEqual(
            expect.objectContaining({
                maxHp: 12,
                ac: 12,
            })
        );
        expect(
            applyDerivedCombatStats(
                { ...fighterForm, maxHp: 12 },
                "dnd",
                "en"
            )
        ).not.toHaveProperty("hp");
    });
});
