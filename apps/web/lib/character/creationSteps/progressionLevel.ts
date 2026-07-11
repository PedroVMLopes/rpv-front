import { readLevelFromForm } from "@/lib/character/level";
import { CREATION_PROGRESSION_CAP } from "./creationStep.types";

/**
 * Maximum character level the creation wizard walks through interactively.
 * Persisted level may be higher; L4+ choices are deferred to level-up / edit.
 */
export function getCreationProgressionLevel(
    formData: Record<string, unknown>
): number {
    return Math.min(readLevelFromForm(formData), CREATION_PROGRESSION_CAP);
}

export function isAboveCreationProgressionCap(featureLevel: number): boolean {
    return featureLevel > CREATION_PROGRESSION_CAP;
}
