import { dndSkills } from "@rpv/content";
import { createDefaultStats } from "@rpv/domain";
import type { CharacterGrant } from "@rpv/domain";
import {
    dndAbilityModifier,
    dndProficiencyBonus,
} from "../presets/dnd/math";
import {
    computeSkillModifiers,
    formatModifier,
    getProficientSkillSlugs,
    readCharacterLevel,
    sortSkillModifiersByAbilityOrder,
} from "../lib/character/skillModifiers";

describe("dndAbilityModifier", () => {
    it("computes standard D&D ability modifiers", () => {
        expect(dndAbilityModifier(8)).toBe(-1);
        expect(dndAbilityModifier(10)).toBe(0);
        expect(dndAbilityModifier(14)).toBe(2);
        expect(dndAbilityModifier(20)).toBe(5);
    });
});

describe("dndProficiencyBonus", () => {
    it("follows the level-based progression", () => {
        expect(dndProficiencyBonus(1)).toBe(2);
        expect(dndProficiencyBonus(4)).toBe(2);
        expect(dndProficiencyBonus(5)).toBe(3);
        expect(dndProficiencyBonus(20)).toBe(6);
    });

    it("defaults invalid levels to level 1 bonus", () => {
        expect(dndProficiencyBonus(0)).toBe(2);
        expect(dndProficiencyBonus(Number.NaN)).toBe(2);
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
            "dnd",
            stats,
            [
                {
                    id: "class-stealth",
                    kind: "proficiency",
                    ref: "stealth",
                    source: { type: "class", id: "rogue" },
                },
            ],
            1
        );

        const stealth = modifiers.find((entry) => entry.slug === "stealth");
        expect(stealth).toEqual(
            expect.objectContaining({
                modifier: 4,
                proficient: true,
                proficiencyScale: 1,
            })
        );
    });

    it("doubles proficiency bonus when proficiencyScale is 2", () => {
        const modifiers = computeSkillModifiers(
            "dnd",
            stats,
            [
                {
                    id: "class-stealth",
                    kind: "proficiency",
                    ref: "stealth",
                    source: { type: "class", id: "rogue" },
                },
                {
                    id: "class-stealth-expertise",
                    kind: "proficiency",
                    ref: "stealth",
                    source: { type: "class", id: "rogue" },
                    proficiencyScale: 2,
                },
            ],
            1
        );

        const stealth = modifiers.find((entry) => entry.slug === "stealth");
        expect(stealth).toEqual(
            expect.objectContaining({
                modifier: 6,
                proficient: true,
                proficiencyScale: 2,
            })
        );
    });

    it("uses ability modifier only for non-proficient skills", () => {
        const modifiers = computeSkillModifiers("dnd", stats, [], 1);

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
            "dnd",
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
            1
        );

        const athletics = modifiers.find((entry) => entry.slug === "athletics");
        expect(athletics?.modifier).toBe(5);
    });
});

describe("sortSkillModifiersByAbilityOrder", () => {
    it("orders skills by governing ability then catalog order", () => {
        const sorted = sortSkillModifiersByAbilityOrder("dnd", [
            {
                slug: "arcana",
                name: "Arcana",
                ability: "intelligence",
                modifier: 0,
                proficient: false,
                proficiencyScale: 0,
            },
            {
                slug: "athletics",
                name: "Athletics",
                ability: "strength",
                modifier: 2,
                proficient: true,
                proficiencyScale: 1,
            },
            {
                slug: "stealth",
                name: "Stealth",
                ability: "dexterity",
                modifier: 1,
                proficient: false,
                proficiencyScale: 0,
            },
            {
                slug: "acrobatics",
                name: "Acrobatics",
                ability: "dexterity",
                modifier: 2,
                proficient: false,
                proficiencyScale: 0,
            },
        ]);

        expect(sorted.map((skill) => skill.slug)).toEqual([
            "athletics",
            "acrobatics",
            "stealth",
            "arcana",
        ]);
    });
});
