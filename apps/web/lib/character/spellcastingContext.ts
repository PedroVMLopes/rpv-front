import { resolveSpellcastingProfile } from "@rpv/content";
import type { StatKey } from "@rpv/domain";
import type { StoredCharacter } from "./storedCharacter";

export function buildSpellcastingSystemData(
    stored: Pick<StoredCharacter, "systemData" | "selections">
): Record<string, unknown> {
    return {
        ...stored.systemData,
        characterClass:
            stored.selections.characterClass ?? stored.systemData.characterClass,
        subclass: stored.selections.subclass ?? stored.systemData.subclass,
    };
}

export function readSpellcastingAbilityFromSelections(input: {
    characterClass?: string;
    subclass?: string;
}): StatKey | null {
    return (
        resolveSpellcastingProfile(input.characterClass, input.subclass)
            .ability ?? null
    );
}
