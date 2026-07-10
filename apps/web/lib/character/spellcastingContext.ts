import type { StoredCharacter } from "./storedCharacter";

export function buildSpellcastingSystemData(
    stored: Pick<StoredCharacter, "systemData" | "selections">
): Record<string, unknown> {
    return {
        ...stored.systemData,
        characterClass:
            stored.selections.characterClass ?? stored.systemData.characterClass,
    };
}
