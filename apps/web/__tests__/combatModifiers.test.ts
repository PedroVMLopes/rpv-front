import type { CharacterGrant, Stats } from "@rpv/domain";
import { getItem } from "@rpv/content";
import {
    computeSpellAttackBonus,
    computeSpellSaveDc,
    computeWeaponAttackBonus,
    computeWeaponDamagePreview,
} from "../lib/character/combatModifiers";
import { parseDiceNotation } from "../lib/roll/parseDiceNotation";

const martialProficiency: CharacterGrant = {
    id: "class-fighter-weapon_proficiency-martial-weapons-0",
    kind: "proficiency",
    ref: "martial-weapons",
    source: { type: "class", id: "fighter" },
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

describe("combatModifiers", () => {
    it("computes longsword attack and damage for fighter L1 STR 16", () => {
        const item = getItem("srd_longsword", "dnd");

        expect(item?.weapon).toBeDefined();

        const attackBonus = computeWeaponAttackBonus(
            [martialProficiency],
            item!,
            fighterStats,
            "dnd",
            { level: 1, characterClass: "fighter" }
        );
        const damagePreview = computeWeaponDamagePreview(
            item!,
            fighterStats,
            "dnd"
        );

        expect(attackBonus).toBe(5);
        expect(damagePreview).toBe("1d8+3 slashing");
    });

    it("computes spell attack and save DC for wizard L1 INT 16", () => {
        const systemData = { level: 1, characterClass: "wizard" };

        expect(
            computeSpellAttackBonus(wizardStats, "dnd", systemData)
        ).toBe(5);
        expect(computeSpellSaveDc(wizardStats, "dnd", systemData)).toBe(13);
    });

    it("returns null spell modifiers for fighter without spellcasting", () => {
        const systemData = { level: 1, characterClass: "fighter" };

        expect(
            computeSpellAttackBonus(fighterStats, "dnd", systemData)
        ).toBeNull();
        expect(computeSpellSaveDc(fighterStats, "dnd", systemData)).toBeNull();
    });
});

describe("parseDiceNotation", () => {
    it("parses single and multi-die notation", () => {
        expect(parseDiceNotation("1d8")).toEqual({ count: 1, sides: 8 });
        expect(parseDiceNotation("3d6")).toEqual({ count: 3, sides: 6 });
        expect(parseDiceNotation("1d10")).toEqual({ count: 1, sides: 10 });
    });

    it("throws for invalid notation", () => {
        expect(() => parseDiceNotation("d8")).toThrow();
        expect(() => parseDiceNotation("1d")).toThrow();
    });
});
