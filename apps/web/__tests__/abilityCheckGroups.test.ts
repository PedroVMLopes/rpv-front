import { createDefaultStats } from "@rpv/domain";
import { groupAbilityChecks } from "../lib/character/abilityCheckGroups";

const stats = createDefaultStats({
    strength: 16,
    dexterity: 14,
    constitution: 12,
    intelligence: 10,
    wisdom: 10,
    charisma: 8,
});

describe("groupAbilityChecks", () => {
    it("orders groups by system saving-throw order", () => {
        const groups = groupAbilityChecks("dnd", stats, [], 1);

        expect(groups.map((group) => group.stat)).toEqual([
            "strength",
            "dexterity",
            "constitution",
            "intelligence",
            "wisdom",
            "charisma",
        ]);
    });

    it("always includes a saving throw and leaves constitution without skills", () => {
        const groups = groupAbilityChecks("dnd", stats, [], 1);
        const constitution = groups.find((group) => group.stat === "constitution");

        expect(constitution?.save.stat).toBe("constitution");
        expect(constitution?.skills).toEqual([]);
    });

    it("attaches dexterity skills in catalog order", () => {
        const groups = groupAbilityChecks("dnd", stats, [], 1);
        const dexterity = groups.find((group) => group.stat === "dexterity");

        expect(dexterity?.skills.map((skill) => skill.slug)).toEqual([
            "acrobatics",
            "sleight-of-hand",
            "stealth",
        ]);
    });

    it("uses resolved score and ability modifier on each group", () => {
        const groups = groupAbilityChecks("dnd", stats, [], 1);
        const strength = groups.find((group) => group.stat === "strength");

        expect(strength?.score).toBe(16);
        expect(strength?.modifier).toBe(3);
        expect(strength?.save.modifier).toBe(3);
    });
});
