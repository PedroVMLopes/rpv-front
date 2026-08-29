import type { SystemKey } from "@/presets";
import type { AcDerivationContext, AcRules } from "@/presets/types";
import { buildSelectionsFromForm } from "./characterAdapter";
import { deriveRaceModifiers } from "./raceModifiers";
import { deriveStatModifiers } from "./characterGrants";
import { buildBaseStatsFromForm } from "./presetStats";
import { getSystemRules } from "./systemRules";
import {
    emptyInventory,
    resolveStats,
    type Modifier,
    type ResolveContext,
    type Stats,
} from "@rpv/domain";
import type { Locale } from "@rpv/domain";
import type { Grant } from "@rpv/content";
import { computeEquippedArmorClass } from "./equippedArmorAc";
import type { CharacterInventory } from "@rpv/domain";
import { collectArmorClassFormulaGrants } from "./characterGrants";
import { readLevelFromForm } from "./level";

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
    const raceModifiers = deriveRaceModifiers(selections, locale);
    const baseStats = buildBaseStatsFromForm(formData, system);
    const resolved = resolveStats(baseStats, raceModifiers);
    const inventory = selections.inventory ?? emptyInventory();
    const formulaGrants = collectArmorClassFormulaGrants(
        selections,
        locale,
        readLevelFromForm(formData),
        system
    );

    return computeEquippedArmorClass(inventory, resolved.dexterity, system, {
        stats: resolved,
        formulaGrants,
    });
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
    system: SystemKey,
    formulaGrants: Grant[] = [],
    context: ResolveContext = {}
): number {
    const nonAcModifiers = modifiers.filter(
        (modifier) => modifier.stat !== "armorClass"
    );
    const acModifiers = modifiers.filter(
        (modifier) => modifier.stat === "armorClass"
    );
    const resolvedWithoutAcMods = resolveStats(
        baseStats,
        nonAcModifiers,
        context
    );
    const formulaAc = computeEquippedArmorClass(
        inventory,
        resolvedWithoutAcMods.dexterity,
        system,
        {
            stats: resolvedWithoutAcMods,
            formulaGrants,
        }
    );

    return resolveStats(
        { ...resolvedWithoutAcMods, armorClass: formulaAc },
        acModifiers,
        context
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
        system,
        collectArmorClassFormulaGrants(
            selections,
            locale,
            readLevelFromForm(formData),
            system
        )
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
