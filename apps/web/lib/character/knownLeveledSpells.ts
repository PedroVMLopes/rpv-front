import type { Locale } from "@rpv/domain";
import {
    getClassGrants,
    getClassSpellcastingMode,
    getSubclassGrants,
    listClassListSpells,
    listFixedSpellRefsFromGrants,
    maxSpellSlotLevelFromGrants,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { deriveCharacterGrants } from "@/lib/character/characterGrants";
import { contentRepo } from "@/lib/content/contentRepository";
import type { CharacterSelections } from "@/lib/character/storedCharacter";

export type ListKnownLeveledSpellRefsInput = {
    selections: CharacterSelections;
    locale: Locale;
    system: SystemKey;
    characterLevel?: number;
};

function uniqueRefs(refs: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const ref of refs) {
        if (seen.has(ref)) {
            continue;
        }
        seen.add(ref);
        result.push(ref);
    }

    return result;
}

function isLeveledSpell(
    slug: string,
    locale: Locale,
    system: SystemKey
): boolean {
    const levelInt = contentRepo(system).getSpell(slug, locale)?.levelInt;
    return typeof levelInt === "number" && levelInt > 0;
}

/**
 * Unique leveled (non-cantrip) spell refs from the character's known grants.
 */
export function listKnownLeveledSpellRefs(
    input: ListKnownLeveledSpellRefsInput
): string[] {
    const characterLevel = input.characterLevel ?? 1;
    const grants = deriveCharacterGrants(
        input.selections,
        input.locale,
        characterLevel,
        input.system
    );
    const repo = contentRepo(input.system);
    const seen = new Set<string>();
    const refs: string[] = [];

    for (const grant of grants) {
        if (grant.kind !== "spell" || seen.has(grant.ref)) {
            continue;
        }

        const levelInt = repo.getSpell(grant.ref, input.locale)?.levelInt;

        if (typeof levelInt !== "number" || levelInt <= 0) {
            continue;
        }

        seen.add(grant.ref);
        refs.push(grant.ref);
    }

    return refs;
}

function listPreparedListPool(input: ListKnownLeveledSpellRefsInput): string[] {
    const classSlug = input.selections.characterClass;
    if (!classSlug) {
        return [];
    }

    const characterLevel = input.characterLevel ?? 1;
    const classGrants = getClassGrants(classSlug, characterLevel);
    const maxSlot = maxSpellSlotLevelFromGrants(classGrants);
    const classList = listClassListSpells(
        classSlug,
        maxSlot,
        input.locale
    ).map((spell) => spell.slug);

    const subclassGrants = input.selections.subclass
        ? getSubclassGrants(input.selections.subclass, characterLevel)
        : [];
    const fixed = listFixedSpellRefsFromGrants([
        ...classGrants,
        ...subclassGrants,
    ]).filter((ref) => isLeveledSpell(ref, input.locale, input.system));

    return uniqueRefs([...classList, ...fixed]);
}

/**
 * Pool the prepare step offers: known book for spellbook, class list +
 * fixed spells for prepared-list.
 */
export function listPrepareSpellPool(
    input: ListKnownLeveledSpellRefsInput
): string[] {
    const classSlug = input.selections.characterClass;
    const mode = classSlug
        ? getClassSpellcastingMode(classSlug)
        : undefined;

    if (mode === "prepared-list") {
        return listPreparedListPool(input);
    }

    return listKnownLeveledSpellRefs(input);
}

/**
 * Keeps only prepared slugs that are still in the known leveled book.
 */
export function prunePreparedSpellsToBook(
    preparedSpells: string[] | undefined,
    knownLeveledRefs: readonly string[]
): string[] | undefined {
    if (preparedSpells === undefined) {
        return undefined;
    }

    const known = new Set(knownLeveledRefs);
    const pruned = preparedSpells.filter((slug) => known.has(slug));

    return pruned;
}
