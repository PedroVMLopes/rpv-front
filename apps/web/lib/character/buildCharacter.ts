import type { CharacterType, Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import {
    buildSelectionsFromForm,
    formDataToStoredCharacter,
} from "./characterAdapter";
import { deriveCharacterGrants } from "./characterGrants";
import { deriveModifiersForCharacter } from "./deriveModifiers";
import { applyDerivedCombatStats } from "./applyDerivedCombatStats";
import { sanitizeGrantPicks } from "./grantPickSanitize";
import { syncResourceHpToResolvedMax } from "./hpSync";
import { readLevelFromForm } from "./level";
import type { StoredCharacter } from "./storedCharacter";

export type BuildCharacterInput = {
    id: string;
    type: CharacterType;
    system: SystemKey;
    locale: Locale;
    formData: Record<string, unknown>;
    /** When updating: provides id-stable merge + modifier preservation */
    existing?: StoredCharacter;
};

export function buildStoredCharacter(input: BuildCharacterInput): StoredCharacter {
    const { id, type, system, locale, formData, existing } = input;
    const characterLevel = readLevelFromForm(formData);

    let selections = sanitizeGrantPicks(
        buildSelectionsFromForm(formData, existing?.selections),
        locale,
        characterLevel
    );
    const modifiers = deriveModifiersForCharacter(selections, locale, {
        preserve: existing?.modifiers,
    });
    const grants = deriveCharacterGrants(selections, locale, characterLevel);

    let processedForm = applyDerivedCombatStats(
        { ...formData, choices: selections.choices },
        system,
        locale
    );

    const interim = formDataToStoredCharacter(
        processedForm,
        id,
        type,
        system,
        modifiers,
        selections,
        grants
    );

    processedForm = syncResourceHpToResolvedMax(
        processedForm,
        interim.baseStats,
        modifiers
    );

    return formDataToStoredCharacter(
        processedForm,
        id,
        type,
        system,
        modifiers,
        selections,
        grants
    );
}

export function buildNewStoredCharacter(
    formData: Record<string, unknown>,
    type: CharacterType,
    system: SystemKey,
    locale: Locale
): StoredCharacter {
    return buildStoredCharacter({
        id: crypto.randomUUID(),
        type,
        system,
        locale,
        formData,
    });
}

export function rebuildStoredCharacter(
    existing: StoredCharacter,
    formData: Record<string, unknown>,
    locale: Locale
): StoredCharacter {
    return buildStoredCharacter({
        id: existing.id,
        type: existing.type,
        system: existing.system,
        locale,
        formData,
        existing,
    });
}
