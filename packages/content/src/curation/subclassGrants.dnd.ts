import type { StatKey } from "@rpv/domain";
import type { Grant } from "../grant/grant.types";
import type { LevelFeature } from "../grant/levelFeature.types";
import type {
    PreparedQuotaKind,
    SpellcastingMode,
} from "./classGrants.dnd";

export interface SubclassEntry {
    slug: string;
    name: string;
    classSlug: string;
    description?: string;
    /**
     * When set, overrides/supplies spellcasting ability for subclass casters
     * (e.g. Arcane Trickster) that the base class does not have.
     */
    spellcastingAbility?: StatKey;
    spellcastingMode?: SpellcastingMode;
    preparedQuota?: PreparedQuotaKind;
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
        slug: "wizard-illusion",
        name: "Illusion",
        classSlug: "wizard",
        description:
            "A wizard who specializes in magic that dazzles the senses and tricks the mind.",
        grants: [
            {
                grantType: "ability",
                choose: 0,
                description: "Improved Minor Illusion",
                activation: { cost: "passive" },
            },
        ],
        featuresByLevel: [
            {
                level: 2,
                grants: [
                    {
                        grantType: "spell",
                        choose: 0,
                        description: "Minor Illusion",
                        options: [{ optionType: "spell", ref: "minor-illusion" }],
                    },
                ],
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
        slug: "cleric-trickery",
        name: "Trickery",
        classSlug: "cleric",
        description:
            "A cleric who thrives on deception, illusion, and mischief.",
        grants: [
            {
                grantType: "spell",
                choose: 0,
                description: "Domain spells",
                options: [
                    { optionType: "spell", ref: "charm-person" },
                    { optionType: "spell", ref: "disguise-self" },
                ],
            },
            {
                grantType: "ability",
                choose: 0,
                description: "Blessing of the Trickster",
                activation: { cost: "action" },
            },
        ],
        featuresByLevel: [
            {
                level: 2,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Invoke Duplicity",
                        activation: {
                            cost: "action",
                            resourceRef: "channel-divinity",
                        },
                    },
                ],
            },
            {
                level: 3,
                grants: [
                    {
                        grantType: "spell",
                        choose: 0,
                        description: "Domain spells",
                        options: [
                            { optionType: "spell", ref: "mirror-image" },
                            { optionType: "spell", ref: "pass-without-trace" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        slug: "rogue-arcane-trickster",
        name: "Arcane Trickster",
        classSlug: "rogue",
        description:
            "A rogue who supplements cunning with wizard spells of enchantment and illusion.",
        spellcastingAbility: "intelligence",
        spellcastingMode: "known",
        grants: [],
        featuresByLevel: [
            {
                level: 3,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-1",
                        amount: 2,
                    },
                    {
                        grantType: "spell",
                        choose: 0,
                        description: "Mage Hand",
                        options: [{ optionType: "spell", ref: "mage-hand" }],
                    },
                    {
                        grantType: "spell",
                        choose: 2,
                        description: "Choose wizard cantrips",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelInt: 0,
                        },
                    },
                    {
                        grantType: "spell",
                        choose: 2,
                        description:
                            "Choose enchantment or illusion spells (1st level)",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelIntMax: 1,
                            schools: ["Enchantment", "Illusion"],
                        },
                    },
                    {
                        grantType: "spell",
                        choose: 1,
                        description: "Choose any wizard spell (1st level)",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelIntMax: 1,
                        },
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Mage Hand Legerdemain",
                        activation: { cost: "passive" },
                    },
                ],
            },
            {
                level: 4,
                grants: [
                    {
                        grantType: "resource",
                        choose: 0,
                        ref: "spell-slots-1",
                        amount: 1,
                    },
                    {
                        grantType: "spell",
                        choose: 1,
                        description:
                            "Learn an enchantment or illusion spell",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelIntMax: 1,
                            schools: ["Enchantment", "Illusion"],
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
                        ref: "spell-slots-2",
                        amount: 2,
                    },
                    {
                        grantType: "spell",
                        choose: 1,
                        description:
                            "Learn an enchantment or illusion spell",
                        selectionFilter: {
                            spellLists: ["wizard"],
                            levelIntMax: 2,
                            schools: ["Enchantment", "Illusion"],
                        },
                    },
                ],
            },
        ],
    },
    {
        slug: "paladin-oath-of-vengeance",
        name: "Oath of Vengeance",
        classSlug: "paladin",
        description:
            "A paladin sworn to punish those who have committed grievous sins.",
        grants: [],
        featuresByLevel: [
            {
                level: 3,
                grants: [
                    {
                        grantType: "spell",
                        choose: 0,
                        description: "Oath spells",
                        options: [
                            { optionType: "spell", ref: "bane" },
                            { optionType: "spell", ref: "hunters-mark" },
                        ],
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Abjure Enemy",
                        activation: {
                            cost: "action",
                            resourceRef: "channel-divinity",
                        },
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Vow of Enmity",
                        activation: {
                            cost: "bonus",
                            resourceRef: "channel-divinity",
                        },
                    },
                ],
            },
            {
                level: 5,
                grants: [
                    {
                        grantType: "spell",
                        choose: 0,
                        description: "Oath spells",
                        options: [
                            { optionType: "spell", ref: "hold-person" },
                            { optionType: "spell", ref: "misty-step" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        slug: "druid-circle-of-the-moon",
        name: "Circle of the Moon",
        classSlug: "druid",
        description:
            "A druid who draws on the moon to become a fierce combat shapechanger.",
        grants: [],
        featuresByLevel: [
            {
                level: 2,
                grants: [
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Combat Wild Shape",
                        activation: { cost: "bonus" },
                    },
                    {
                        grantType: "ability",
                        choose: 0,
                        description: "Circle Forms",
                        activation: { cost: "passive" },
                    },
                ],
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

