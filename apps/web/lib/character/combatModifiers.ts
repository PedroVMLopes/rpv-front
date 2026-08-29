import type { CharacterGrant, StatKey, Stats } from "@rpv/domain";
import type { ItemEntry, SpellRollProfile } from "@rpv/content";
import { getClass, itemMatchesWeaponProficiency } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { formatModifier } from "./skillModifiers";
import { readCharacterLevel } from "./skillModifiers";
import { getSystemRules } from "./systemRules";

function proficiencyRefs(grants: CharacterGrant[]): string[] {
    return grants
        .filter((grant) => grant.kind === "proficiency")
        .map((grant) => grant.ref);
}

function hasWeaponProficiency(
    grants: CharacterGrant[],
    item: ItemEntry
): boolean {
    return itemMatchesWeaponProficiency(item, proficiencyRefs(grants));
}

function weaponHasProperty(item: Pick<ItemEntry, "weapon">, name: string): boolean {
    const needle = name.toLowerCase();
    return (
        item.weapon?.properties.some(
            (property) => property.name.toLowerCase() === needle
        ) ?? false
    );
}

function isPureRangedWeapon(item: Pick<ItemEntry, "weapon">): boolean {
    const thrown = weaponHasProperty(item, "thrown");
    return (
        weaponHasProperty(item, "ammunition") ||
        weaponHasProperty(item, "ranged") ||
        (item.weapon?.range != null && !thrown)
    );
}

function higherAbility(resolved: Stats, a: StatKey, b: StatKey): StatKey {
    return (resolved[a] ?? 10) >= (resolved[b] ?? 10) ? a : b;
}

export function weaponAttackAbility(
    item: Pick<ItemEntry, "weapon">,
    resolved: Stats
): StatKey {
    const finesse = weaponHasProperty(item, "finesse");

    if (isPureRangedWeapon(item) && !finesse) {
        return "dexterity";
    }

    if (finesse) {
        return higherAbility(resolved, "strength", "dexterity");
    }

    return "strength";
}

export function computeWeaponAttackBonus(
    grants: CharacterGrant[],
    item: ItemEntry,
    resolved: Stats,
    system: SystemKey,
    systemData: Record<string, unknown>
): number | null {
    if (!item.weapon) {
        return null;
    }

    const rules = getSystemRules(system);
    const level = readCharacterLevel(systemData);
    const ability = weaponAttackAbility(item, resolved);
    const abilityMod = rules.abilityModifier(resolved[ability] ?? 10);
    const proficient = hasWeaponProficiency(grants, item);

    return abilityMod + (proficient ? rules.proficiencyBonus(level) : 0);
}

export function computeWeaponDamagePreview(
    item: Pick<ItemEntry, "weapon">,
    resolved: Stats,
    system: SystemKey
): string | null {
    if (!item.weapon) {
        return null;
    }

    const rules = getSystemRules(system);
    const ability = weaponAttackAbility(item, resolved);
    const abilityMod = rules.abilityModifier(resolved[ability] ?? 10);
    const flat =
        abilityMod === 0
            ? ""
            : abilityMod > 0
              ? `+${abilityMod}`
              : String(abilityMod);

    return `${item.weapon.damageDice}${flat} ${item.weapon.damageType.key}`.trim();
}

export function computeWeaponDamageFlat(
    item: Pick<ItemEntry, "weapon">,
    resolved: Stats,
    system: SystemKey
): number {
    if (!item.weapon) {
        return 0;
    }

    const rules = getSystemRules(system);
    const ability = weaponAttackAbility(item, resolved);

    return rules.abilityModifier(resolved[ability] ?? 10);
}

export function computeNaturalWeaponAttackBonus(
    weapon: {
        attackAbility: StatKey;
        alwaysProficient: boolean;
    },
    resolved: Stats,
    system: SystemKey,
    systemData: Record<string, unknown>
): number {
    const rules = getSystemRules(system);
    const level = readCharacterLevel(systemData);
    const abilityMod = rules.abilityModifier(
        resolved[weapon.attackAbility] ?? 10
    );
    const proficiency = weapon.alwaysProficient
        ? rules.proficiencyBonus(level)
        : 0;

    return abilityMod + proficiency;
}

export function computeNaturalWeaponAbilityMod(
    weapon: { attackAbility: StatKey },
    resolved: Stats,
    system: SystemKey
): number {
    const rules = getSystemRules(system);
    return rules.abilityModifier(resolved[weapon.attackAbility] ?? 10);
}

export function computeNaturalWeaponDamageTotal(
    weapon: { attackAbility: StatKey; damageFlatBase: number },
    resolved: Stats,
    system: SystemKey
): number {
    const abilityMod = computeNaturalWeaponAbilityMod(weapon, resolved, system);
    return Math.max(0, weapon.damageFlatBase + abilityMod);
}

export function computeNaturalWeaponDamagePreview(
    weapon: { attackAbility: StatKey; damageFlatBase: number; damageType: string },
    resolved: Stats,
    system: SystemKey
): string {
    const abilityMod = computeNaturalWeaponAbilityMod(weapon, resolved, system);
    const total = Math.max(0, weapon.damageFlatBase + abilityMod);

    if (total === 0) {
        return `0 ${weapon.damageType}`;
    }

    const flat =
        abilityMod === 0
            ? ""
            : abilityMod > 0
              ? `+${abilityMod}`
              : String(abilityMod);

    return `${weapon.damageFlatBase}${flat} ${weapon.damageType}`.trim();
}

function readSpellcastingAbility(
    system: SystemKey,
    systemData: Record<string, unknown>
): StatKey | null {
    const classSlug =
        typeof systemData.characterClass === "string"
            ? systemData.characterClass
            : undefined;

    if (!classSlug) {
        return null;
    }

    return getClass(classSlug)?.spellcastingAbility ?? null;
}

export function computeSpellAttackBonus(
    resolved: Stats,
    system: SystemKey,
    systemData: Record<string, unknown>
): number | null {
    const spellcastingAbility = readSpellcastingAbility(system, systemData);

    if (!spellcastingAbility) {
        return null;
    }

    const rules = getSystemRules(system);
    const level = readCharacterLevel(systemData);
    const abilityMod = rules.abilityModifier(
        resolved[spellcastingAbility] ?? 10
    );

    return abilityMod + rules.proficiencyBonus(level);
}

export function computeSpellSaveDc(
    resolved: Stats,
    system: SystemKey,
    systemData: Record<string, unknown>
): number | null {
    const spellcastingAbility = readSpellcastingAbility(system, systemData);

    if (!spellcastingAbility) {
        return null;
    }

    const rules = getSystemRules(system);
    const level = readCharacterLevel(systemData);
    const abilityMod = rules.abilityModifier(
        resolved[spellcastingAbility] ?? 10
    );

    return 8 + rules.proficiencyBonus(level) + abilityMod;
}

export function formatSpellAttackBonus(bonus: number | null): string | undefined {
    if (bonus === null) {
        return undefined;
    }

    return formatModifier(bonus);
}

export function formatSpellSaveDc(dc: number | null): string | undefined {
    if (dc === null) {
        return undefined;
    }

    return `DC ${dc}`;
}

export function formatWeaponToHit(bonus: number | null): string | undefined {
    if (bonus === null) {
        return undefined;
    }

    return formatModifier(bonus);
}

export type SpellCombatPreview = {
    attackBonus: string | undefined;
    attackModifier: number | null;
    saveDc: string | undefined;
    saveDcValue: number | null;
    rollProfile: SpellRollProfile | undefined;
};

export function computeSpellCombatPreview(
    rollProfile: SpellRollProfile | undefined,
    resolved: Stats,
    system: SystemKey,
    systemData: Record<string, unknown>
): SpellCombatPreview {
    const attackModifier = computeSpellAttackBonus(resolved, system, systemData);
    const saveDcValue = computeSpellSaveDc(resolved, system, systemData);

    return {
        attackBonus:
            rollProfile?.mode === "attack"
                ? formatSpellAttackBonus(attackModifier)
                : undefined,
        attackModifier:
            rollProfile?.mode === "attack" ? attackModifier : null,
        saveDc:
            rollProfile?.mode === "save"
                ? formatSpellSaveDc(saveDcValue)
                : undefined,
        saveDcValue: rollProfile?.mode === "save" ? saveDcValue : null,
        rollProfile,
    };
}
