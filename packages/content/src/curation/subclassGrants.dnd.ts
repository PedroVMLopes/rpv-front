import type { Locale } from "@rpv/domain";
import type { Grant } from "../grant/grant.types";
import type { LevelFeature } from "../grant/levelFeature.types";
import { resolveLevelFeatures } from "../grant/levelFeatures";
import { localizeCurationEntry } from "./curationLocale";

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
                    },
                ],
            },
        ],
    },
];

function localizeSubclass(entry: SubclassEntry, locale?: Locale): SubclassEntry {
    return localizeCurationEntry(entry, "subclasses", locale);
}

function resolveSubclass(slug: string, locale?: Locale): SubclassEntry | undefined {
    const entry = dndSubclasses.find((subclass) => subclass.slug === slug);
    if (!entry) {
        return undefined;
    }
    return localizeSubclass(entry, locale);
}

export function getSubclassGrantSourcesForLevel(
    slug: string,
    characterLevel: number
): SubclassGrantSourceBlock[] {
    const entry = dndSubclasses.find((subclass) => subclass.slug === slug);
    if (!entry) {
        return [];
    }

    const blocks: SubclassGrantSourceBlock[] = [{ grants: entry.grants }];

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

export function getSubclassGrants(slug: string, characterLevel = 1): Grant[] {
    return getSubclassGrantSourcesForLevel(slug, characterLevel).flatMap(
        (block) => block.grants
    );
}
