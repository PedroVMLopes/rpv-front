import type { CharacterGrant, Locale, ModifierSource, Stats } from "@rpv/domain";
import {
    getAbilityFeatureDescription,
    getAbilityFeatureName,
    getItem,
    getNaturalWeapons,
    getSpellRollProfile,
    type SpellRollProfile,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { contentRepo } from "@/lib/content/contentRepository";
import type { CharacterSelections, StoredCharacter } from "./storedCharacter";
import {
    computeNaturalWeaponAbilityMod,
    computeNaturalWeaponAttackBonus,
    computeNaturalWeaponDamagePreview,
    computeSpellCombatPreview,
    computeWeaponAttackBonus,
    computeWeaponDamageFlat,
    computeWeaponDamagePreview,
    formatWeaponToHit,
} from "./combatModifiers";
import { buildSpellcastingSystemData } from "./spellcastingContext";
import { filterCastableSpellGrants } from "./castableSpells";
import { computePreparedSpellQuotaForStored } from "./preparedSpellQuota";

export const WEAPON_SLOTS = [
    "melee-main",
    "melee-off",
    "ranged-main",
    "ranged-off",
] as const;
export type WeaponSlotId = (typeof WEAPON_SLOTS)[number];
export const NATURAL_WEAPON_SLOT = "natural" as const;
export type WeaponActionSlotId = WeaponSlotId | typeof NATURAL_WEAPON_SLOT;

export type WeaponAction = {
    id: string;
    slug: string;
    name: string;
    slotId: WeaponActionSlotId;
    description?: string;
    toHit?: string;
    damage?: string;
    attackModifier: number | null;
    damageDice?: string;
    damageFlat?: number;
    damageBase?: number;
    damageType?: string;
};

export type SpellAction = {
    id: string;
    slug: string;
    name: string;
    levelInt: number | null;
    description?: string;
    attackBonus?: string;
    saveDc?: string;
    attackModifier: number | null;
    saveDcValue: number | null;
    rollProfile?: SpellRollProfile;
    source?: ModifierSource;
};

export type FeatureAction = {
    id: string;
    name: string;
    description?: string;
};

type CombatActionContext = {
    grants: CharacterGrant[];
    selections: CharacterSelections;
    system: SystemKey;
    systemData: Record<string, unknown>;
    resolved: Stats;
    locale?: Locale;
};

function toCombatContext(
    stored: StoredCharacter,
    resolved: Stats,
    locale?: Locale
): CombatActionContext {
    return {
        grants: stored.grants ?? [],
        selections: stored.selections,
        system: stored.system,
        systemData: stored.systemData,
        resolved,
        locale,
    };
}

function buildWeaponActionFromContext(
    context: CombatActionContext,
    slotId: WeaponSlotId,
    slug: string
): WeaponAction {
    const item = getItem(slug, context.system, context.locale);
    const attackModifier = item
        ? computeWeaponAttackBonus(
              context.grants,
              item,
              context.resolved,
              context.system,
              context.systemData
          )
        : null;
    const damagePreview = item
        ? computeWeaponDamagePreview(item, context.resolved, context.system)
        : null;

    return {
        id: `${slotId}-${slug}`,
        slug,
        name: item?.name ?? slug,
        slotId,
        description: item?.description,
        toHit: formatWeaponToHit(attackModifier),
        damage: damagePreview ?? undefined,
        attackModifier,
        damageDice: item?.weapon?.damageDice,
        damageFlat: item
            ? computeWeaponDamageFlat(item, context.resolved, context.system)
            : undefined,
        damageType: item?.weapon?.damageType.key,
    };
}

export function isWeaponSlotId(slotId: string): slotId is WeaponSlotId {
    return (WEAPON_SLOTS as readonly string[]).includes(slotId);
}

/** Build a weapon action for an equipped hand slot when stats are available. */
export function buildWeaponActionForEquippedSlot(
    stored: StoredCharacter,
    resolved: Stats,
    slotId: WeaponSlotId,
    slug: string,
    locale?: Locale
): WeaponAction {
    return buildWeaponActionFromContext(
        toCombatContext(stored, resolved, locale),
        slotId,
        slug
    );
}

export function listEquippedWeaponActions(
    stored: StoredCharacter,
    resolved: Stats,
    locale?: Locale
): WeaponAction[];
export function listEquippedWeaponActions(
    selections: CharacterSelections,
    system: SystemKey,
    locale?: Locale
): WeaponAction[];
export function listEquippedWeaponActions(
    storedOrSelections: StoredCharacter | CharacterSelections,
    resolvedOrSystem: Stats | SystemKey,
    locale?: Locale
): WeaponAction[] {
    const context =
        "grants" in storedOrSelections
            ? toCombatContext(
                  storedOrSelections,
                  resolvedOrSystem as Stats,
                  locale
              )
            : {
                  grants: [] as CharacterGrant[],
                  selections: storedOrSelections,
                  system: resolvedOrSystem as SystemKey,
                  systemData: {},
                  resolved: {
                      strength: 10,
                      dexterity: 10,
                      constitution: 10,
                      intelligence: 10,
                      wisdom: 10,
                      charisma: 10,
                      armorClass: 10,
                      hitPoints: 1,
                  },
                  locale,
              };

    const equipped = context.selections.inventory?.equipped ?? {};
    const result: WeaponAction[] = [];

    for (const slotId of WEAPON_SLOTS) {
        const slug = equipped[slotId];
        if (!slug) {
            continue;
        }

        result.push(buildWeaponActionFromContext(context, slotId, slug));
    }

    return result;
}

export function listNaturalWeaponActions(
    stored: StoredCharacter,
    resolved: Stats,
    locale?: Locale
): WeaponAction[] {
    const context = toCombatContext(stored, resolved, locale);

    return getNaturalWeapons(context.system, context.locale).map((weapon) => {
        const attackModifier = computeNaturalWeaponAttackBonus(
            weapon,
            context.resolved,
            context.system,
            context.systemData
        );
        const abilityMod = computeNaturalWeaponAbilityMod(
            weapon,
            context.resolved,
            context.system
        );

        return {
            id: `${NATURAL_WEAPON_SLOT}-${weapon.slug}`,
            slug: weapon.slug,
            name: weapon.name,
            slotId: NATURAL_WEAPON_SLOT,
            description: weapon.description,
            toHit: formatWeaponToHit(attackModifier),
            damage: computeNaturalWeaponDamagePreview(
                weapon,
                context.resolved,
                context.system
            ),
            attackModifier,
            damageBase: weapon.damageFlatBase,
            damageFlat: abilityMod,
            damageType: weapon.damageType,
        };
    });
}

export function listSpellActions(
    stored: StoredCharacter,
    resolved: Stats,
    locale?: Locale
): { cantrips: SpellAction[]; spells: SpellAction[] };
export function listSpellActions(
    grants: CharacterGrant[],
    locale?: Locale
): { cantrips: SpellAction[]; spells: SpellAction[] };
export function listSpellActions(
    storedOrGrants: StoredCharacter | CharacterGrant[],
    resolvedOrLocale?: Stats | Locale,
    locale?: Locale
): { cantrips: SpellAction[]; spells: SpellAction[] } {
    const isStored = "grants" in storedOrGrants;
    const rawGrants = isStored ? storedOrGrants.grants ?? [] : storedOrGrants;
    const resolved = isStored ? (resolvedOrLocale as Stats) : undefined;
    const contentLocale = isStored
        ? locale
        : (resolvedOrLocale as Locale | undefined);
    const system = isStored ? storedOrGrants.system : "dnd";
    const spellcastingSystemData = isStored
        ? buildSpellcastingSystemData(storedOrGrants)
        : {};

    const grants = isStored
        ? filterCastableSpellGrants({
              grants: rawGrants,
              characterClass:
                  storedOrGrants.selections.characterClass ??
                  (typeof storedOrGrants.systemData.characterClass === "string"
                      ? storedOrGrants.systemData.characterClass
                      : undefined),
              preparedSpells: storedOrGrants.selections.choices.preparedSpells,
              preparedQuota:
                  computePreparedSpellQuotaForStored(storedOrGrants),
              system,
              locale: contentLocale,
          })
        : rawGrants;

    const cantrips: SpellAction[] = [];
    const spells: SpellAction[] = [];

    for (const grant of grants) {
        if (grant.kind !== "spell") {
            continue;
        }

        const spell = contentRepo(system).getSpell(grant.ref, contentLocale);
        const rollProfile = getSpellRollProfile(grant.ref);
        const combatPreview =
            resolved && isStored
                ? computeSpellCombatPreview(
                      rollProfile,
                      resolved,
                      system,
                      spellcastingSystemData
                  )
                : {
                      attackBonus: undefined,
                      attackModifier: null,
                      saveDc: undefined,
                      saveDcValue: null,
                      rollProfile,
                  };

        const entry: SpellAction = {
            id: grant.id,
            slug: grant.ref,
            name: grant.name ?? spell?.name ?? grant.ref,
            levelInt: spell?.levelInt ?? null,
            description: spell?.description,
            attackBonus: combatPreview.attackBonus,
            saveDc: combatPreview.saveDc,
            attackModifier: combatPreview.attackModifier,
            saveDcValue: combatPreview.saveDcValue,
            rollProfile: combatPreview.rollProfile,
            source: grant.source,
        };

        if (entry.levelInt === 0) {
            cantrips.push(entry);
        } else {
            spells.push(entry);
        }
    }

    return { cantrips, spells };
}

export function listFeatureActions(
    grants: CharacterGrant[],
    locale?: Locale
): FeatureAction[] {
    return grants
        .filter((grant) => grant.kind === "ability")
        .map((grant) => {
            const englishName = grant.name ?? grant.ref;
            return {
                id: grant.id,
                name: getAbilityFeatureName(englishName, locale),
                description: getAbilityFeatureDescription(
                    englishName,
                    grant.source,
                    locale
                ),
            };
        });
}
