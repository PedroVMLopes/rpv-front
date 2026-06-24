import { dndPreset } from "./dnd";
import type { SystemDefinition } from "./types";

export const presets = {
    dnd: {
        name: "Dungeons & Dragons",
        presetData: dndPreset,
    },
} satisfies Record<string, { name: string; presetData: SystemDefinition }>;

export type SystemKey = keyof typeof presets;