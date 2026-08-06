import { getItem } from "@rpv/content";
import type { Stats } from "@rpv/domain";
import { listEquippedWeaponActions } from "../lib/character/combatActions";
import {
    buildWeaponAttackRollRequest,
    resolveAttackThenDamageTotal,
} from "../lib/roll/buildRollRequest";
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
    id: "fighter-weapon-roll",
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
        },
    },
    resources: { hp: 10 },
    systemData: {
        characterClass: "fighter",
        level: 1,
    },
};

describe("buildWeaponAttackRollRequest", () => {
    it("builds attack_then_damage for equipped longsword", () => {
        const [weapon] = listEquippedWeaponActions(
            fighterStored,
            fighterStats
        );

        expect(weapon).toEqual(
            expect.objectContaining({
                slug: "srd_longsword",
                attackModifier: 5,
                damageDice: "1d8",
                damageFlat: 3,
                damageType: "slashing",
            })
        );

        const request = buildWeaponAttackRollRequest(weapon);

        expect(request).toEqual({
            kind: "attack_then_damage",
            id: weapon.id,
            label: "Longsword",
            attack: { die: 20, modifier: 5 },
            damage: { sides: 8, flat: 3, damageType: "slashing" },
        });
    });

    it("resolves attack and damage totals", () => {
        const [weapon] = listEquippedWeaponActions(
            fighterStored,
            fighterStats
        );
        const request = buildWeaponAttackRollRequest(weapon)!;

        expect(resolveAttackThenDamageTotal(request, 14, 5)).toEqual({
            attackTotal: 19,
            damageTotal: 8,
        });
    });

    it("returns null when item has no weapon profile", () => {
        const item = getItem("srd_leather-armor", "dnd");
        expect(item?.weapon).toBeNull();

        const request = buildWeaponAttackRollRequest({
            id: "armor-leather-armor",
            slug: "srd_leather-armor",
            name: "Leather Armor",
            slotId: "melee-main",
            attackModifier: null,
        });

        expect(request).toBeNull();
    });
});
