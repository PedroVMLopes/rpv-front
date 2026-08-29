import type { CharacterInventory, CharacterType, Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import {
    buildSelectionsFromForm,
    formDataToStoredCharacter,
    normalizeStoredCharacter,
} from "./characterAdapter";
import { flattenStoredToForm } from "./presetStats";
import { deriveCharacterGrants } from "./characterGrants";
import { deriveModifiersForCharacter } from "./deriveModifiers";
import { applyDerivedCombatStats } from "./applyDerivedCombatStats";
import { sanitizeSelectionsWithStartingMaterialization } from "./grantPickSanitize";
import { deriveMaxHpFromForm } from "./hp";
import { syncResourceHpToResolvedMax } from "./hpSync";
import { readLevelFromForm } from "./level";
import { resolveCharacterNameForSave } from "./defaultCharacterName";
import { deriveResourceTotals } from "./deriveResourceTotals";
import { mergeSessionResources } from "./mergeSessionResources";
import type { StoredCharacter } from "./storedCharacter";
import type { CharacterSelections } from "./storedCharacter";
import { sanitizeCharacterNotes } from "./notes";

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

/** Re-run class HP formula when the stored max still matches the previous formula. */
function formAllowingDerivedMaxHpRefresh(
    formData: Record<string, unknown>,
    existing: StoredCharacter | undefined,
    system: SystemKey,
    locale: Locale
): Record<string, unknown> {
    if (!existing) {
        return formData;
    }

    const previousFormula = deriveMaxHpFromForm(
        flattenStoredToForm(existing, system),
        system,
        locale
    );
    const currentMax =
        typeof formData.maxHp === "number"
            ? formData.maxHp
            : existing.baseStats.hitPoints;

    if (previousFormula !== undefined && currentMax === previousFormula) {
        const { maxHp: _ignored, ...rest } = formData;
        return rest;
    }

    return formData;
}

export function buildStoredCharacter(input: BuildCharacterInput): StoredCharacter {
    const { id, type, system, locale, formData: rawFormData, existing } = input;
    const formData = {
        ...rawFormData,
        name: resolveCharacterNameForSave(rawFormData.name, locale),
    };
    const characterLevel = readLevelFromForm(formData);

    let selections = buildSelectionsFromForm(formData, existing?.selections);
    selections = sanitizeSelectionsWithStartingMaterialization(
        selections,
        locale,
        system,
        characterLevel
    );
    const modifiers = deriveModifiersForCharacter(selections, locale, {
        preserve: existing?.modifiers,
        characterLevel,
        system,
    });
    const grants = deriveCharacterGrants(selections, locale, characterLevel, system);

    let processedForm = applyDerivedCombatStats(
        formAllowingDerivedMaxHpRefresh(
            withSanitizedSelectionFields(formData, selections),
            existing,
            system,
            locale
        ),
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

    const stored = formDataToStoredCharacter(
        processedForm,
        id,
        type,
        system,
        modifiers,
        existing?.selections,
        grants,
        selections
    );

    return {
        ...stored,
        resources: mergeSessionResources(
            deriveResourceTotals(grants),
            existing?.resources,
            stored.resources.hp
        ),
        notes: sanitizeCharacterNotes(existing?.notes),
    };
}

/**
 * Sanitize persisted JSON then rebuild grants, modifiers, and resources
 * from selections + catalog. Used on localStorage / API load.
 */
export function loadStoredCharacter(char: unknown): StoredCharacter {
    const stored = normalizeStoredCharacter(char);
    return rebuildStoredCharacter(
        stored,
        flattenStoredToForm(stored, stored.system),
        stored.language
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
