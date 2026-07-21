import type { Locale } from "@rpv/domain";
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
