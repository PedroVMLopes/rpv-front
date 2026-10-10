import type { StatKey } from "@rpv/domain";
import type {
    ClassEntry,
    ClassGrantSourceBlock,
    PreparedQuotaKind,
    SpellcastingMode,
} from "../curation/classGrants.dnd";
import { getContentRepository } from "../repository/getContentRepository";
import type { Grant } from "./grant.types";
import { resolveLevelFeatures } from "./levelFeatures";

export type SpellcastingProfile = {
    ability?: StatKey;
    mode?: SpellcastingMode;
    preparedQuota?: PreparedQuotaKind;
};

/**
 * Resolves spellcasting from class, with optional subclass overrides
 * (e.g. Arcane Trickster INT / known on a non-caster Rogue).
 */
export function resolveSpellcastingProfile(
    classSlug?: string,
    subclassSlug?: string
): SpellcastingProfile {
    const repo = getContentRepository("dnd");
    const classEntry = classSlug ? repo.getClass(classSlug) : undefined;
    const subclassEntry = subclassSlug
        ? repo.getSubclass(subclassSlug)
        : undefined;

    const ability =
        subclassEntry?.spellcastingAbility ?? classEntry?.spellcastingAbility;
    const mode =
        subclassEntry?.spellcastingMode ?? classEntry?.spellcastingMode;
    const preparedQuota =
        subclassEntry?.preparedQuota ??
        classEntry?.preparedQuota ??
        (ability ? ("level-plus-mod" as const) : undefined);

    return {
        ...(ability ? { ability } : {}),
        ...(mode ? { mode } : {}),
        ...(preparedQuota ? { preparedQuota } : {}),
    };
}

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
    slug: string,
    subclassSlug?: string
): SpellcastingMode | undefined {
    return resolveSpellcastingProfile(slug, subclassSlug).mode;
}

export function getClassPreparedQuotaKind(
    slug: string,
    subclassSlug?: string
): PreparedQuotaKind | undefined {
    return resolveSpellcastingProfile(slug, subclassSlug).preparedQuota;
}
