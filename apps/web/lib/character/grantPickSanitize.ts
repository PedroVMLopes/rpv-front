import type { Locale } from "@rpv/domain";
import { emptyInventory } from "@rpv/domain";
import { getClassSubclassLevel, getSubclass } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { collectPendingChoiceGrants } from "./grantChoices";
import { sanitizeInventory } from "./inventory";
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

function isSubclassUnlockedForLevel(
    characterClass: string | undefined,
    characterLevel: number
): boolean {
    if (!characterClass) {
        return true;
    }

    const subclassLevel = getClassSubclassLevel(characterClass);
    if (subclassLevel === undefined) {
        return true;
    }

    return characterLevel >= subclassLevel;
}

/**
 * Clears an invalid subclass selection and prunes stale grant picks.
 */
export function sanitizeSelections(
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel = 1
): CharacterSelections {
    let next: CharacterSelections = {
        ...selections,
        inventory: sanitizeInventory(selections.inventory ?? emptyInventory(), system),
    };

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

    if (
        next.subclass &&
        !isSubclassUnlockedForLevel(next.characterClass, characterLevel)
    ) {
        next = {
            ...next,
            subclass: undefined,
        };
    }

    return sanitizeGrantPicks(next, locale, system, characterLevel);
}

/**
 * Drops grant pick entries whose keys no longer match pending choices for the
 * current race, subrace, class, subclass, background, equipped items, or character level.
 */
export function sanitizeGrantPicks(
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel = 1
): CharacterSelections {
    const pending = collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel,
        system
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
