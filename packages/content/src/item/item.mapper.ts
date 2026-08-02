import type { Open5eV2Armor, Open5eV2Item, Open5eV2Weapon } from "../open5e/open5e.types";
import type { ItemArmor, ItemEntry, ItemWeapon } from "./item.types";

function mapWeapon(weapon: Open5eV2Weapon): ItemWeapon {
    return {
        key: weapon.key,
        name: weapon.name,
        damageDice: weapon.damage_dice,
        damageType: {
            name: weapon.damage_type.name,
            key: weapon.damage_type.key,
        },
        properties: (weapon.properties ?? []).map((assignment) => ({
            name: assignment.property.name,
            type: assignment.property.type,
            description: assignment.property.desc,
            detail: assignment.detail,
        })),
        isSimple: weapon.is_simple,
        isMartial: weapon.is_martial,
        isImprovised: weapon.is_improvised,
        distanceUnit: weapon.distance_unit ?? null,
        range: weapon.range ?? null,
        longRange: weapon.long_range ?? null,
    };
}

function mapArmor(armor: Open5eV2Armor): ItemArmor {
    return {
        key: armor.key,
        name: armor.name,
        category: armor.category,
        acBase: armor.ac_base,
        acDisplay: armor.ac_display,
        acAddDexmod: armor.ac_add_dexmod,
        acCapDexmod: armor.ac_cap_dexmod,
        grantsStealthDisadvantage: armor.grants_stealth_disadvantage,
        strengthScoreRequired: armor.strength_score_required,
    };
}

/**
 * Maps an Open5e v2 item into the catalog `ItemEntry`.
 * Canonical id: `slug === raw.key` (no prefix stripping).
 */
export function mapOpen5eItem(raw: Open5eV2Item): ItemEntry {
    const weapon = raw.weapon ? mapWeapon(raw.weapon) : null;
    const armor = raw.armor ? mapArmor(raw.armor) : null;

    return {
        slug: raw.key,
        system: "dnd",
        name: raw.name,
        description: raw.desc ?? "",
        category: {
            name: raw.category.name,
            key: raw.category.key,
        },
        weapon,
        armor,
        weight: raw.weight,
        weightUnit: raw.weight_unit,
        cost: raw.cost,
        grants: [],
        stackable: weapon === null && armor === null,
    };
}
