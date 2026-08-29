import type { CharacterGrant, Locale } from "@rpv/domain";
import { getClassSpellcastingMode } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { contentRepo } from "@/lib/content/contentRepository";
import type { CharacterChoices } from "./storedCharacter";
import { prunePreparedSpellsToQuota } from "./preparedSpellQuota";

export function readPreparedSpells(choices?: CharacterChoices): string[] {
    return choices?.preparedSpells ?? [];
}

type FilterCastableSpellGrantsInput = {
    grants: CharacterGrant[];
    characterClass?: string;
    preparedSpells?: string[];
    /** When set, only the first N prepared slugs count as prepared. */
    preparedQuota?: number;
    system?: SystemKey;
    locale?: Locale;
};

function syntheticPreparedGrant(
    slug: string,
    characterClass: string
): CharacterGrant {
    return {
        id: `prepared-${characterClass}-spell-${slug}`,
        kind: "spell",
        ref: slug,
        source: { type: "class", id: characterClass },
    };
}

/**
 * Returns spell grants that are currently castable given the class
 * spellcasting mode and prepared list.
 *
 * - `known` / absent mode: all spell grants
 * - `spellbook`: cantrips always; leveled only if prepared (from known grants)
 * - `prepared-list`: cantrips + fixed (choose 0) grants + prepared class-list slugs
 */
export function filterCastableSpellGrants(
    input: FilterCastableSpellGrantsInput
): CharacterGrant[] {
    const spellGrants = input.grants.filter((grant) => grant.kind === "spell");
    const mode = input.characterClass
        ? getClassSpellcastingMode(input.characterClass)
        : undefined;

    if (mode !== "spellbook" && mode !== "prepared-list") {
        return spellGrants;
    }

    const withinQuota =
        input.preparedQuota !== undefined
            ? (prunePreparedSpellsToQuota(
                  input.preparedSpells,
                  input.preparedQuota
              ) ?? [])
            : (input.preparedSpells ?? []);
    const prepared = new Set(withinQuota);
    const system = input.system ?? "dnd";
    const repo = contentRepo(system);

    if (mode === "spellbook") {
        return spellGrants.filter((grant) => {
            const levelInt = repo.getSpell(grant.ref, input.locale)?.levelInt;

            if (levelInt === 0) {
                return true;
            }

            return prepared.has(grant.ref);
        });
    }

    const result: CharacterGrant[] = [];
    const seen = new Set<string>();

    for (const grant of spellGrants) {
        result.push(grant);
        seen.add(grant.ref);
    }

    const classSlug = input.characterClass ?? "class";

    for (const slug of withinQuota) {
        if (seen.has(slug)) {
            continue;
        }

        const levelInt = repo.getSpell(slug, input.locale)?.levelInt;
        if (typeof levelInt !== "number" || levelInt <= 0) {
            continue;
        }

        result.push(syntheticPreparedGrant(slug, classSlug));
        seen.add(slug);
    }

    return result;
}
