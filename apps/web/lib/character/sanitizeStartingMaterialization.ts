import type { Locale } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { sanitizeGrantPicks } from "./grantPickSanitize";
import { mergeStartingGrants } from "./materializeInventoryGrants";
import type { CharacterSelections } from "./storedCharacter";

/**
 * Prunes stale grant picks and rematerializes granted bag stacks and
 * grantedCurrency from the active exclusive branches and sources.
 */
export function sanitizeStartingMaterialization(
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel = 1
): CharacterSelections {
    const withPicks = sanitizeGrantPicks(
        selections,
        locale,
        system,
        characterLevel
    );

    return mergeStartingGrants(withPicks, locale, system, characterLevel);
}
