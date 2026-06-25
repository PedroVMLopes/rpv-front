import {
    abilityScoreGrantsToModifiers,
    dndRaceLevelGrants,
    resolveAbilityScoreGrants,
} from "@rpv/content";
import type { Locale, Modifier } from "@rpv/domain";
import { getRace, getSubrace } from "@/lib/catalog/raceCatalog";
import type { CharacterSelections } from "./storedCharacter";

function collectRaceAbilityScoreModifiers(
    selections: Pick<CharacterSelections, "race" | "subrace" | "choices">,
    locale: Locale
): Modifier[] {
    const grantPicks = selections.choices?.grantPicks ?? {};
    const modifiers: Modifier[] = [];

    if (selections.race) {
        const race = getRace(selections.race, locale);
        if (race) {
            const raceLevelGrants = dndRaceLevelGrants[selections.race] ?? [];
            modifiers.push(
                ...abilityScoreGrantsToModifiers(raceLevelGrants, race.slug)
            );
            modifiers.push(
                ...resolveAbilityScoreGrants(raceLevelGrants, grantPicks, {
                    sourceType: "race",
                    sourceId: race.slug,
                })
            );

            for (const trait of race.traits) {
                modifiers.push(
                    ...abilityScoreGrantsToModifiers(trait.grants, race.slug)
                );
                modifiers.push(
                    ...resolveAbilityScoreGrants(trait.grants, grantPicks, {
                        sourceType: "race",
                        sourceId: race.slug,
                    })
                );
            }
        }
    }

    if (selections.subrace) {
        const subrace = getSubrace(selections.subrace, locale);
        if (subrace) {
            for (const trait of subrace.traits) {
                modifiers.push(
                    ...abilityScoreGrantsToModifiers(trait.grants, subrace.slug)
                );
                modifiers.push(
                    ...resolveAbilityScoreGrants(trait.grants, grantPicks, {
                        sourceType: "race",
                        sourceId: subrace.slug,
                    })
                );
            }
        }
    }

    return modifiers;
}

export function deriveRaceModifiers(
    selections: Pick<CharacterSelections, "race" | "subrace" | "choices">,
    locale: Locale
): Modifier[] {
    return collectRaceAbilityScoreModifiers(selections, locale);
}
