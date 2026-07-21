import { getClassSpellcastingMode } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { deriveCharacterGrants } from "@/lib/character/characterGrants";
import { contentRepo } from "@/lib/content/contentRepository";
import { readLevelFromForm } from "@/lib/character/level";

export type ShouldIncludePrepareSpellsStepInput = {
    formValues: Record<string, unknown>;
    system: SystemKey;
    contentLocale: Locale;
    /** Defaults to level read from formValues. */
    characterLevel?: number;
};

/**
 * True when the class uses prepared casting and the character already has
 * at least one leveled (non-cantrip) spell grant in their book / known list.
 */
export function shouldIncludePrepareSpellsStep(
    input: ShouldIncludePrepareSpellsStepInput
): boolean {
    const selections = buildSelectionsFromForm(input.formValues);
    const characterClass = selections.characterClass;

    if (!characterClass) {
        return false;
    }

    const mode = getClassSpellcastingMode(characterClass);

    if (mode !== "spellbook" && mode !== "prepared-list") {
        return false;
    }

    const characterLevel =
        input.characterLevel ?? readLevelFromForm(input.formValues);
    const grants = deriveCharacterGrants(
        selections,
        input.contentLocale,
        characterLevel,
        input.system
    );
    const repo = contentRepo(input.system);

    return grants.some((grant) => {
        if (grant.kind !== "spell") {
            return false;
        }

        const levelInt = repo.getSpell(grant.ref, input.contentLocale)?.levelInt;

        return typeof levelInt === "number" && levelInt > 0;
    });
}
