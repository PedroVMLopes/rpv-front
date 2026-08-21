import type { Stats } from "@rpv/domain";
import { emptyInventory } from "@rpv/domain";
import {
    buildWeaponActionForEquippedSlot,
    isWeaponSlotId,
    listEquippedWeaponActions,
    listNaturalWeaponActions,
} from "../lib/character/combatActions";
import type { StoredCharacter } from "../lib/character/storedCharacter";

const fighterStats: Stats = {
    strength: 16,
    dexterity: 14,
    constitution: 12,
    intelligence: 10,
    wisdom: 10,
    charisma: 8,
    armorClass: 16,
    hitPoints: 12,
};

const fighterStored: StoredCharacter = {
    id: "fighter-combat-actions",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Fighter",
    baseStats: fighterStats,
    modifiers: [],
    grants: [
        {
            id: "class-fighter-weapon_proficiency-martial-weapons-0",
            kind: "proficiency",
            ref: "martial-weapons",
            source: { type: "class", id: "fighter" },
        },
    ],
    selections: {
        characterClass: "fighter",
        choices: {},
        inventory: {
            bag: [{ slug: "srd_longsword", quantity: 1 }],
            equipped: { "melee-main": "srd_longsword" },
            equippedMulti: {},
        },
    },
    resources: { hp: 10 },
    systemData: {
        characterClass: "fighter",
        level: 1,
    },
};

describe("isWeaponSlotId", () => {
    it("accepts equipped hand slots and rejects other equipment ids", () => {
        expect(isWeaponSlotId("melee-main")).toBe(true);
        expect(isWeaponSlotId("melee-off")).toBe(true);
        expect(isWeaponSlotId("ranged-main")).toBe(true);
        expect(isWeaponSlotId("ranged-off")).toBe(true);
        expect(isWeaponSlotId("natural")).toBe(false);
        expect(isWeaponSlotId("breast")).toBe(false);
        expect(isWeaponSlotId("usable")).toBe(false);
        expect(isWeaponSlotId("")).toBe(false);
    });
});

describe("buildWeaponActionForEquippedSlot", () => {
    it("builds a longsword action for the equipped melee slot", () => {
        const action = buildWeaponActionForEquippedSlot(
            fighterStored,
            fighterStats,
            "melee-main",
            "srd_longsword"
        );

        expect(action).toEqual(
            expect.objectContaining({
                id: "melee-main-srd_longsword",
                slug: "srd_longsword",
                name: "Longsword",
                slotId: "melee-main",
                attackModifier: 5,
                damageDice: "1d8",
                damageType: "slashing",
            })
        );
    });
});

describe("listEquippedWeaponActions", () => {
    it("lists equipped weapons from a stored character", () => {
        expect(
            listEquippedWeaponActions(fighterStored, fighterStats).map(
                (action) => action.slug
            )
        ).toEqual(["srd_longsword"]);
    });

    it("lists equipped weapons from selections without stored grants or stats", () => {
        const actions = listEquippedWeaponActions(
            {
                choices: {},
                inventory: {
                    bag: [{ slug: "srd_longsword", quantity: 1 }],
                    equipped: { "ranged-main": "srd_longsword" },
                    equippedMulti: {},
                },
            },
            "dnd"
        );

        expect(actions).toEqual([
            expect.objectContaining({
                slug: "srd_longsword",
                slotId: "ranged-main",
                name: "Longsword",
            }),
        ]);
    });

    it("skips empty weapon slots", () => {
        expect(
            listEquippedWeaponActions(
                {
                    ...fighterStored,
                    selections: {
                        ...fighterStored.selections,
                        inventory: emptyInventory(),
                    },
                },
                fighterStats
            )
        ).toEqual([]);
    });

    it("skips shield equipped in a hand slot", () => {
        expect(
            listEquippedWeaponActions(
                {
                    ...fighterStored,
                    selections: {
                        ...fighterStored.selections,
                        inventory: {
                            bag: [{ slug: "srd_shield", quantity: 1 }],
                            equipped: { "melee-off": "srd_shield" },
                            equippedMulti: {},
                        },
                    },
                },
                fighterStats
            )
        ).toEqual([]);
    });

    it("lists longsword but not off-hand shield", () => {
        expect(
            listEquippedWeaponActions(
                {
                    ...fighterStored,
                    selections: {
                        ...fighterStored.selections,
                        inventory: {
                            bag: [
                                { slug: "srd_longsword", quantity: 1 },
                                { slug: "srd_shield", quantity: 1 },
                            ],
                            equipped: {
                                "melee-main": "srd_longsword",
                                "melee-off": "srd_shield",
                            },
                            equippedMulti: {},
                        },
                    },
                },
                fighterStats
            ).map((action) => action.slug)
        ).toEqual(["srd_longsword"]);
    });

    it("skips non-weapon items equipped in hand slots", () => {
        expect(
            listEquippedWeaponActions(
                {
                    ...fighterStored,
                    selections: {
                        ...fighterStored.selections,
                        inventory: {
                            bag: [
                                { slug: "rpv_amulet-of-vitality", quantity: 1 },
                            ],
                            equipped: {
                                "melee-main": "rpv_amulet-of-vitality",
                            },
                            equippedMulti: {},
                        },
                    },
                },
                fighterStats
            )
        ).toEqual([]);
    });
});

describe("listNaturalWeaponActions", () => {
    it("always includes unarmed strike for D&D characters", () => {
        const [unarmed] = listNaturalWeaponActions(fighterStored, fighterStats);

        expect(unarmed).toEqual(
            expect.objectContaining({
                slug: "unarmed-strike",
                slotId: "natural",
                attackModifier: 5,
                damageBase: 1,
                damageFlat: 3,
                damageType: "bludgeoning",
            })
        );
    });
});
