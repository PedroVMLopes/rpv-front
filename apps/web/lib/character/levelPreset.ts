export type LevelPreset = "lv1" | "lv2" | "lv3" | "custom";

const PRESET_LEVELS = new Set([1, 2, 3]);

export function inferLevelPreset(level: number): LevelPreset {
    if (level === 1) {
        return "lv1";
    }

    if (level === 2) {
        return "lv2";
    }

    if (level === 3) {
        return "lv3";
    }

    return "custom";
}

export function isPresetLevel(level: number): boolean {
    return PRESET_LEVELS.has(level);
}

export const CUSTOM_LEVEL_DEFAULT = 5;
