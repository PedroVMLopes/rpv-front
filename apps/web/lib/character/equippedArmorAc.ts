import type { CharacterInventory, Stats } from "@rpv/domain";
import {
    getItem,
    type Grant,
    type ItemArmor,
    type ItemEntry,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { getSystemRules } from "./systemRules";

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

export function evaluateArmorClassFormula(
    grant: Grant,
    stats: Stats,
    system: SystemKey
): number {
    const rules = getSystemRules(system);
    const base = grant.amount ?? 10;
    const bonus = (grant.options ?? []).reduce((sum, option) => {
        if (option.optionType !== "stat") {
            return sum;
        }
        return sum + rules.abilityModifier(stats[option.ref] ?? 10);
    }, 0);

    return base + bonus;
}

function unarmoredBodyAc(
    dexterityScore: number,
    system: SystemKey,
    stats?: Stats,
    formulaGrants?: Grant[]
): number {
    const rules = getSystemRules(system);
    const formulas = (formulaGrants ?? []).filter(
        (grant) => grant.grantType === "armor_class_formula"
    );

    if (stats && formulas.length > 0) {
        return Math.max(
            ...formulas.map((grant) =>
                evaluateArmorClassFormula(grant, stats, system)
            )
        );
    }

    return 10 + rules.abilityModifier(dexterityScore);
}

export type EquippedArmorClassOptions = {
    stats?: Stats;
    formulaGrants?: Grant[];
};

/**
 * AC from equipped armor profiles, or an `armor_class_formula` grant when
 * no body armor is worn. Shield bonuses still apply on top.
 */
export function computeEquippedArmorClass(
    inventory: CharacterInventory,
    dexterityScore: number,
    system: SystemKey,
    options?: EquippedArmorClassOptions
): number {
    const body = resolveBodyArmor(inventory, system);

    const bodyAc = body
        ? body.acBase +
          (body.acAddDexmod
              ? Math.min(
                    getSystemRules(system).abilityModifier(dexterityScore),
                    body.acCapDexmod === null || body.acCapDexmod === undefined
                        ? Number.POSITIVE_INFINITY
                        : body.acCapDexmod
                )
              : 0)
        : unarmoredBodyAc(
              dexterityScore,
              system,
              options?.stats,
              options?.formulaGrants
          );

    return bodyAc + sumShieldBonuses(inventory, system);
}

export function itemProvidesBodyArmor(entry: ItemEntry | undefined): boolean {
    return Boolean(entry?.armor && isBodyArmor(entry.armor));
}
