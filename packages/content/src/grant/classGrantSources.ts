import type {
    ClassEntry,
    ClassGrantSourceBlock,
    PreparedQuotaKind,
    SpellcastingMode,
} from "../curation/classGrants.dnd";
import { getContentRepository } from "../repository/getContentRepository";
import type { Grant } from "./grant.types";
import { resolveLevelFeatures } from "./levelFeatures";

export function classGrantSourcesFromEntry(
    entry: ClassEntry,
    characterLevel: number
): ClassGrantSourceBlock[] {
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

export function getClassSubclassLevel(classSlug: string): number | undefined {
    return getContentRepository("dnd").getClass(classSlug)?.subclassLevel;
}

export function getClassGrantSourcesForLevel(
    slug: string,
    characterLevel: number
): ClassGrantSourceBlock[] {
    const entry = getContentRepository("dnd").getClass(slug);
    if (!entry) {
        return [];
    }

    return classGrantSourcesFromEntry(entry, characterLevel);
}

export function getClassGrants(slug: string, characterLevel = 1): Grant[] {
    return getClassGrantSourcesForLevel(slug, characterLevel).flatMap(
        (block) => block.grants
    );
}

export function getClassHitDie(slug: string): number | undefined {
    return getContentRepository("dnd").getClass(slug)?.hitDie;
}

export function getClassSpellcastingMode(
    slug: string
): SpellcastingMode | undefined {
    return getContentRepository("dnd").getClass(slug)?.spellcastingMode;
}

export function getClassPreparedQuotaKind(
    slug: string
): PreparedQuotaKind | undefined {
    const entry = getContentRepository("dnd").getClass(slug);
    if (!entry) {
        return undefined;
    }

    if (entry.preparedQuota) {
        return entry.preparedQuota;
    }

    if (entry.spellcastingAbility) {
        return "level-plus-mod";
    }

    return undefined;
}
