import type { Grant } from "../grant/grant.types";

export interface ClassEntry {
    slug: string;
    name: string;
    description: string;
    grants: Grant[];
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
        grants: [
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
    },
    {
        slug: "wizard",
        name: "Wizard",
        description:
            "A scholarly magic-user capable of manipulating the structures of reality.",
        grants: [
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
        grants: [
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
        grants: [
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

export function getClassGrants(slug: string): Grant[] {
    return getClass(slug)?.grants ?? [];
}
