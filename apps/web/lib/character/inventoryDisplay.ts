import type { CharacterInventory } from "@rpv/domain";
import type { EquipmentSlotGroup, ItemEntry } from "@rpv/content";
import { getEquipmentSlotsByGroup, getItem } from "@rpv/content";
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
    /** When set, unequip uses multi-slot path. */
    multiEquipped?: boolean;
};

export function formatInventoryItemTitle(
    name: string,
    quantity: number
): string {
    if (quantity === 1) {
        return name;
    }
    return `${name} (${quantity})`;
}

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
    const equippedSlugs = new Set<string>();
    for (const slug of Object.values(inventory.equipped)) {
        if (slug) {
            equippedSlugs.add(slug);
        }
    }
    for (const slugs of Object.values(inventory.equippedMulti ?? {})) {
        for (const slug of slugs) {
            equippedSlugs.add(slug);
        }
    }

    // Bag remainder for an equipped slug is shown on the equipped card (owned
    // total). Listing both would duplicate the item in the bag grid.
    const rows: InventoryDisplayRow[] = inventory.bag
        .filter((stack) => !equippedSlugs.has(stack.slug))
        .map((stack) => ({
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

    for (const [slotId, slugs] of Object.entries(inventory.equippedMulti ?? {})) {
        slugs.forEach((slug, index) => {
            rows.push({
                key: `equipped-multi:${slotId}:${index}:${slug}`,
                slug,
                quantity: 1,
                equipped: true,
                slotId,
                multiEquipped: true,
            });
        });
    }

    return rows;
}

/** Filled equipped slots only, ordered by the system's slot list for the group. */
export function listEquippedRowsByGroup(
    inventory: CharacterInventory,
    system: SystemKey,
    group: EquipmentSlotGroup
): InventoryDisplayRow[] {
    const rows: InventoryDisplayRow[] = [];

    for (const slot of getEquipmentSlotsByGroup(system, group)) {
        if (slot.multi) {
            const slugs = inventory.equippedMulti?.[slot.id] ?? [];
            slugs.forEach((slug, index) => {
                rows.push({
                    key: `equipped-multi:${slot.id}:${index}:${slug}`,
                    slug,
                    quantity: 1,
                    equipped: true,
                    slotId: slot.id,
                    multiEquipped: true,
                });
            });
            continue;
        }

        const slug = inventory.equipped[slot.id];
        if (!slug) {
            continue;
        }
        rows.push({
            key: `equipped:${slot.id}`,
            slug,
            quantity: 1,
            equipped: true,
            slotId: slot.id,
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
