import type { ItemEntry } from "./item.types";

export type ArmorProficiencyRef =
    | "light-armor"
    | "medium-armor"
    | "heavy-armor"
    | "shields";

/** Proficiency ref required to wear this armor or shield, if any. */
export function armorProficiencyRefForItem(
    item: ItemEntry
): ArmorProficiencyRef | null {
    if (
        item.category?.key === "shield" ||
        item.armor?.category === "shield"
    ) {
        return "shields";
    }

    const category = item.armor?.category?.toLowerCase();
    if (category === "light") {
        return "light-armor";
    }
    if (category === "medium") {
        return "medium-armor";
    }
    if (category === "heavy") {
        return "heavy-armor";
    }

    return null;
}

export function characterIsProficientWithArmor(
    item: ItemEntry,
    refs: Iterable<string>
): boolean {
    const needed = armorProficiencyRefForItem(item);
    if (!needed) {
        return true;
    }

    return new Set(refs).has(needed);
}
