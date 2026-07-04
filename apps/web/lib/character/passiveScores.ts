/**
 * Passive score for a skill: 10 + skill modifier (system-agnostic formula).
 */
export function computePassiveScore(
    skillModifiers: { slug: string; modifier: number }[],
    skillSlug: string
): number {
    const skill = skillModifiers.find((entry) => entry.slug === skillSlug);
    return 10 + (skill?.modifier ?? 0);
}
