/**
 * Display-only damage affinities keyed by trait slug or ability grant ref/name.
 * Opaque damage-type slugs (fire, poison, …). Not applied to incoming damage rolls.
 */
export type DamageAffinity = {
    resistance?: string[];
    immunity?: string[];
    vulnerability?: string[];
};

export const dndDamageAffinityBySource: Record<string, DamageAffinity> = {
    "hellish-resistance": { resistance: ["fire"] },
    "Hellish Resistance": { resistance: ["fire"] },
};

export function getDamageAffinityForSource(
    sourceKey: string
): DamageAffinity | undefined {
    return dndDamageAffinityBySource[sourceKey];
}

export function listDamageAffinitySourceKeys(): string[] {
    return Object.keys(dndDamageAffinityBySource);
}
