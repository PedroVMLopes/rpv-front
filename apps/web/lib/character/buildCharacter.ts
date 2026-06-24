import type { CharacterInventory, CharacterType, Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import {
    buildSelectionsFromForm,
    formDataToStoredCharacter,
} from "./characterAdapter";
import { flattenStoredToForm } from "./presetStats";
import { deriveCharacterGrants } from "./characterGrants";
import { deriveModifiersForCharacter } from "./deriveModifiers";
import { applyDerivedCombatStats } from "./applyDerivedCombatStats";
import { sanitizeSelections } from "./grantPickSanitize";
import { syncResourceHpToResolvedMax } from "./hpSync";
import { readLevelFromForm } from "./level";
import type { StoredCharacter } from "./storedCharacter";
import type { CharacterSelections } from "./storedCharacter";

export type BuildCharacterInput = {
    id: string;
    type: CharacterType;
    system: SystemKey;
    locale: Locale;
    formData: Record<string, unknown>;
    /** When updating: provides id-stable merge + modifier preservation */
    existing?: StoredCharacter;
};

function withSanitizedSelectionFields(
    formData: Record<string, unknown>,
    selections: CharacterSelections
): Record<string, unknown> {
    return {
        ...formData,
        race: selections.race ?? "",
        subrace: selections.subrace ?? "",
        characterClass: selections.characterClass ?? "",
        subclass: selections.subclass ?? "",
        background: selections.background ?? "",
        choices: selections.choices,
    };
}

export function buildStoredCharacter(input: BuildCharacterInput): StoredCharacter {
    const { id, type, system, locale, formData, existing } = input;
    const characterLevel = readLevelFromForm(formData);

    let selections = sanitizeSelections(
        buildSelectionsFromForm(formData, existing?.selections),
        locale,
        system,
        characterLevel
    );
    const modifiers = deriveModifiersForCharacter(selections, locale, {
        preserve: existing?.modifiers,
    });
    const grants = deriveCharacterGrants(selections, locale, characterLevel);

    let processedForm = applyDerivedCombatStats(
        withSanitizedSelectionFields(formData, selections),
        system,
        locale
    );

    const interim = formDataToStoredCharacter(
        processedForm,
        id,
        type,
        system,
        modifiers,
        existing?.selections,
        grants,
        selections
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
        existing?.selections,
        grants,
        selections
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

export function rebuildCharacterWithInventory(
    existing: StoredCharacter,
    nextInventory: CharacterInventory,
    locale: Locale
): StoredCharacter {
    const formData = flattenStoredToForm(existing, existing.system);

    return rebuildStoredCharacter(
        existing,
        {
            ...formData,
            inventory: nextInventory,
        },
        locale
    );
}
