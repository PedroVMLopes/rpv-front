import { getSpellRollProfile } from "../src/curation/spellCombat.dnd";

describe("spellCombat.dnd", () => {
    it("returns attack profile for fire-bolt", () => {
        expect(getSpellRollProfile("fire-bolt")).toEqual({
            mode: "attack",
            damageDice: "1d10",
            damageType: "fire",
        });
    });

    it("returns save profile for burning-hands", () => {
        expect(getSpellRollProfile("burning-hands")).toEqual({
            mode: "save",
            saveAbility: "dexterity",
            damageDice: "3d6",
            damageType: "fire",
        });
    });

    it("returns undefined for unknown spell", () => {
        expect(getSpellRollProfile("unknown-spell")).toBeUndefined();
    });
});
