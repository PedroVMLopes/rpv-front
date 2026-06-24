import type { SystemKey } from "@/presets";
import type { HpDerivationContext, HpRules } from "@/presets/types";
import { getClassHitDie } from "@/lib/catalog/grantCatalog";
import { buildSelectionsFromForm } from "./characterAdapter";
import { deriveRaceModifiers } from "./raceModifiers";
import { deriveStatModifiers } from "./characterGrants";
import { buildBaseStatsFromForm } from "./presetStats";
import { getSystemRules } from "./systemRules";
import { resolveStats } from "@rpv/domain";
import type { Locale } from "@rpv/domain";

import { readLevelFromForm } from "./level";

export function getHpRules(system: SystemKey): HpRules {
    return getSystemRules(system).hp;
}

export function deriveMaxHp(
    system: SystemKey,
    ctx: HpDerivationContext
): number | undefined {
    return getHpRules(system).deriveMaxHp(ctx);
}

function coerceClassSlug(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
    }
    return undefined;
}

export function resolveConstitutionFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): number {
    const selections = buildSelectionsFromForm(formData);
    const raceModifiers = deriveRaceModifiers(selections, locale);
    const baseStats = buildBaseStatsFromForm(formData, system);
    const resolved = resolveStats(baseStats, raceModifiers);

    return resolved.constitution;
}

export function buildHpDerivationContextFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): HpDerivationContext | undefined {
    const level = readLevelFromForm(formData);
    const classSlug = coerceClassSlug(formData.characterClass);

    if (!classSlug) {
        return undefined;
    }

    const hitDie = getClassHitDie(classSlug);
    if (!hitDie) {
        return undefined;
    }

    return {
        level,
        constitution: resolveConstitutionFromForm(formData, system, locale),
        classSlug,
        hitDie,
    };
}

export function deriveMaxHpFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): number | undefined {
    const ctx = buildHpDerivationContextFromForm(formData, system, locale);
    if (!ctx) {
        return undefined;
    }

    return deriveMaxHp(system, ctx);
}

export function isMaxHpEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === "";
}

export function resolveMaxHpFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): number | undefined {
    const selections = buildSelectionsFromForm(formData);
    const baseStats = buildBaseStatsFromForm(formData, system);
    const modifiers = [
        ...deriveRaceModifiers(selections, locale),
        ...deriveStatModifiers(selections, locale),
    ];

    return resolveStats(baseStats, modifiers).hitPoints;
}

export function formatMaxHpBreakdownFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): string | undefined {
    const ctx = buildHpDerivationContextFromForm(formData, system, locale);
    if (!ctx) {
        return undefined;
    }

    return getHpRules(system).formatBreakdown(ctx);
}
