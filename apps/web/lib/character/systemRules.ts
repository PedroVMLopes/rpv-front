import { presets, SystemKey } from "@/presets";
import type { SystemRules } from "@/presets/types";

export function getSystemRules(system: SystemKey): SystemRules {
    return presets[system].presetData.rules;
}
