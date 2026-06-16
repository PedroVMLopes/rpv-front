import { abilityModifier } from "@/lib/character/skillModifiers";
import type { AcDerivationContext } from "../types";

/**
 * D&D 5e unarmored base AC: 10 + Dexterity modifier.
 */
export function deriveDndBaseAc(ctx: AcDerivationContext): number {
    return 10 + abilityModifier(ctx.dexterity);
}

export const dndAcRules = {
    deriveBaseAc: deriveDndBaseAc,
};

function formatSigned(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

export function formatDndAcBreakdown(
    ctx: AcDerivationContext
): string | undefined {
    const total = deriveDndBaseAc(ctx);
    const dexMod = abilityModifier(ctx.dexterity);

    return `10 + DEX ${formatSigned(dexMod)} = ${total}`;
}
