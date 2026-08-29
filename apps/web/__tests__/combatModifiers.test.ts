import type { CharacterGrant, Stats } from "@rpv/domain";
import { getItem } from "@rpv/content";
import {
    computeNaturalWeaponAttackBonus,
    computeNaturalWeaponDamagePreview,
    computeNaturalWeaponDamageTotal,
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

    it("uses Dexterity for longbow attacks", () => {
        const item = getItem("srd_longbow", "dnd")!;
        const attackBonus = computeWeaponAttackBonus(
            [martialProficiency],
            item,
            fighterStats,
            "dnd",
            { level: 1, characterClass: "fighter" }
        );

        expect(attackBonus).toBe(4);
        expect(computeWeaponDamagePreview(item, fighterStats, "dnd")).toBe(
            "1d8+2 piercing"
        );
    });

    it("uses max(STR, DEX) for a finesse dagger", () => {
        const item = getItem("srd_dagger", "dnd")!;
        const attackBonus = computeWeaponAttackBonus(
            [],
            item,
            fighterStats,
            "dnd",
            { level: 1, characterClass: "wizard" }
        );

        expect(attackBonus).toBe(3);
        expect(computeWeaponDamagePreview(item, fighterStats, "dnd")).toBe(
            "1d4+3 piercing"
        );
    });

    it("honors a specific longsword proficiency without martial weapons", () => {
        const item = getItem("srd_longsword", "dnd")!;
        const elfProficiency: CharacterGrant = {
            id: "race-high-elf-weapon_proficiency-longsword-0",
            kind: "proficiency",
            ref: "longsword",
            source: { type: "race", id: "high-elf" },
        };

        expect(
            computeWeaponAttackBonus(
                [elfProficiency],
                item,
                wizardStats,
                "dnd",
                { level: 1, characterClass: "wizard" }
            )
        ).toBe(1);
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

    it("computes unarmed strike for fighter L1 STR 16", () => {
        const unarmed = {
            attackAbility: "strength" as const,
            alwaysProficient: true,
            damageFlatBase: 1,
            damageType: "bludgeoning",
        };

        expect(
            computeNaturalWeaponAttackBonus(
                unarmed,
                fighterStats,
                "dnd",
                { level: 1, characterClass: "fighter" }
            )
        ).toBe(5);
        expect(
            computeNaturalWeaponDamagePreview(unarmed, fighterStats, "dnd")
        ).toBe("1+3 bludgeoning");
        expect(
            computeNaturalWeaponDamageTotal(unarmed, fighterStats, "dnd")
        ).toBe(4);
    });

    it("computes unarmed strike for wizard L1 STR 8 without weapon proficiency", () => {
        const unarmed = {
            attackAbility: "strength" as const,
            alwaysProficient: true,
            damageFlatBase: 1,
            damageType: "bludgeoning",
        };

        expect(
            computeNaturalWeaponAttackBonus(
                unarmed,
                wizardStats,
                "dnd",
                { level: 1, characterClass: "wizard" }
            )
        ).toBe(1);
        expect(
            computeNaturalWeaponDamagePreview(unarmed, wizardStats, "dnd")
        ).toBe("0 bludgeoning");
        expect(
            computeNaturalWeaponDamageTotal(unarmed, wizardStats, "dnd")
        ).toBe(0);
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

    it("trims whitespace and rejects zero count or sides", () => {
        expect(parseDiceNotation("  2d6  ")).toEqual({ count: 2, sides: 6 });
        expect(() => parseDiceNotation("0d8")).toThrow(
            "Invalid dice notation: 0d8"
        );
        expect(() => parseDiceNotation("1d0")).toThrow(
            "Invalid dice notation: 1d0"
        );
        expect(() => parseDiceNotation("2D6")).toThrow(
            "Invalid dice notation: 2D6"
        );
    });
});
