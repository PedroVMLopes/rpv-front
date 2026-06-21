import type { Locale } from "@rpv/domain";
import { getSubclass } from "@rpv/content";
import { collectPendingChoiceGrants } from "./grantChoices";
import type { CharacterSelections } from "./storedCharacter";

function isSubclassValidForClass(
    subclassSlug: string | undefined,
    characterClass: string | undefined,
    locale: Locale
): boolean {
    if (!subclassSlug) {
        return true;
    }

    const entry = getSubclass(subclassSlug, locale);
    if (!entry) {
        return false;
    }

    return entry.classSlug === characterClass;
}

/**
 * Clears an invalid subclass selection and prunes stale grant picks.
 */
export function sanitizeSelections(
    selections: CharacterSelections,
    locale: Locale,
    characterLevel = 1
): CharacterSelections {
    let next = selections;

    if (
        next.subclass &&
        !isSubclassValidForClass(
            next.subclass,
            next.characterClass,
            locale
        )
    ) {
        next = {
            ...next,
            subclass: undefined,
        };
    }

    return sanitizeGrantPicks(next, locale, characterLevel);
}

/**
 * Drops grant pick entries whose keys no longer match pending choices for the
 * current race, subrace, class, subclass, background, items, or character level.
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
