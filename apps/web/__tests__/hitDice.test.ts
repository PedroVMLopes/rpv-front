import { emptyInventory } from "@rpv/domain";
import {
    buildHitDiceMerge,
    getHitDicePool,
    getHitDieSides,
    isHitDiceResource,
} from "../lib/character/hitDice";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import { HIT_DICE_RESOURCE } from "../lib/character/vitality";

const fighter: StoredCharacter = {
    id: "hit-dice-fighter",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Fighter",
    baseStats: {
        strength: 16,
        dexterity: 12,
        constitution: 14,
        intelligence: 10,
        wisdom: 10,
        charisma: 8,
        armorClass: 16,
        hitPoints: 32,
    },
    modifiers: [],
    grants: [],
    selections: {
        characterClass: "fighter",
        inventory: emptyInventory(),
        choices: {},
    },
    resources: { hp: 32 },
    systemData: { characterClass: "fighter", level: 4 },
};

describe("buildHitDiceMerge", () => {
    it("returns undefined without a class hit die or a positive max", () => {
        expect(buildHitDiceMerge("dnd", 4, undefined)).toBeUndefined();
        expect(buildHitDiceMerge("dnd", 4, "not-a-class")).toBeUndefined();
        expect(buildHitDiceMerge("dnd", 0, "fighter")).toBeUndefined();
    });

    it("uses the class hit die and credits previousMax on level-up", () => {
        expect(buildHitDiceMerge("dnd", 4, "fighter")).toEqual({
            ref: HIT_DICE_RESOURCE,
            max: 4,
        });
        expect(buildHitDiceMerge("dnd", 4, "fighter", 3)).toEqual({
            ref: HIT_DICE_RESOURCE,
            max: 4,
            previousMax: 3,
        });
    });
});

describe("getHitDieSides", () => {
    it("returns the class hit die when it is a rollable size", () => {
        expect(getHitDieSides(fighter)).toBe(10);
        expect(
            getHitDieSides({
                ...fighter,
                selections: {
                    ...fighter.selections,
                    characterClass: "wizard",
                },
            })
        ).toBe(6);
    });

    it("returns undefined without a class", () => {
        expect(
            getHitDieSides({
                ...fighter,
                selections: { inventory: emptyInventory(), choices: {} },
            })
        ).toBeUndefined();
    });
});

describe("getHitDicePool", () => {
    it("defaults current to max when the resource is missing", () => {
        expect(getHitDicePool(fighter)).toEqual({
            ref: HIT_DICE_RESOURCE,
            current: 4,
            max: 4,
            sides: 10,
        });
    });

    it("clamps current into 0..max", () => {
        expect(
            getHitDicePool({
                ...fighter,
                resources: { hp: 32, [HIT_DICE_RESOURCE]: 99 },
            })
        ).toEqual({
            ref: HIT_DICE_RESOURCE,
            current: 4,
            max: 4,
            sides: 10,
        });
        expect(
            getHitDicePool({
                ...fighter,
                resources: { hp: 32, [HIT_DICE_RESOURCE]: -2 },
            })
        ).toEqual({
            ref: HIT_DICE_RESOURCE,
            current: 0,
            max: 4,
            sides: 10,
        });
    });

    it("returns undefined without a class hit die even when level is positive", () => {
        expect(
            getHitDicePool({
                ...fighter,
                selections: { inventory: emptyInventory(), choices: {} },
            })
        ).toBeUndefined();
    });
});

describe("isHitDiceResource", () => {
    it("matches only the hit-dice ref", () => {
        expect(isHitDiceResource(HIT_DICE_RESOURCE)).toBe(true);
        expect(isHitDiceResource("hp")).toBe(false);
        expect(isHitDiceResource("spell-slots-1")).toBe(false);
    });
});
