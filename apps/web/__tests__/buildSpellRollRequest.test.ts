import type { Stats } from "@rpv/domain";
import { listSpellActions } from "../lib/character/combatActions";
import type { StoredCharacter } from "../lib/character/storedCharacter";
import {
    buildSpellAttackRollRequest,
    buildSpellDamageRollRequest,
    resolveAttackThenDamageTotal,
    resolveDamageOnlyTotal,
} from "../lib/roll/buildRollRequest";

const wizardStats: Stats = {
    strength: 8,
    dexterity: 14,
    constitution: 12,
    intelligence: 16,
    wisdom: 10,
    charisma: 10,
    armorClass: 12,
    hitPoints: 8,
};

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

const wizardStored: StoredCharacter = {
    id: "wizard-spell-roll",
    schemaVersion: 1,
    type: "player",
    system: "dnd",
    language: "en",
    name: "Wizard",
    baseStats: wizardStats,
    modifiers: [],
    grants: [
        {
            id: "class-wizard-spell-fire-bolt",
            kind: "spell",
            ref: "fire-bolt",
            source: { type: "class", id: "wizard" },
            name: "Fire Bolt",
        },
        {
            id: "class-wizard-spell-burning-hands",
            kind: "spell",
            ref: "burning-hands",
            source: { type: "class", id: "wizard" },
            name: "Burning Hands",
        },
    ],
    selections: {
        characterClass: "wizard",
        choices: {},
        inventory: { bag: [], equipped: {} },
    },
    resources: { hp: 8 },
    systemData: {
        characterClass: "wizard",
        level: 1,
    },
};

const fighterWithSpellStored: StoredCharacter = {
    ...wizardStored,
    id: "fighter-with-spell",
    name: "Fighter",
    baseStats: fighterStats,
    grants: [
        {
            id: "orphan-spell-fire-bolt",
            kind: "spell",
            ref: "fire-bolt",
            source: { type: "class", id: "fighter" },
            name: "Fire Bolt",
        },
    ],
    selections: {
        characterClass: "fighter",
        choices: {},
        inventory: { bag: [], equipped: {} },
    },
    systemData: {
        characterClass: "fighter",
        level: 1,
    },
};

describe("buildSpellRollRequest", () => {
    it("builds attack_then_damage for fire-bolt on wizard", () => {
        const { cantrips } = listSpellActions(wizardStored, wizardStats);
        const fireBolt = cantrips.find((spell) => spell.slug === "fire-bolt");

        expect(fireBolt).toEqual(
            expect.objectContaining({
                attackModifier: 5,
                rollProfile: {
                    mode: "attack",
                    damageDice: "1d10",
                    damageType: "fire",
                },
            })
        );

        const request = buildSpellAttackRollRequest(fireBolt!);

        expect(request).toEqual({
            kind: "attack_then_damage",
            id: fireBolt!.id,
            label: "Fire Bolt",
            attack: { die: 20, modifier: 5 },
            damage: { sides: 10, damageType: "fire" },
        });

        expect(resolveAttackThenDamageTotal(request!, 14, 6)).toEqual({
            attackTotal: 19,
            damageTotal: 6,
        });
    });

    it("resolves attack modifier from selections.characterClass when systemData omits class", () => {
        const stored: StoredCharacter = {
            ...wizardStored,
            systemData: { level: 1 },
        };

        const { cantrips } = listSpellActions(stored, wizardStats);
        const fireBolt = cantrips.find((spell) => spell.slug === "fire-bolt");

        expect(fireBolt).toEqual(
            expect.objectContaining({
                attackModifier: 5,
            })
        );
        expect(buildSpellAttackRollRequest(fireBolt!)).not.toBeNull();
    });

    it("builds damage_only with three d6 steps for burning-hands", () => {
        const { spells } = listSpellActions(wizardStored, wizardStats);
        const burningHands = spells.find(
            (spell) => spell.slug === "burning-hands"
        );

        expect(burningHands).toEqual(
            expect.objectContaining({
                saveDcValue: 13,
                rollProfile: {
                    mode: "save",
                    saveAbility: "dexterity",
                    damageDice: "3d6",
                    damageType: "fire",
                },
            })
        );

        const request = buildSpellDamageRollRequest(burningHands!);

        expect(request).toEqual({
            kind: "damage_only",
            id: burningHands!.id,
            label: "Burning Hands",
            saveDc: 13,
            saveAbility: "dexterity",
            steps: [
                { sides: 6, damageType: "fire" },
                { sides: 6, damageType: "fire" },
                { sides: 6, damageType: "fire" },
            ],
        });

        expect(
            resolveDamageOnlyTotal(request!.steps, [4, 2, 6])
        ).toBe(12);
    });

    it("returns null builders for fighter without spellcasting", () => {
        const { cantrips } = listSpellActions(
            fighterWithSpellStored,
            fighterStats
        );
        const fireBolt = cantrips[0];

        expect(fireBolt.attackModifier).toBeNull();
        expect(buildSpellAttackRollRequest(fireBolt)).toBeNull();
        expect(buildSpellDamageRollRequest(fireBolt)).toBeNull();
    });
});
