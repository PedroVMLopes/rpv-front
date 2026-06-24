import { abilityScoreGrantsToModifiers } from "@rpv/content";
import type { Locale, Modifier } from "@rpv/domain";
import { getRace, getSubrace } from "@/lib/catalog/raceCatalog";
import type { CharacterSelections } from "./storedCharacter";

export function deriveRaceModifiers(
    selections: Pick<CharacterSelections, "race" | "subrace">,
    locale: Locale
): Modifier[] {
    const modifiers: Modifier[] = [];

    if (selections.race) {
        const race = getRace(selections.race, locale);
        if (race) {
            const grants = race.traits.flatMap((trait) => trait.grants);
            modifiers.push(...abilityScoreGrantsToModifiers(grants, race.slug));
        }
    }

    if (selections.subrace) {
        const subrace = getSubrace(selections.subrace, locale);
        if (subrace) {
            const grants = subrace.traits.flatMap((trait) => trait.grants);
            modifiers.push(
                ...abilityScoreGrantsToModifiers(grants, subrace.slug)
            );
        }
    }

    return modifiers;
}
