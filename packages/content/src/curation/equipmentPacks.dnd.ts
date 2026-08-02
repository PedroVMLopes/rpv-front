import type { InventoryGrantOption } from "../grant/grant.types";

export type EquipmentPackBundle = Extract<
    InventoryGrantOption,
    { optionType: "inventory_bundle" }
>;

/**
 * SRD 2014 equipment packs as inventory_bundle options.
 * Choosing a pack grants every listed component as separate bag stacks
 * (not a single opaque pack ItemEntry). Add more packs here for future classes.
 */
export const dungeoneersPackBundle: EquipmentPackBundle = {
    optionType: "inventory_bundle",
    label: "Dungeoneer's Pack",
    items: [
        { ref: "srd_backpack", amount: 1 },
        { ref: "srd_crowbar", amount: 1 },
        { ref: "srd_hammer", amount: 1 },
        { ref: "srd_piton", amount: 10 },
        { ref: "srd_torch", amount: 10 },
        { ref: "srd_tinderbox", amount: 1 },
        { ref: "srd_rations-1-day", amount: 10 },
        { ref: "srd_waterskin", amount: 1 },
        { ref: "srd_rope-hempen-50-feet", amount: 1 },
    ],
};

export const explorersPackBundle: EquipmentPackBundle = {
    optionType: "inventory_bundle",
    label: "Explorer's Pack",
    items: [
        { ref: "srd_backpack", amount: 1 },
        { ref: "srd_bedroll", amount: 1 },
        { ref: "srd_mess-kit", amount: 1 },
        { ref: "srd_tinderbox", amount: 1 },
        { ref: "srd_torch", amount: 10 },
        { ref: "srd_rations-1-day", amount: 10 },
        { ref: "srd_waterskin", amount: 1 },
        { ref: "srd_rope-hempen-50-feet", amount: 1 },
    ],
};

/** Authoring keys — not ItemEntry slugs. */
export const dndEquipmentPackBundles = {
    "dungeoneers-pack": dungeoneersPackBundle,
    "explorers-pack": explorersPackBundle,
} as const;

export type DndEquipmentPackKey = keyof typeof dndEquipmentPackBundles;
