import type { Locale, Modifier } from "@rpv/domain";
import { removeModifiersBySource } from "@rpv/domain";
import { deriveRaceModifiers } from "./raceModifiers";
import {
    deriveStatModifiers,
    STAT_MODIFIER_SOURCE_TYPES,
} from "./characterGrants";
import type { CharacterSelections } from "./storedCharacter";

export function deriveModifiersForCharacter(
    selections: CharacterSelections,
    locale: Locale,
    options?: { preserve?: Modifier[] }
): Modifier[] {
    const derived = [
        ...deriveRaceModifiers(selections, locale),
        ...deriveStatModifiers(selections, locale),
    ];

    if (!options?.preserve) {
        return derived;
    }

    let preserved = removeModifiersBySource(options.preserve, {
        type: "race",
    });

    for (const sourceType of STAT_MODIFIER_SOURCE_TYPES) {
        preserved = removeModifiersBySource(preserved, {
            type: sourceType,
        });
    }

    return [...preserved, ...derived];
}
