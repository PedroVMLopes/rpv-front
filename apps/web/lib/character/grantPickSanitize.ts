import type { Locale } from "@rpv/domain";
import { collectPendingChoiceGrants } from "./grantChoices";
import type { GrantSourceContext } from "./characterGrants";
import type { CharacterSelections } from "./storedCharacter";

/**
 * Drops grant pick entries whose keys no longer match pending choices for the
 * current race, subrace, class, background, or starting item.
 */
export function sanitizeGrantPicks(
    selections: CharacterSelections,
    context: GrantSourceContext,
    locale: Locale
): CharacterSelections {
    const pending = collectPendingChoiceGrants(selections, context, locale);
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
