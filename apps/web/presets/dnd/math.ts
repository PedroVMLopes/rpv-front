export function dndAbilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

export function dndProficiencyBonus(level: number): number {
    const normalized =
        !Number.isFinite(level) || level < 1 ? 1 : Math.floor(level);

    return 2 + Math.floor((normalized - 1) / 4);
}
