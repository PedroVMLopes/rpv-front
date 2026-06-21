import type { Locale } from "@rpv/domain";
import { collectPendingChoiceGrants } from "./grantChoices";
import type { CharacterSelections } from "./storedCharacter";

/**
 * Drops grant pick entries whose keys no longer match pending choices for the
 * current race, subrace, class, background, items, or character level.
 */
export function sanitizeGrantPicks(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel = 1
): CharacterSelections {
    const pending = collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel
    );
    const validKeys = new Set(pending.map((choice) => choice.key));
    const grantPicks = selections.choices.grantPicks ?? {};

    const sanitizedPicks = Object.fromEntries(
        Object.entries(grantPicks).filter(([key]) => validKeys.has(key))
    );

    if (
        Object.keys(sanitizedPicks).length === Object.keys(grantPicks).length
    ) {
        return selections;
    }

    return {
        ...selections,
        choices: {
            ...selections.choices,
            grantPicks: sanitizedPicks,
        },
    };
}
