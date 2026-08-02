import type { SystemKey } from "@/presets";
import type { AcDerivationContext, AcRules } from "@/presets/types";
import { buildSelectionsFromForm } from "./characterAdapter";
import { deriveRaceModifiers } from "./raceModifiers";
import { deriveStatModifiers } from "./characterGrants";
import { buildBaseStatsFromForm } from "./presetStats";
import { getSystemRules } from "./systemRules";
import { emptyInventory, resolveStats, type Modifier, type Stats } from "@rpv/domain";
import type { Locale } from "@rpv/domain";
import { computeEquippedArmorClass } from "./equippedArmorAc";
import type { CharacterInventory } from "@rpv/domain";

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
    const selections = buildSelectionsFromForm(formData);
    const dexterity = resolveDexterityFromForm(formData, system, locale);
    const inventory = selections.inventory ?? emptyInventory();

    return computeEquippedArmorClass(inventory, dexterity, system);
}

export function isAcEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === "";
}

/**
 * Resolve AC using equipped armor formula as the base, then layer AC modifiers
 * (magic items, etc.) on top.
 */
export function resolveArmorClassWithEquipment(
    baseStats: Stats,
    modifiers: Modifier[],
    inventory: CharacterInventory,
    system: SystemKey
): number {
    const nonAcModifiers = modifiers.filter(
        (modifier) => modifier.stat !== "armorClass"
    );
    const acModifiers = modifiers.filter(
        (modifier) => modifier.stat === "armorClass"
    );
    const resolvedWithoutAcMods = resolveStats(baseStats, nonAcModifiers);
    const formulaAc = computeEquippedArmorClass(
        inventory,
        resolvedWithoutAcMods.dexterity,
        system
    );

    return resolveStats(
        { ...resolvedWithoutAcMods, armorClass: formulaAc },
        acModifiers
    ).armorClass;
}

export function resolveAcFromForm(
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

    return resolveArmorClassWithEquipment(
        baseStats,
        modifiers,
        selections.inventory ?? emptyInventory(),
        system
    );
}

export function formatBaseAcBreakdownFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): string | undefined {
    const ctx = buildAcDerivationContextFromForm(formData, system, locale);
    return getAcRules(system).formatBreakdown(ctx);
}
