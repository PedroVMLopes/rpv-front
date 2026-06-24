import type { AcDerivationContext } from "../types";
import { dndAbilityModifier } from "./math";

/**
 * D&D 5e unarmored base AC: 10 + Dexterity modifier.
 */
export function deriveDndBaseAc(ctx: AcDerivationContext): number {
    return 10 + dndAbilityModifier(ctx.dexterity);
}

export const dndAcRules = {
    deriveBaseAc: deriveDndBaseAc,
    formatBreakdown: formatDndAcBreakdown,
};

function formatSigned(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

export function formatDndAcBreakdown(
    ctx: AcDerivationContext
): string | undefined {
    const total = deriveDndBaseAc(ctx);
    const dexMod = dndAbilityModifier(ctx.dexterity);

    return `10 + DEX ${formatSigned(dexMod)} = ${total}`;
}
