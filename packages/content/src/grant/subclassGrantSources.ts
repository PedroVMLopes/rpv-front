import type { SubclassEntry, SubclassGrantSourceBlock } from "../curation/subclassGrants.dnd";
import { getContentRepository } from "../repository/getContentRepository";
import type { Grant } from "./grant.types";
import { resolveLevelFeatures } from "./levelFeatures";

export function subclassGrantSourcesFromEntry(
    entry: SubclassEntry,
    characterLevel: number
): SubclassGrantSourceBlock[] {
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

export function getSubclassGrantSourcesForLevel(
    slug: string,
    characterLevel: number
): SubclassGrantSourceBlock[] {
    const entry = getContentRepository("dnd").getSubclass(slug);
    if (!entry) {
        return [];
    }

    return subclassGrantSourcesFromEntry(entry, characterLevel);
}

export function getSubclassGrants(slug: string, characterLevel = 1): Grant[] {
    return getSubclassGrantSourcesForLevel(slug, characterLevel).flatMap(
        (block) => block.grants
    );
}
