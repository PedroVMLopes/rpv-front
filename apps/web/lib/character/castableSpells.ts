import type { CharacterGrant, Locale } from "@rpv/domain";
import { getClassSpellcastingMode } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { contentRepo } from "@/lib/content/contentRepository";
import type { CharacterChoices } from "./storedCharacter";

export function readPreparedSpells(choices?: CharacterChoices): string[] {
    return choices?.preparedSpells ?? [];
}

type FilterCastableSpellGrantsInput = {
    grants: CharacterGrant[];
    characterClass?: string;
    preparedSpells?: string[];
    system?: SystemKey;
    locale?: Locale;
};

/**
 * Returns spell grants that are currently castable given the class
 * spellcasting mode and prepared list.
 *
 * - `known` / absent mode: all spell grants
 * - `spellbook` / `prepared-list`: cantrips always; leveled only if prepared
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

    const prepared = new Set(input.preparedSpells ?? []);
    const system = input.system ?? "dnd";
    const repo = contentRepo(system);

    return spellGrants.filter((grant) => {
        const levelInt = repo.getSpell(grant.ref, input.locale)?.levelInt;

        if (levelInt === 0) {
            return true;
        }

        return prepared.has(grant.ref);
    });
}
