import type { Locale } from "@rpv/domain";
import type { Grant } from "../grant/grant.types";
import type { LevelFeature } from "../grant/levelFeature.types";
import { resolveLevelFeatures } from "../grant/levelFeatures";
import { localizeCurationEntry } from "./curationLocale";

export interface ClassEntry {
    slug: string;
    name: string;
    description: string;
    /** Hit die sides (e.g. 6, 8, 10, 12). */
    hitDie: number;
    /** Minimum character level before subclass grants apply. */
    subclassLevel?: number;
    grants: Grant[];
    featuresByLevel?: LevelFeature[];
}

export interface ClassGrantSourceBlock {
    grants: Grant[];
    featureLevel?: number;
}

/**
 * Hand-curated class grants. Small representative set to prove the
 * class source pipeline; full SRD classes are future work.
 */
export const dndClasses: ClassEntry[] = [
    {
        slug: "fighter",
        name: "Fighter",
        description:
            "A master of martial combat, skilled with a variety of weapons and armor.",
        hitDie: 10,
        subclassLevel: 3,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "strength" },
                    { optionType: "proficiency", ref: "constitution" },
                ],
            },
            {
                grantType: "armor_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "light-armor" },
                    { optionType: "proficiency", ref: "medium-armor" },
                    { optionType: "proficiency", ref: "heavy-armor" },
                    { optionType: "proficiency", ref: "shields" },
                ],
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "simple-weapons" },
                    { optionType: "proficiency", ref: "martial-weapons" },
                ],
            },
            {
                grantType: "skill_proficiency",
                choose: 2,
                description: "Choose two skills.",
                options: [
                    { optionType: "skill", ref: "acrobatics" },
                    { optionType: "skill", ref: "animal-handling" },
                    { optionType: "skill", ref: "athletics" },
                    { optionType: "skill", ref: "history" },
                    { optionType: "skill", ref: "insight" },
                    { optionType: "skill", ref: "intimidation" },
                    { optionType: "skill", ref: "perception" },
                    { optionType: "skill", ref: "survival" },
                ],
            },
            {
                grantType: "inventory_item",
                choose: 0,
                ref: "longsword",
                amount: 1,
                description: "Standard equipment",
                exclusiveGroup: "starting-wealth",
                exclusiveBranch: "equipment",
            },
            {
                grantType: "inventory_item",
                choose: 1,
                description: "Starting sidearm (pilot fixture).",
                exclusiveGroup: "starting-wealth",
                exclusiveBranch: "equipment",
                options: [
                    { optionType: "item", ref: "pilot-test-dagger" },
                    { optionType: "item", ref: "pilot-test-pack-a" },
                ],
            },
            {
                grantType: "currency",
                choose: 0,
                ref: "gold",
                amount: 50,
                description: "Starting gold (pilot: 5d4×10 avg)",
                exclusiveGroup: "starting-wealth",
                exclusiveBranch: "gold",
            },
        ],
        featuresByLevel: [
            {
                level: 2,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Action Surge",
                    },
                ],
            },
            {
                level: 3,
                grants: [
                    {
                        grantType: "skill_proficiency",
                        choose: 1,
                        description: "Additional skill",
                        options: [
                            { optionType: "skill", ref: "acrobatics" },
                            { optionType: "skill", ref: "animal-handling" },
                            { optionType: "skill", ref: "athletics" },
                            { optionType: "skill", ref: "history" },
                            { optionType: "skill", ref: "insight" },
                            { optionType: "skill", ref: "intimidation" },
                            { optionType: "skill", ref: "perception" },
                            { optionType: "skill", ref: "survival" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        slug: "wizard",
        name: "Wizard",
        description:
            "A scholarly magic-user capable of manipulating the structures of reality.",
        hitDie: 6,
        subclassLevel: 3,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "intelligence" },
                    { optionType: "proficiency", ref: "wisdom" },
                ],
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "daggers" },
                    { optionType: "proficiency", ref: "darts" },
                    { optionType: "proficiency", ref: "slings" },
                    { optionType: "proficiency", ref: "quarterstaffs" },
                    { optionType: "proficiency", ref: "light-crossbows" },
                ],
            },
            {
                grantType: "skill_proficiency",
                choose: 2,
                description: "Choose two skills.",
                options: [
                    { optionType: "skill", ref: "arcana" },
                    { optionType: "skill", ref: "history" },
                    { optionType: "skill", ref: "insight" },
                    { optionType: "skill", ref: "investigation" },
                    { optionType: "skill", ref: "medicine" },
                    { optionType: "skill", ref: "religion" },
                ],
            },
        ],
        // Spell slot deltas per level (summed by ref at resolution time).
        featuresByLevel: [
            {
                level: 1,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-1",
                        amount: 2,
                    },
                    {
                        grantType: "spell",
                        choose: 3,
                        description: "Choose cantrips",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelInt: 0,
                        },
                    },
                    {
                        grantType: "spell",
                        choose: 2,
                        description: "Choose spells",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelInt: 1,
                        },
                    },
                ],
            },
            {
                level: 2,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-1",
                        amount: 1,
                    },
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-2",
                        amount: 1,
                    },
                    {
                        grantType: "spell",
                        choose: 1,
                        description: "Learn a spell",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelInt: 1,
                        },
                    },
                ],
            },
            {
                level: 3,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-1",
                        amount: 1,
                    },
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-2",
                        amount: 1,
                    },
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-3",
                        amount: 1,
                    },
                    {
                        grantType: "spell",
                        choose: 1,
                        description: "Learn a spell",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelInt: 1,
                        },
                    },
                ],
            },
            {
                level: 4,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-2",
                        amount: 1,
                    },
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-3",
                        amount: 1,
                    },
                    {
                        grantType: "spell",
                        choose: 1,
                        description: "Learn a spell",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelInt: 1,
                        },
                    },
                ],
            },
            {
                level: 5,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-4",
                        amount: 1,
                    },
                    {
                        grantType: "spell",
                        choose: 1,
                        description: "Learn a spell",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelInt: 1,
                        },
                    },
                ],
            },
        ],
    },
    {
        slug: "barbarian",
        name: "Barbarian",
        description:
            "A fierce warrior who can enter a battle rage and shrug off damage.",
        hitDie: 12,
        subclassLevel: 3,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "strength" },
                    { optionType: "proficiency", ref: "constitution" },
                ],
            },
            {
                grantType: "armor_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "light-armor" },
                    { optionType: "proficiency", ref: "medium-armor" },
                    { optionType: "proficiency", ref: "shields" },
                ],
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "simple-weapons" },
                    { optionType: "proficiency", ref: "martial-weapons" },
                ],
            },
            {
                grantType: "skill_proficiency",
                choose: 2,
                description: "Choose two skills.",
                options: [
                    { optionType: "skill", ref: "animal-handling" },
                    { optionType: "skill", ref: "athletics" },
                    { optionType: "skill", ref: "intimidation" },
                    { optionType: "skill", ref: "nature" },
                    { optionType: "skill", ref: "perception" },
                    { optionType: "skill", ref: "survival" },
                ],
            },
        ],
        featuresByLevel: [
            {
                level: 1,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "rage-uses",
                        amount: 2,
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Rage",
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Unarmored Defense",
                    },
                ],
            },
            {
                level: 2,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Reckless Attack",
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Danger Sense",
                    },
                ],
            },
            {
                level: 3,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "rage-uses",
                        amount: 1,
                    },
                ],
            },
            {
                level: 5,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Extra Attack",
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Fast Movement",
                    },
                ],
            },
        ],
    },
    {
        slug: "monk",
        name: "Monk",
        description:
            "A master of martial arts, harnessing the power of the body in pursuit of perfection.",
        hitDie: 8,
        subclassLevel: 3,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "strength" },
                    { optionType: "proficiency", ref: "dexterity" },
                ],
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "simple-weapons" },
                    { optionType: "proficiency", ref: "shortswords" },
                ],
            },
            {
                grantType: "tool_proficiency",
                choose: 1,
                description: "Choose a tool.",
                options: [
                    { optionType: "proficiency", ref: "alchemists-supplies" },
                    { optionType: "proficiency", ref: "brewers-supplies" },
                    { optionType: "proficiency", ref: "calligraphers-supplies" },
                    { optionType: "proficiency", ref: "lute" },
                    { optionType: "proficiency", ref: "flute" },
                    { optionType: "proficiency", ref: "drum" },
                ],
            },
            {
                grantType: "skill_proficiency",
                choose: 2,
                description: "Choose two skills.",
                options: [
                    { optionType: "skill", ref: "acrobatics" },
                    { optionType: "skill", ref: "athletics" },
                    { optionType: "skill", ref: "history" },
                    { optionType: "skill", ref: "insight" },
                    { optionType: "skill", ref: "religion" },
                    { optionType: "skill", ref: "stealth" },
                ],
            },
        ],
        featuresByLevel: [
            {
                level: 1,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Unarmored Defense",
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Martial Arts",
                    },
                ],
            },
            {
                level: 2,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "ki-points",
                        amount: 2,
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Ki",
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Unarmored Movement",
                    },
                ],
            },
            {
                level: 3,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Deflect Missiles",
                    },
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "ki-points",
                        amount: 1,
                    },
                ],
            },
            {
                level: 4,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "ki-points",
                        amount: 1,
                    },
                ],
            },
            {
                level: 5,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "ki-points",
                        amount: 1,
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Extra Attack",
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Stunning Strike",
                    },
                ],
            },
        ],
    },
    {
        slug: "rogue",
        name: "Rogue",
        description:
            "A scoundrel who uses stealth and trickery to overcome obstacles and enemies.",
        hitDie: 8,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "dexterity" },
                    { optionType: "proficiency", ref: "intelligence" },
                ],
            },
            {
                grantType: "armor_proficiency",
                choose: 0,
                options: [{ optionType: "proficiency", ref: "light-armor" }],
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "simple-weapons" },
                    { optionType: "proficiency", ref: "hand-crossbows" },
                    { optionType: "proficiency", ref: "longswords" },
                    { optionType: "proficiency", ref: "rapiers" },
                    { optionType: "proficiency", ref: "shortswords" },
                ],
            },
            {
                grantType: "skill_proficiency",
                choose: 4,
                description: "Choose four skills.",
                options: [
                    { optionType: "skill", ref: "acrobatics" },
                    { optionType: "skill", ref: "athletics" },
                    { optionType: "skill", ref: "deception" },
                    { optionType: "skill", ref: "insight" },
                    { optionType: "skill", ref: "intimidation" },
                    { optionType: "skill", ref: "investigation" },
                    { optionType: "skill", ref: "perception" },
                    { optionType: "skill", ref: "performance" },
                    { optionType: "skill", ref: "persuasion" },
                    { optionType: "skill", ref: "sleight-of-hand" },
                    { optionType: "skill", ref: "stealth" },
                ],
            },
        ],
    },
    {
        slug: "cleric",
        name: "Cleric",
        description:
            "A priestly champion who wields divine magic in service of a higher power.",
        hitDie: 8,
        grants: [
            {
                grantType: "saving_throw_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "wisdom" },
                    { optionType: "proficiency", ref: "charisma" },
                ],
            },
            {
                grantType: "armor_proficiency",
                choose: 0,
                options: [
                    { optionType: "proficiency", ref: "light-armor" },
                    { optionType: "proficiency", ref: "medium-armor" },
                    { optionType: "proficiency", ref: "shields" },
                ],
            },
            {
                grantType: "weapon_proficiency",
                choose: 0,
                options: [{ optionType: "proficiency", ref: "simple-weapons" }],
            },
            {
                grantType: "skill_proficiency",
                choose: 2,
                description: "Choose two skills.",
                options: [
                    { optionType: "skill", ref: "history" },
                    { optionType: "skill", ref: "insight" },
                    { optionType: "skill", ref: "medicine" },
                    { optionType: "skill", ref: "persuasion" },
                    { optionType: "skill", ref: "religion" },
                ],
            },
        ],
    },
];

function localizeClass(entry: ClassEntry, locale?: Locale): ClassEntry {
    return localizeCurationEntry(entry, "classes", locale);
}

export function getClass(slug: string, locale?: Locale): ClassEntry | undefined {
    const entry = dndClasses.find((item) => item.slug === slug);
    if (!entry) {
        return undefined;
    }
    return localizeClass(entry, locale);
}

export function listClasses(locale?: Locale): ClassEntry[] {
    return dndClasses.map((entry) => localizeClass(entry, locale));
}

export function getClassSubclassLevel(classSlug: string): number | undefined {
    return getClass(classSlug)?.subclassLevel;
}

export function getClassGrantSourcesForLevel(
    slug: string,
    characterLevel: number
): ClassGrantSourceBlock[] {
    const entry = getClass(slug);
    if (!entry) {
        return [];
    }

    const blocks: ClassGrantSourceBlock[] = [{ grants: entry.grants }];

    for (const feature of resolveLevelFeatures(
        entry.featuresByLevel ?? [],
        characterLevel
    )) {
        blocks.push({
            grants: feature.grants,
            featureLevel: feature.level,
        });
    }

    return blocks;
}

export function getClassGrants(slug: string, characterLevel = 1): Grant[] {
    return getClassGrantSourcesForLevel(slug, characterLevel).flatMap(
        (block) => block.grants
    );
}

export function getClassHitDie(slug: string): number | undefined {
    return getClass(slug)?.hitDie;
}
