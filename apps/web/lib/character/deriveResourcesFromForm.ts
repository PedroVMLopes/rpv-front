import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "./characterAdapter";
import { deriveCharacterGrants } from "./characterGrants";
import { deriveResourceTotals } from "./deriveResourceTotals";
import {
    listOtherDerivedResources,
    type DerivedResource,
} from "./grantDisplay";
import { sanitizeSelections } from "./grantPickSanitize";
import { readLevelFromForm } from "./level";
import {
    listSpellSlotResources,
    type SpellSlotResource,
} from "./spellSlotResources";

export function deriveResourcesFromForm(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey
): Record<string, number> {
    const characterLevel = readLevelFromForm(formData);
    const selections = sanitizeSelections(
        buildSelectionsFromForm(formData),
        locale,
        system,
        characterLevel
    );
    const grants = deriveCharacterGrants(
        selections,
        locale,
        characterLevel
    );

    return deriveResourceTotals(grants);
}

export function parseDerivedResources(resources: Record<string, number>): {
    spellSlots: SpellSlotResource[];
    classResources: DerivedResource[];
} {
    return {
        spellSlots: listSpellSlotResources(resources),
        classResources: listOtherDerivedResources(resources),
    };
}
