import { getClassSpellcastingMode } from "@rpv/content";
import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "@/lib/character/characterAdapter";
import { listKnownLeveledSpellRefs } from "@/lib/character/knownLeveledSpells";
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

    return (
        listKnownLeveledSpellRefs({
            selections,
            locale: input.contentLocale,
            system: input.system,
            characterLevel,
        }).length > 0
    );
}
