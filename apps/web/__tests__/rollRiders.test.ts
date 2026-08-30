import type { ConditionRollEffect } from "@rpv/content";
import {
    appliesToOf,
    d20Needed,
    defaultAdvantageMode,
    extraDiceSidesFor,
    pickD20,
} from "../lib/roll/rollRiders";

const blessed: ConditionRollEffect = {
    kind: "extra_die",
    sides: 4,
    appliesTo: ["attack", "save"],
};

const poisoned: ConditionRollEffect = {
    kind: "disadvantage",
    appliesTo: ["attack", "ability_check"],
};

describe("rollRiders", () => {
    it("maps request kinds onto appliesTo", () => {
        expect(
            appliesToOf({
                kind: "d20_test",
                id: "skill:athletics",
                label: "Athletics",
                die: 20,
                modifier: 5,
                appliesTo: "ability_check",
            })
        ).toBe("ability_check");
        expect(
            appliesToOf({
                kind: "attack_then_damage",
                id: "weapon:longsword",
                label: "Longsword",
                attack: { die: 20, modifier: 5 },
                damage: { sides: 8 },
            })
        ).toBe("attack");
        expect(
            appliesToOf({
                kind: "damage_only",
                id: "spell:fireball",
                label: "Fireball",
                steps: [{ sides: 6 }],
            })
        ).toBeUndefined();
        expect(
            appliesToOf({
                kind: "death_save",
                id: "death-save:hero",
                label: "Death saves",
                characterId: "hero",
                die: 20,
            })
        ).toBe("save");
    });

    it("preselects disadvantage from poisoned on matching rolls", () => {
        expect(defaultAdvantageMode([poisoned], "attack")).toBe(
            "disadvantage"
        );
        expect(defaultAdvantageMode([poisoned], "ability_check")).toBe(
            "disadvantage"
        );
        expect(defaultAdvantageMode([poisoned], "save")).toBe("normal");
    });

    it("cancels advantage against disadvantage", () => {
        expect(
            defaultAdvantageMode(
                [
                    poisoned,
                    {
                        kind: "advantage",
                        appliesTo: ["attack"],
                    },
                ],
                "attack"
            )
        ).toBe("normal");
    });

    it("collects extra d4 for bless on attack and save only", () => {
        expect(extraDiceSidesFor([blessed], "attack")).toEqual([4]);
        expect(extraDiceSidesFor([blessed], "save")).toEqual([4]);
        expect(extraDiceSidesFor([blessed], "ability_check")).toEqual([]);
    });

    it("picks high and low d20s for advantage modes", () => {
        expect(d20Needed("normal")).toBe(1);
        expect(d20Needed("advantage")).toBe(2);
        expect(d20Needed("inspiration")).toBe(2);
        expect(pickD20([8, 17], "advantage")).toBe(17);
        expect(pickD20([8, 17], "inspiration")).toBe(17);
        expect(pickD20([8, 17], "disadvantage")).toBe(8);
        expect(pickD20([8, 17], "normal")).toBe(8);
    });
});
