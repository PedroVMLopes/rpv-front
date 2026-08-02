import type { CharacterInventory } from "@rpv/domain";
import type { ItemEntry } from "@rpv/content";
import { getItem } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { bagStackReactKey } from "@/lib/character/inventory";

export type InventoryFilterId =
    | "all"
    | "consumables"
    | "tools"
    | "quest"
    | "misc";
// Future: add "equipped" when catalog items are more robust.

export type InventoryDisplayRow = {
    key: string;
    slug: string;
    quantity: number;
    equipped: boolean;
    slotId?: string;
};

function categoryKey(entry: ItemEntry | undefined): string | undefined {
    return entry?.category?.key;
}

function isMiscItem(entry: ItemEntry | undefined): boolean {
    if (!entry) {
        return false;
    }
    const key = categoryKey(entry);
    return key === "misc" || key === "equipment-pack" || key === "adventuring-gear";
}

export function resolveItemFilterCategory(
    entry: ItemEntry | undefined
): Exclude<InventoryFilterId, "all"> {
    if (!entry) {
        return "misc";
    }

    const key = categoryKey(entry);

    if (key === "consumable" || key === "ammunition" || key === "potion") {
        return "consumables";
    }

    if (key === "tools" || key === "tool") {
        return "tools";
    }

    if (
        key === "misc" ||
        key === "equipment-pack" ||
        key === "adventuring-gear" ||
        key === "pack"
    ) {
        return "misc";
    }

    return "misc";
}

export function listInventoryRows(
    inventory: CharacterInventory,
    system: SystemKey
): InventoryDisplayRow[] {
    const rows: InventoryDisplayRow[] = inventory.bag.map((stack) => ({
        key: bagStackReactKey(stack),
        slug: stack.slug,
        quantity: stack.quantity,
        equipped: false,
    }));

    for (const [slotId, slug] of Object.entries(inventory.equipped)) {
        if (!slug) {
            continue;
        }
        rows.push({
            key: `equipped:${slotId}`,
            slug,
            quantity: 1,
            equipped: true,
            slotId,
        });
    }

    return rows;
}

export function countMiscItems(
    bag: CharacterInventory["bag"],
    system: SystemKey
): number {
    return bag.reduce((total, stack) => {
        const entry = getItem(stack.slug, system);
        if (!isMiscItem(entry)) {
            return total;
        }
        return total + stack.quantity;
    }, 0);
}

export function filterInventoryRows(
    rows: InventoryDisplayRow[],
    filter: InventoryFilterId,
    system: SystemKey
): InventoryDisplayRow[] {
    if (filter === "all") {
        return rows;
    }

    return rows.filter((row) => {
        const entry = getItem(row.slug, system);
        return resolveItemFilterCategory(entry) === filter;
    });
}
