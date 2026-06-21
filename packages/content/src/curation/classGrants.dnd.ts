import type { Grant } from "../grant/grant.types";
import type { LevelFeature } from "../grant/levelFeature.types";
import { resolveLevelFeatures } from "../grant/levelFeatures";

export interface ClassEntry {
    slug: string;
    name: string;
    description: string;
    /** Hit die sides (e.g. 6, 8, 10, 12). */
    hitDie: number;
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

export function getClass(slug: string): ClassEntry | undefined {
    return dndClasses.find((entry) => entry.slug === slug);
}

export function listClasses(): ClassEntry[] {
    return dndClasses;
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
