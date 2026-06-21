import type { LevelFeature } from "./levelFeature.types";

/**
 * Returns level features active at the given character level, sorted by level
 * ascending (stable order for grant resolution and choice keys).
 */
export function resolveLevelFeatures(
    features: LevelFeature[],
    characterLevel: number
): LevelFeature[] {
    const level = Math.max(1, Math.floor(characterLevel));

    return features
        .filter((feature) => feature.level <= level)
        .sort((a, b) => a.level - b.level);
}
