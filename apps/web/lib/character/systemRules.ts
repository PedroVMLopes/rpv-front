import { presets, SystemKey } from "@/presets";
import type { SystemRules, SessionMetaPointTracker } from "@/presets/types";

export function getSystemRules(system: SystemKey): SystemRules {
    return presets[system].presetData.rules;
}

export function getSessionMetaPointTrackers(
    system: SystemKey
): SessionMetaPointTracker[] {
    return presets[system].presetData.sessionMetaPoints ?? [];
}
