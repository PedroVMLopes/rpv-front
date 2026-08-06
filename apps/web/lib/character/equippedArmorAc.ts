import type { CharacterInventory } from "@rpv/domain";
import { getItem, type ItemArmor, type ItemEntry } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { dndAbilityModifier } from "@/presets/dnd/math";

function isBodyArmor(armor: ItemArmor): boolean {
    return armor.category !== "shield";
}

function isShieldArmor(armor: ItemArmor): boolean {
    return armor.category === "shield";
}

function resolveBodyArmor(
    inventory: CharacterInventory,
    system: SystemKey
): ItemArmor | null {
    const armorSlotSlug = inventory.equipped?.breast ?? inventory.equipped?.armor;
    if (armorSlotSlug) {
        const item = getItem(armorSlotSlug, system);
        if (item?.armor && isBodyArmor(item.armor)) {
            return item.armor;
        }
    }

    for (const slug of Object.values(inventory.equipped ?? {})) {
        const item = getItem(slug, system);
        if (item?.armor && isBodyArmor(item.armor)) {
            return item.armor;
        }
    }

    return null;
}

function sumShieldBonuses(
    inventory: CharacterInventory,
    system: SystemKey
): number {
    let total = 0;
    for (const slug of Object.values(inventory.equipped ?? {})) {
        const item = getItem(slug, system);
        if (item?.armor && isShieldArmor(item.armor)) {
            total += item.armor.acBase;
        }
    }
    return total;
}

/**
 * D&D-style AC from equipped Open5e armor profiles:
 * body armor formula (or 10 + Dex) + shield acBase sums.
 */
export function computeEquippedArmorClass(
    inventory: CharacterInventory,
    dexterityScore: number,
    system: SystemKey
): number {
    const dexMod = dndAbilityModifier(dexterityScore);
    const body = resolveBodyArmor(inventory, system);

    const bodyAc = body
        ? body.acBase +
          (body.acAddDexmod
              ? Math.min(
                    dexMod,
                    body.acCapDexmod === null || body.acCapDexmod === undefined
                        ? Number.POSITIVE_INFINITY
                        : body.acCapDexmod
                )
              : 0)
        : 10 + dexMod;

    return bodyAc + sumShieldBonuses(inventory, system);
}

export function itemProvidesBodyArmor(entry: ItemEntry | undefined): boolean {
    return Boolean(entry?.armor && isBodyArmor(entry.armor));
}
