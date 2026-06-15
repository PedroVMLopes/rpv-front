import { dndSkills } from "@rpv/content";
import { createDefaultStats } from "@rpv/domain";
import type { CharacterGrant } from "@rpv/domain";
import {
    abilityModifier,
    computeSkillModifiers,
    formatModifier,
    getProficientSkillSlugs,
    proficiencyBonus,
    readCharacterLevel,
} from "../lib/character/skillModifiers";

describe("abilityModifier", () => {
    it("computes standard D&D ability modifiers", () => {
        expect(abilityModifier(8)).toBe(-1);
        expect(abilityModifier(10)).toBe(0);
        expect(abilityModifier(14)).toBe(2);
        expect(abilityModifier(20)).toBe(5);
    });
});

describe("proficiencyBonus", () => {
    it("follows the level-based progression", () => {
        expect(proficiencyBonus(1)).toBe(2);
        expect(proficiencyBonus(4)).toBe(2);
        expect(proficiencyBonus(5)).toBe(3);
        expect(proficiencyBonus(20)).toBe(6);
    });

    it("defaults invalid levels to level 1 bonus", () => {
        expect(proficiencyBonus(0)).toBe(2);
        expect(proficiencyBonus(Number.NaN)).toBe(2);
    });
});

describe("readCharacterLevel", () => {
    it("coerces numeric and string levels", () => {
        expect(readCharacterLevel({ level: 5 })).toBe(5);
        expect(readCharacterLevel({ level: "3" })).toBe(3);
        expect(readCharacterLevel({})).toBe(1);
    });
});

describe("getProficientSkillSlugs", () => {
    const grants: CharacterGrant[] = [
        {
            id: "class-stealth",
            kind: "proficiency",
            ref: "stealth",
            source: { type: "class", id: "rogue" },
        },
        {
            id: "class-armor",
            kind: "proficiency",
            ref: "light-armor",
            source: { type: "class", id: "rogue" },
        },
        {
            id: "race-tools",
            kind: "proficiency",
            ref: "smiths-tools",
            source: { type: "race", id: "dwarf" },
        },
    ];

    it("includes skill proficiencies and excludes non-skill refs", () => {
        const slugs = getProficientSkillSlugs(grants, dndSkills);

        expect(slugs.has("stealth")).toBe(true);
        expect(slugs.has("light-armor")).toBe(false);
        expect(slugs.has("smiths-tools")).toBe(false);
    });
});

describe("formatModifier", () => {
    it("formats signed modifiers", () => {
        expect(formatModifier(3)).toBe("+3");
        expect(formatModifier(-1)).toBe("-1");
        expect(formatModifier(0)).toBe("+0");
    });
});

describe("computeSkillModifiers", () => {
    const stats = createDefaultStats({
        dexterity: 14,
        intelligence: 10,
    });

    it("adds proficiency bonus to proficient skills", () => {
        const modifiers = computeSkillModifiers(
            stats,
            [
                {
                    id: "class-stealth",
                    kind: "proficiency",
                    ref: "stealth",
                    source: { type: "class", id: "rogue" },
                },
            ],
            1,
            dndSkills
        );

        const stealth = modifiers.find((entry) => entry.slug === "stealth");
        expect(stealth).toEqual(
            expect.objectContaining({
                modifier: 4,
                proficient: true,
            })
        );
    });

    it("uses ability modifier only for non-proficient skills", () => {
        const modifiers = computeSkillModifiers(stats, [], 1, dndSkills);

        const arcana = modifiers.find((entry) => entry.slug === "arcana");
        expect(arcana).toEqual(
            expect.objectContaining({
                modifier: 0,
                proficient: false,
            })
        );
    });

    it("uses the governing ability for each skill", () => {
        const modifiers = computeSkillModifiers(
            {
                ...createDefaultStats(),
                strength: 16,
            },
            [
                {
                    id: "class-athletics",
                    kind: "proficiency",
                    ref: "athletics",
                    source: { type: "class", id: "fighter" },
                },
            ],
            1,
            dndSkills
        );

        const athletics = modifiers.find((entry) => entry.slug === "athletics");
        expect(athletics?.modifier).toBe(5);
    });
});
