import { abilityModifier } from "@/lib/character/skillModifiers";
import type { HpDerivationContext } from "../types";

/** Average HP gained per level after level 1 (fixed/average method). */
export function averageHitDieGain(hitDie: number): number {
    return hitDie / 2 + 1;
}

function levelHpContribution(gain: number, conMod: number): number {
    return Math.max(1, gain + conMod);
}

/**
 * D&D 5e max HP using the fixed/average method:
 * L1 = max hit die + CON mod; each later level = average die + CON mod.
 * Each level's contribution is clamped to a minimum of 1.
 */
export function deriveDndMaxHp(ctx: HpDerivationContext): number | undefined {
    if (!ctx.classSlug || !ctx.hitDie) {
        return undefined;
    }

    if (!Number.isFinite(ctx.level) || ctx.level < 1) {
        return undefined;
    }

    const level = Math.floor(ctx.level);
    const conMod = abilityModifier(ctx.constitution);
    const firstLevel = levelHpContribution(ctx.hitDie, conMod);
    const laterLevels = levelHpContribution(
        averageHitDieGain(ctx.hitDie),
        conMod
    );

    return firstLevel + (level - 1) * laterLevels;
}

export const dndHpRules = {
    deriveMaxHp: deriveDndMaxHp,
};

function formatSigned(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

export function formatDndHpBreakdown(ctx: HpDerivationContext): string | undefined {
    const total = deriveDndMaxHp(ctx);
    if (total === undefined || !ctx.hitDie) {
        return undefined;
    }

    const conMod = abilityModifier(ctx.constitution);
    const conModLabel = formatSigned(conMod);
    const level = Math.floor(ctx.level);

    if (level <= 1) {
        return `d${ctx.hitDie} + CON ${conModLabel} at L1 = ${total}`;
    }

    const avgGain = averageHitDieGain(ctx.hitDie);
    const perLevel = levelHpContribution(avgGain, conMod);

    return `d${ctx.hitDie} + CON ${conModLabel} at L1, +${perLevel} x ${level - 1} = ${total}`;
}
