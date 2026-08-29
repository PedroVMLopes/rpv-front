import type { Grant } from "../grant/grant.types";
import type { LevelFeature } from "../grant/levelFeature.types";

export interface SubclassEntry {
    slug: string;
    name: string;
    classSlug: string;
    description?: string;
    grants: Grant[];
    featuresByLevel?: LevelFeature[];
}

export interface SubclassGrantSourceBlock {
    grants: Grant[];
    featureLevel?: number;
}

export const dndSubclasses: SubclassEntry[] = [
    {
        slug: "fighter-champion",
        name: "Champion",
        classSlug: "fighter",
        description:
            "A fighter who hones body and mind to the perfection of arms.",
        grants: [],
        featuresByLevel: [
            {
                level: 3,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Improved Critical",
                        activation: { cost: "passive" },
                    },
                ],
            },
        ],
    },
    {
        slug: "wizard-evocation",
        name: "Evocation",
        classSlug: "wizard",
        description:
            "A wizard who focuses on magic that creates powerful elemental effects.",
        grants: [
            {
                grantType: "ability",
                choose: 0,
                description: "Sculpt Spells",
                activation: { cost: "passive" },
            },
        ],
    },
    {
        slug: "barbarian-berserker",
        name: "Berserker",
        classSlug: "barbarian",
        description:
            "A barbarian who channels rage into violent fury.",
        grants: [],
        featuresByLevel: [
            {
                level: 3,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Frenzy",
                        activation: { cost: "passive" },
                    },
                ],
            },
        ],
    },
    {
        slug: "monk-open-hand",
        name: "Open Hand",
        classSlug: "monk",
        description:
            "A monk who masters unarmed combat and manipulates ki to hinder foes.",
        grants: [],
        featuresByLevel: [
            {
                level: 3,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Open Hand Technique",
                        activation: { cost: "passive" },
                    },
                ],
            },
        ],
    },
    {
        slug: "cleric-life",
        name: "Life",
        classSlug: "cleric",
        description:
            "A cleric who channels divine energy to heal and protect.",
        grants: [
            {
                grantType: "spell",
                choose: 0,
                description: "Domain spells",
                options: [
                    { optionType: "spell", ref: "bless" },
                    { optionType: "spell", ref: "cure-wounds" },
                ],
            },
            {
                grantType: "ability",
                choose: 0,
                description: "Disciple of Life",
                activation: { cost: "passive" },
            },
        ],
    },
    {
        slug: "warlock-fiend",
        name: "The Fiend",
        classSlug: "warlock",
        description:
            "A warlock whose patron is a being of the Lower Planes.",
        grants: [
            {
                grantType: "ability",
                choose: 0,
                description: "Dark One's Blessing",
                activation: { cost: "passive" },
            },
        ],
    },
];

