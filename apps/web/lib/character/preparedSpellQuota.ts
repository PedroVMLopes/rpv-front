import { getClass, getClassPreparedQuotaKind } from "@rpv/content";
import type { PreparedQuotaKind } from "@rpv/content";
import type { Locale, Stats, StatKey } from "@rpv/domain";
import { resolveStats } from "@rpv/domain";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "./characterAdapter";
import { deriveRaceModifiers } from "./raceModifiers";
import { buildBaseStatsFromForm } from "./presetStats";
import { getSystemRules } from "./systemRules";
import { readLevelFromForm } from "./level";
import type { StoredCharacter } from "./storedCharacter";

export function computePreparedSpellQuota(input: {
    characterLevel: number;
    abilityScore: number;
    system?: SystemKey;
    kind?: PreparedQuotaKind;
}): number {
    const rules = getSystemRules(input.system ?? "dnd");
    const mod = rules.abilityModifier(input.abilityScore);
    const levelPart =
        input.kind === "half-level-plus-mod"
            ? Math.floor(input.characterLevel / 2)
            : input.characterLevel;
    return Math.max(1, levelPart + mod);
}

/**
 * Resolves the class spellcasting ability score from form attributes + race
 * modifiers. Returns undefined when the class has no spellcastingAbility.
 */
export function resolveSpellcastingAbilityScoreFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): number | undefined {
    const selections = buildSelectionsFromForm(formData);
    const classSlug = selections.characterClass;
    if (!classSlug) {
        return undefined;
    }

    const ability = getClass(classSlug)?.spellcastingAbility;
    if (!ability) {
        return undefined;
    }

    const raceModifiers = deriveRaceModifiers(selections, locale);
    const baseStats = buildBaseStatsFromForm(formData, system);
    const resolved = resolveStats(baseStats, raceModifiers);

    return resolved[ability];
}

export function computePreparedSpellQuotaFromForm(
    formData: Record<string, unknown>,
    system: SystemKey,
    locale: Locale
): number | undefined {
    const abilityScore = resolveSpellcastingAbilityScoreFromForm(
        formData,
        system,
        locale
    );
    if (abilityScore === undefined) {
        return undefined;
    }

    const classSlug = buildSelectionsFromForm(formData).characterClass;
    const kind = classSlug
        ? getClassPreparedQuotaKind(classSlug)
        : undefined;

    return computePreparedSpellQuota({
        characterLevel: readLevelFromForm(formData),
        abilityScore,
        system,
        kind,
    });
}

export function computePreparedSpellQuotaForStored(
    stored: StoredCharacter
): number | undefined {
    const classSlug =
        stored.selections.characterClass ??
        (typeof stored.systemData.characterClass === "string"
            ? stored.systemData.characterClass
            : undefined);
    if (!classSlug) {
        return undefined;
    }

    const ability = getClass(classSlug)?.spellcastingAbility as
        | StatKey
        | undefined;
    if (!ability) {
        return undefined;
    }

    const abilityScore = (stored.baseStats as Stats)[ability] ?? 10;
    const rawLevel = stored.systemData.level;
    const characterLevel =
        typeof rawLevel === "number" && Number.isFinite(rawLevel) && rawLevel >= 1
            ? Math.min(Math.floor(rawLevel), 20)
            : 1;

    return computePreparedSpellQuota({
        characterLevel,
        abilityScore,
        system: stored.system,
        kind: getClassPreparedQuotaKind(classSlug),
    });
}

/** Keeps the first `quota` prepared slugs (stable prefix). */
export function prunePreparedSpellsToQuota(
    prepared: string[] | undefined,
    quota: number
): string[] | undefined {
    if (prepared === undefined) {
        return undefined;
    }

    if (prepared.length <= quota) {
        return prepared;
    }

    return prepared.slice(0, quota);
}
