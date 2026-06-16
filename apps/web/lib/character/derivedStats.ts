import type { Stats } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { getSystemRules } from "./systemRules";

export function getProficiencyBonus(system: SystemKey, level: number): number {
    return getSystemRules(system).proficiencyBonus(level);
}

export function computeInitiative(system: SystemKey, stats: Stats): number {
    return getSystemRules(system).initiative(stats);
}

export function computePassivePerception(
    system: SystemKey,
    skillModifiers: { slug: string; modifier: number }[]
): number {
    return getSystemRules(system).passivePerception(skillModifiers);
}
