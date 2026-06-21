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
];

function localizeSubclass(entry: SubclassEntry, locale?: Locale): SubclassEntry {
    return localizeCurationEntry(entry, "subclasses", locale);
}

export function getSubclass(
    slug: string,
    locale?: Locale
): SubclassEntry | undefined {
    const entry = dndSubclasses.find((subclass) => subclass.slug === slug);
    if (!entry) {
        return undefined;
    }
    return localizeSubclass(entry, locale);
}

export function listSubclassesForClass(
    classSlug: string,
    locale?: Locale
): SubclassEntry[] {
    return dndSubclasses
        .filter((entry) => entry.classSlug === classSlug)
        .map((entry) => localizeSubclass(entry, locale));
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
