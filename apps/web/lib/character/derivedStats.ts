import type { Stats } from "@rpv/domain";
import { abilityModifier, proficiencyBonus } from "@/lib/character/skillModifiers";

export function getProficiencyBonus(level: number): number {
    return proficiencyBonus(level);
}

export function computeInitiative(stats: Stats): number {
    return abilityModifier(stats.dexterity ?? 10);
}

export function computePassivePerception(
    skillModifiers: { slug: string; modifier: number }[]
): number {
    const perception = skillModifiers.find((s) => s.slug === "perception");
    return 10 + (perception?.modifier ?? 0);
}
