import type { Locale } from "@rpv/domain";
import { emptyInventory } from "@rpv/domain";
import { getClassSubclassLevel, getSubclass } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { getStepIndexForGrantPickKey } from "./characterCreationSteps";
import { getFixedRefsForGrantType } from "./characterGrants";
import { collectPendingChoiceGrants } from "./grantChoices";
import {
    findGrantPicksOnOwnedRefs,
    getOtherPickedRefsForGrantType,
} from "./grantChoiceOptions";
import { sanitizeInventory } from "./inventory";
import { mergeStartingGrants } from "./materializeInventoryGrants";
import {
    listKnownLeveledSpellRefs,
    prunePreparedSpellsToBook,
} from "./knownLeveledSpells";
import { collectValidStartingEquipmentPickKeys } from "./startingEquipmentValidation";
import type { CharacterSelections } from "./storedCharacter";

function pickKeyToPrune(keys: string[]): string {
    return [...keys].sort((a, b) => {
        const stepDiff =
            getStepIndexForGrantPickKey(b) - getStepIndexForGrantPickKey(a);
        return stepDiff !== 0 ? stepDiff : b.localeCompare(a);
    })[0];
}

/**
 * Drops grant picks that conflict with fixed grants from another source or
 * duplicate the same ref across choice slots. Prefers keeping earlier-step
 * picks (race before class before background).
 */
export function pruneConflictingGrantPicks(
    grantPicks: Record<string, string>,
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel = 1
): Record<string, string> {
    const pending = collectPendingChoiceGrants(
        selections,
        locale,
        characterLevel,
        system
    ).filter(
        (choice) =>
            choice.grant.grantType !== "inventory_item" &&
            choice.grant.grantType !== "currency"
    );

    const grantTypes = new Set(pending.map((choice) => choice.grant.grantType));
    const ownedRefsByGrantType = new Map(
        [...grantTypes].map((grantType) => [
            grantType,
            getFixedRefsForGrantType(
                selections,
                locale,
                grantType,
                characterLevel
            ),
        ])
    );

    let nextPicks = { ...grantPicks };

    for (;;) {
        let changed = false;

        for (const invalid of findGrantPicksOnOwnedRefs(
            pending,
            nextPicks,
            ownedRefsByGrantType
        )) {
            if (nextPicks[invalid.key]) {
                delete nextPicks[invalid.key];
                changed = true;
            }
        }

        const duplicateKeys = new Set<string>();

        for (const choice of pending) {
            const ref = nextPicks[choice.key]?.trim();
            if (!ref) {
                continue;
            }

            const otherPicked = getOtherPickedRefsForGrantType(
                choice.grant.grantType,
                pending,
                nextPicks,
                choice.key
            );

            if (!otherPicked.has(ref)) {
                continue;
            }

            const conflictingKeys = pending
                .filter(
                    (entry) =>
                        entry.grant.grantType === choice.grant.grantType &&
                        nextPicks[entry.key]?.trim() === ref
                )
                .map((entry) => entry.key);

            if (conflictingKeys.length > 1) {
                duplicateKeys.add(pickKeyToPrune(conflictingKeys));
            }
        }

        for (const key of duplicateKeys) {
            if (nextPicks[key]) {
                delete nextPicks[key];
                changed = true;
            }
        }

        if (!changed) {
            return nextPicks;
        }
    }
}

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
 * Clears invalid subclass, prunes stale grant picks, and rematerializes
 * granted inventory and currency from active starting-equipment branches.
 */
export function sanitizeSelectionsWithStartingMaterialization(
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

    return mergeStartingGrants(
        sanitizeGrantPicks(next, locale, system, characterLevel),
        locale,
        system,
        characterLevel
    );
}

/**
 * Drops grant pick entries whose keys no longer match pending choices for the
 * current race, subrace, class, subclass, background, equipped items, or character level.
 * Also prunes preparedSpells that are no longer in the known leveled book.
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
    ).filter(
        (choice) =>
            choice.grant.grantType !== "inventory_item" &&
            choice.grant.grantType !== "currency"
    );
    const validKeys = new Set(pending.map((choice) => choice.key));
    const startingKeys = collectValidStartingEquipmentPickKeys(
        selections,
        locale,
        system,
        characterLevel
    );

    for (const key of startingKeys) {
        validKeys.add(key);
    }

    const grantPicks = selections.choices.grantPicks ?? {};

    const staleFilteredPicks = Object.fromEntries(
        Object.entries(grantPicks).filter(([key]) => validKeys.has(key))
    );

    const sanitizedPicks = pruneConflictingGrantPicks(
        staleFilteredPicks,
        selections,
        locale,
        system,
        characterLevel
    );

    const picksChanged =
        JSON.stringify(sanitizedPicks) !== JSON.stringify(grantPicks);

    let next: CharacterSelections = picksChanged
        ? {
              ...selections,
              choices: {
                  ...selections.choices,
                  grantPicks: sanitizedPicks,
              },
          }
        : selections;

    const currentPrepared = next.choices.preparedSpells;
    const knownLeveled = listKnownLeveledSpellRefs({
        selections: next,
        locale,
        system,
        characterLevel,
    });
    const prunedPrepared = prunePreparedSpellsToBook(
        currentPrepared,
        knownLeveled
    );
    const preparedChanged =
        JSON.stringify(prunedPrepared) !== JSON.stringify(currentPrepared);

    if (!picksChanged && !preparedChanged) {
        return selections;
    }

    if (preparedChanged && prunedPrepared !== undefined) {
        next = {
            ...next,
            choices: {
                ...next.choices,
                preparedSpells: prunedPrepared,
            },
        };
    }

    return next;
}
