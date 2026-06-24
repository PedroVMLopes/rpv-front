import type { Modifier } from "./modifier.types";
import type { ModifierSourceType } from "./modifier.source";

export function removeModifiersBySource(
    modifiers: Modifier[],
    source: { type: ModifierSourceType; id?: string }
): Modifier[] {
    return modifiers.filter((modifier) => {
        if (modifier.source.type !== source.type) {
            return true;
        }

        if (source.id !== undefined && modifier.source.id !== source.id) {
            return true;
        }

        return false;
    });
}
