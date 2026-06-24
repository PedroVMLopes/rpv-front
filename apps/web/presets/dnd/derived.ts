import type { Stats } from "@rpv/domain";
import { dndAbilityModifier } from "./math";

export function dndInitiative(stats: Stats): number {
    return dndAbilityModifier(stats.dexterity ?? 10);
}

export function dndPassivePerception(
    skillModifiers: { slug: string; modifier: number }[]
): number {
    const perception = skillModifiers.find((s) => s.slug === "perception");
    return 10 + (perception?.modifier ?? 0);
}
