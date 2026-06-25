export type LevelPreset = "lv1" | "lv3" | "custom";

export function inferLevelPreset(level: number): LevelPreset {
    if (level === 1) {
        return "lv1";
    }

    if (level === 3) {
        return "lv3";
    }

    return "custom";
}
