import type { SystemKey } from "@/presets";
import type { AcDerivationContext, AcRules } from "@/presets/types";
import { buildSelectionsFromForm } from "./characterAdapter";
import { deriveRaceModifiers } from "./raceModifiers";
import {
    deriveStatModifiers,
    grantContextFromForm,
} from "./characterGrants";
import { buildBaseStatsFromForm } from "./presetStats";
import { getSystemRules } from "./systemRules";
import { resolveStats } from "@rpv/domain";
import type { Locale } from "@rpv/domain";

export function getAcRules(system: SystemKey): AcRules {
    return getSystemRules(system).ac;
}

export function deriveBaseAc(
    system: SystemKey,
    ctx: AcDerivationContext
): number | undefined {
    return getAcRules(system).deriveBaseAc(ctx);
}

export function resolveDexterityFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): number {
    const selections = buildSelectionsFromForm(formData);
    const raceModifiers = deriveRaceModifiers(selections, locale);
    const baseStats = buildBaseStatsFromForm(formData, system);
    const resolved = resolveStats(baseStats, raceModifiers);

    return resolved.dexterity;
}

export function buildAcDerivationContextFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): AcDerivationContext {
    return {
        dexterity: resolveDexterityFromForm(formData, system, locale),
    };
}

export function deriveBaseAcFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): number | undefined {
    const ctx = buildAcDerivationContextFromForm(formData, system, locale);
    return deriveBaseAc(system, ctx);
}

export function isAcEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === "";
}

export function resolveAcFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): number | undefined {
    const selections = buildSelectionsFromForm(formData);
    const context = grantContextFromForm(formData);
    const baseStats = buildBaseStatsFromForm(formData, system);
    const modifiers = [
        ...deriveRaceModifiers(selections, locale),
        ...deriveStatModifiers(selections, context, locale),
    ];

    return resolveStats(baseStats, modifiers).armorClass;
}

export function formatBaseAcBreakdownFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): string | undefined {
    const ctx = buildAcDerivationContextFromForm(formData, system, locale);
    return getAcRules(system).formatBreakdown(ctx);
}
