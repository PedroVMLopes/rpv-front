import { resolveSpellcastingProfile } from "@rpv/content";
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
 * True when the class uses prepared casting and the prepare pool is available.
 * `prepared-list` needs only the mode and a spellcasting ability (no book).
 * `spellbook` still requires at least one leveled known spell.
 */
export function shouldIncludePrepareSpellsStep(
    input: ShouldIncludePrepareSpellsStepInput
): boolean {
    const selections = buildSelectionsFromForm(input.formValues);
    const characterClass = selections.characterClass;

    if (!characterClass) {
        return false;
    }

    const profile = resolveSpellcastingProfile(
        characterClass,
        selections.subclass
    );

    if (profile.mode !== "spellbook" && profile.mode !== "prepared-list") {
        return false;
    }

    if (profile.mode === "prepared-list") {
        return Boolean(profile.ability);
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
