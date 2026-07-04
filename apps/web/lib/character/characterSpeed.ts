import type { Locale } from "@rpv/domain";
import { getRace } from "@/lib/catalog/raceCatalog";
import type { CharacterSelections } from "./storedCharacter";

/**
 * Walking speed from the character's race catalog entry.
 * Subraces do not define speedWalk — race only.
 */
export function getCharacterWalkSpeed(
    selections: CharacterSelections,
    locale?: Locale
): number | undefined {
    const raceSlug = selections.race;
    if (!raceSlug) {
        return undefined;
    }

    const speed = getRace(raceSlug, locale)?.speedWalk;
    if (speed === undefined || speed <= 0) {
        return undefined;
    }

    return speed;
}
