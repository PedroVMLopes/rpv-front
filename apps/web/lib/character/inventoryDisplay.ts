import type { CharacterInventory } from "@rpv/domain";
import type { EquipmentSlotGroup, ItemEntry } from "@rpv/content";
import {
    getEquipmentSlots,
    getEquipmentSlotsByGroup,
    getItem,
    getSuggestedEquipmentSlotIds,
    isItemEquippable,
    resolveItemEquipPolicy,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { bagStackReactKey } from "@/lib/character/inventory";

export type InventoryFilterId =
    | "all"
    | "consumables"
    | "tools"
    | "quest"
    | "misc";
// Future: add "equipped" when catalog items are more robust.

export type InventoryDisplayKind = "carried" | "stowed" | "equipped" | "cosmetic";

export type InventoryDisplayRow = {
    key: string;
    slug: string;
    quantity: number;
    equipped: boolean;
    slotId?: string;
    /** When set, unequip uses multi-slot path. */
    multiEquipped?: boolean;
    /** Bag vs equipped panel semantics (Etapa 4+). */
    displayKind?: InventoryDisplayKind;
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

function equippedSlugSet(inventory: CharacterInventory): Set<string> {
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
    return equippedSlugs;
}

function bagStacksToRows(
    bag: CharacterInventory["bag"],
    equippedSlugs: Set<string>,
    includeItem: (entry: ItemEntry) => boolean,
    system: SystemKey,
    displayKind: Extract<InventoryDisplayKind, "carried" | "stowed">
): InventoryDisplayRow[] {
    return bag.flatMap((stack) => {
        if (equippedSlugs.has(stack.slug)) {
            return [];
        }

        const entry = getItem(stack.slug, system);
        if (!entry || !includeItem(entry)) {
            return [];
        }

        return [
            {
                key: bagStackReactKey(stack),
                slug: stack.slug,
                quantity: stack.quantity,
                equipped: false,
                displayKind,
            },
        ];
    });
}

/** Bag stacks with ItemEquipPolicy `carried` (passive possessions). */
export function listCarriedRows(
    inventory: CharacterInventory,
    system: SystemKey
): InventoryDisplayRow[] {
    const equippedSlugs = equippedSlugSet(inventory);
    return bagStacksToRows(
        inventory.bag,
        equippedSlugs,
        (entry) => resolveItemEquipPolicy(entry) === "carried",
        system,
        "carried"
    );
}

/** Bag stacks for equippable items not currently occupying a slot. */
export function listStowedEquippableRows(
    inventory: CharacterInventory,
    system: SystemKey
): InventoryDisplayRow[] {
    const equippedSlugs = equippedSlugSet(inventory);
    return bagStacksToRows(
        inventory.bag,
        equippedSlugs,
        (entry) => isItemEquippable(entry),
        system,
        "stowed"
    );
}

/** Bag grid rows: possessions + stowed equippable (convenience for tests / future callers). */
export function listBagDisplayRows(
    inventory: CharacterInventory,
    system: SystemKey
): InventoryDisplayRow[] {
    return [
        ...listCarriedRows(inventory, system),
        ...listStowedEquippableRows(inventory, system),
    ];
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
            if (group === "usable") {
                continue;
            }

            const slugs = inventory.equippedMulti?.[slot.id] ?? [];
            slugs.forEach((slug, index) => {
                rows.push({
                    key: `equipped-multi:${slot.id}:${index}:${slug}`,
                    slug,
                    quantity: 1,
                    equipped: true,
                    slotId: slot.id,
                    multiEquipped: true,
                    displayKind: group === "cosmetic" ? "cosmetic" : "equipped",
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
            displayKind: "equipped",
        });
    }

    return rows;
}

export function listCosmeticEquippedRows(
    inventory: CharacterInventory,
    system: SystemKey
): InventoryDisplayRow[] {
    return listEquippedRowsByGroup(inventory, system, "cosmetic");
}

export function listMechanicalEquippedRows(
    inventory: CharacterInventory,
    system: SystemKey
): InventoryDisplayRow[] {
    return [
        ...listEquippedRowsByGroup(inventory, system, "wearable"),
        ...listEquippedRowsByGroup(inventory, system, "usable"),
    ];
}

export type EquipmentColumnId = "wearable" | "usable";

/** Stowed equippable rows with policy `cosmetic` (Cosmetics panel). */
export function listStowedCosmeticRows(
    inventory: CharacterInventory,
    system: SystemKey
): InventoryDisplayRow[] {
    const equippedSlugs = equippedSlugSet(inventory);
    return bagStacksToRows(
        inventory.bag,
        equippedSlugs,
        (entry) => resolveItemEquipPolicy(entry) === "cosmetic",
        system,
        "stowed"
    );
}

/** Stowed equippable rows excluding cosmetic policy (Equipment panel). */
export function listStowedMechanicalRows(
    inventory: CharacterInventory,
    system: SystemKey
): InventoryDisplayRow[] {
    return listStowedEquippableRows(inventory, system).filter((row) => {
        const entry = getItem(row.slug, system);
        return (
            entry !== undefined &&
            resolveItemEquipPolicy(entry) !== "cosmetic"
        );
    });
}

/** Routes a mechanical stowed/equippable item to Gear vs Usable column. */
export function resolveMechanicalColumn(
    entry: ItemEntry,
    system: SystemKey
): EquipmentColumnId {
    if (resolveItemEquipPolicy(entry) === "wieldable") {
        return "usable";
    }

    const slotById = new Map(
        getEquipmentSlots(system).map((slot) => [slot.id, slot.group])
    );

    for (const slotId of getSuggestedEquipmentSlotIds(entry)) {
        const group = slotById.get(slotId);
        if (group === "usable") {
            return "usable";
        }
        if (group === "wearable") {
            return "wearable";
        }
    }

    return "wearable";
}

/** Equipment panel column: equipped group rows + stowed mechanical routed here. */
export function listEquipmentColumnRows(
    inventory: CharacterInventory,
    system: SystemKey,
    column: EquipmentColumnId
): InventoryDisplayRow[] {
    const group: EquipmentSlotGroup = column;
    const equipped = listEquippedRowsByGroup(inventory, system, group);
    const stowed = listStowedMechanicalRows(inventory, system).filter((row) => {
        const entry = getItem(row.slug, system);
        return entry !== undefined && resolveMechanicalColumn(entry, system) === column;
    });

    return [...equipped, ...stowed];
}

/** Cosmetics panel: equipped multi + stowed cosmetic. */
export function listCosmeticPanelRows(
    inventory: CharacterInventory,
    system: SystemKey
): InventoryDisplayRow[] {
    return [
        ...listCosmeticEquippedRows(inventory, system),
        ...listStowedCosmeticRows(inventory, system),
    ];
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

export function countMiscItems(
    inventory: CharacterInventory,
    system: SystemKey
): number {
    return listCarriedRows(inventory, system).reduce((total, row) => {
        const entry = getItem(row.slug, system);
        if (resolveItemFilterCategory(entry) !== "misc") {
            return total;
        }
        return total + row.quantity;
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
