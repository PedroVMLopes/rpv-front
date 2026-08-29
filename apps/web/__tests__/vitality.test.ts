import {
    applyDamage,
    applyDeathSaveMark,
    applyHeal,
    applyVitalityToCharacter,
    HIT_DICE_RESOURCE,
    isDead,
    isDying,
    isStable,
    mergeHitDiceCurrent,
    suggestDeathSaveOutcome,
} from "../lib/character/vitality";
import { emptyInventory } from "@rpv/domain";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { dndVitality } from "../presets/dnd/rules";

const baseStored: StoredCharacter = {
    id: "vitality-hero",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Hero",
    baseStats: {
        strength: 10,
        dexterity: 10,
        constitution: 14,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        armorClass: 10,
        hitPoints: 20,
    },
    modifiers: [],
    grants: [],
    selections: { inventory: emptyInventory(), choices: {} },
    resources: { hp: 10, [HIT_DICE_RESOURCE]: 3 },
    systemData: { level: 3 },
};

const context = {
    maxHp: 20,
    constitution: 14,
    hitDieHeal: dndVitality.hitDieHeal,
    hitDiceRef: HIT_DICE_RESOURCE,
};

describe("vitality helpers", () => {
    it("applies damage to temp HP before current HP", () => {
        expect(applyDamage({ hp: 10, tempHp: 5, amount: 3 })).toEqual({
            hp: 10,
            tempHp: 2,
        });
        expect(applyDamage({ hp: 10, tempHp: 5, amount: 8 })).toEqual({
            hp: 7,
            tempHp: 0,
        });
    });

    it("does not let HP fall below 0", () => {
        expect(applyDamage({ hp: 4, tempHp: 0, amount: 10 })).toEqual({
            hp: 0,
            tempHp: 0,
        });
    });

    it("heals without restoring temp HP and clears death saves when leaving 0 HP", () => {
        expect(
            applyHeal({
                hp: 4,
                maxHp: 20,
                amount: 3,
                deathSaves: { successes: 1, failures: 0 },
            })
        ).toEqual({
            hp: 7,
            deathSaves: { successes: 1, failures: 0 },
        });
        expect(
            applyHeal({
                hp: 0,
                maxHp: 20,
                amount: 5,
                deathSaves: { successes: 2, failures: 1 },
            })
        ).toEqual({ hp: 5 });
    });

    it("suggests death-save outcomes from the d20, using extras only for the 10+ check", () => {
        expect(suggestDeathSaveOutcome(1)).toBe("critical_failure");
        expect(suggestDeathSaveOutcome(20)).toBe("critical_success");
        expect(suggestDeathSaveOutcome(10)).toBe("success");
        expect(suggestDeathSaveOutcome(9)).toBe("failure");
        expect(suggestDeathSaveOutcome(8, 2)).toBe("success");
    });

    it("marks death save pips and treats 3 failures as dead and 3 successes as stable", () => {
        expect(applyDeathSaveMark(undefined, "success")).toEqual({
            successes: 1,
            failures: 0,
        });
        expect(
            applyDeathSaveMark({ successes: 0, failures: 1 }, "critical_failure")
        ).toEqual({ successes: 0, failures: 3 });
        expect(isDead({ successes: 0, failures: 3 })).toBe(true);
        expect(isStable(0, { successes: 3, failures: 0 })).toBe(true);
        expect(isDying(0, { successes: 1, failures: 0 })).toBe(true);
        expect(isDying(0, { successes: 0, failures: 3 })).toBe(false);
    });

    it("sets temporary hit points without changing current HP", () => {
        const next = applyVitalityToCharacter(
            baseStored,
            { type: "setTempHp", value: 7 },
            context
        );
        expect(next.resources.hp).toBe(10);
        expect(next.session?.tempHp).toBe(7);
    });

    it("credits unused hit dice when the maximum increases", () => {
        expect(
            mergeHitDiceCurrent({ existing: 2, max: 6, previousMax: 5 })
        ).toBe(3);
        expect(mergeHitDiceCurrent({ existing: undefined, max: 3 })).toBe(3);
        expect(
            mergeHitDiceCurrent({ existing: 6, max: 5, previousMax: 6 })
        ).toBe(5);
    });

    it("recovers half hit dice on a long rest, at least one", () => {
        expect(dndVitality.longRestHitDiceRecover(2, 10)).toBe(7);
        expect(dndVitality.longRestHitDiceRecover(0, 1)).toBe(1);
        expect(dndVitality.longRestHitDiceRecover(4, 4)).toBe(4);
    });

    it("applies vitality changes on a stored character", () => {
        const damaged = applyVitalityToCharacter(
            {
                ...baseStored,
                session: { tempHp: 4 },
            },
            { type: "damage", amount: 6 },
            context
        );
        expect(damaged.resources.hp).toBe(8);
        expect(damaged.session?.tempHp).toBeUndefined();

        const healedFromZero = applyVitalityToCharacter(
            {
                ...baseStored,
                resources: { ...baseStored.resources, hp: 0 },
                session: { deathSaves: { successes: 2, failures: 1 } },
            },
            { type: "heal", amount: 3 },
            context
        );
        expect(healedFromZero.resources.hp).toBe(3);
        expect(healedFromZero.session?.deathSaves).toBeUndefined();

        const spent = applyVitalityToCharacter(
            baseStored,
            { type: "spendHitDie", dieRoll: 8 },
            context
        );
        expect(spent.resources[HIT_DICE_RESOURCE]).toBe(2);
        expect(spent.resources.hp).toBe(10 + dndVitality.hitDieHeal(8, 14));

        const nat20 = applyVitalityToCharacter(
            {
                ...baseStored,
                resources: { ...baseStored.resources, hp: 0 },
            },
            { type: "deathSave", outcome: "critical_success" },
            context
        );
        expect(nat20.resources.hp).toBe(1);
        expect(nat20.session?.deathSaves).toBeUndefined();
    });
});
