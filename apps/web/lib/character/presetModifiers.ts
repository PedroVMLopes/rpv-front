import type { Modifier } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { getDefaultModifiersForCreation as getDndDefaultModifiers } from "@/presets/dnd/modifiers";

export function getDefaultModifiersForCreation(system: SystemKey): Modifier[] {
    switch (system) {
        case "dnd":
            return getDndDefaultModifiers();
        default:
            return [];
    }
}
