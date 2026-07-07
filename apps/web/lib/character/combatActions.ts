import type { CharacterGrant, Locale } from "@rpv/domain";
import { getAbilityFeatureDescription, getItem } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { contentRepo } from "@/lib/content/contentRepository";
import type { CharacterSelections } from "./storedCharacter";

export const WEAPON_SLOTS = ["main-hand", "off-hand"] as const;
export type WeaponSlotId = (typeof WEAPON_SLOTS)[number];

export type WeaponAction = {
    id: string;
    name: string;
    slotId: WeaponSlotId;
    description?: string;
    toHit?: string;
    damage?: string;
};

export type SpellAction = {
    id: string;
    name: string;
    levelInt: number | null;
    description?: string;
    attackBonus?: string;
    saveDc?: string;
};

export type FeatureAction = {
    id: string;
    name: string;
    description?: string;
};

export function listEquippedWeaponActions(
    selections: CharacterSelections,
    system: SystemKey,
    locale?: Locale
): WeaponAction[] {
    const equipped = selections.inventory?.equipped ?? {};
    const result: WeaponAction[] = [];

    for (const slotId of WEAPON_SLOTS) {
        const slug = equipped[slotId];
        if (!slug) {
            continue;
        }

        const item = getItem(slug, system, locale);
        const entry: WeaponAction = {
            id: `${slotId}-${slug}`,
            name: item?.name ?? slug,
            slotId,
            description: item?.description,
        };

        const rich = item as
            | (typeof item & { toHit?: string; damageDice?: string })
            | undefined;
        if (rich?.toHit) {
            entry.toHit = rich.toHit;
        }
        if (rich?.damageDice) {
            entry.damage = rich.damageDice;
        }

        result.push(entry);
    }

    return result;
}

export function listSpellActions(
    grants: CharacterGrant[],
    locale?: Locale
): { cantrips: SpellAction[]; spells: SpellAction[] } {
    const cantrips: SpellAction[] = [];
    const spells: SpellAction[] = [];

    for (const grant of grants) {
        if (grant.kind !== "spell") {
            continue;
        }

        const spell = contentRepo().getSpell(grant.ref, locale);
        const entry: SpellAction = {
            id: grant.id,
            name: grant.name ?? spell?.name ?? grant.ref,
            levelInt: spell?.levelInt ?? null,
            description: spell?.description,
        };

        const rich = spell as
            | (typeof spell & { attackBonus?: string; saveDc?: string })
            | undefined;
        if (rich?.attackBonus) {
            entry.attackBonus = rich.attackBonus;
        }
        if (rich?.saveDc) {
            entry.saveDc = rich.saveDc;
        }

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
            const name = grant.name ?? grant.ref;
            return {
                id: grant.id,
                name,
                description: getAbilityFeatureDescription(
                    name,
                    grant.source,
                    locale
                ),
            };
        });
}
