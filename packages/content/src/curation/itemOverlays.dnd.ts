import type { Grant } from "../grant/grant.types";
import type { ItemEntry } from "../item/item.types";

/**
 * RPV-only items and SRD overrides merged on top of the Open5e catalog.
 * Extra slugs use the `rpv_` namespace. Overrides keyed by catalog slug.
 */

export const rpvExtraItems: ItemEntry[] = [
    {
        slug: "rpv_scroll-of-fire-bolt",
        system: "dnd",
        name: "Scroll of Fire Bolt",
        description:
            "A scroll containing the Fire Bolt cantrip. Reading it teaches you the spell.",
        category: { name: "Scroll", key: "scroll" },
        weapon: null,
        armor: null,
        weight: null,
        weightUnit: null,
        cost: null,
        stackable: true,
        equipPolicy: "wieldable",
        grants: [
            {
                grantType: "spell",
                choose: 0,
                options: [{ optionType: "spell", ref: "fire-bolt" }],
            },
        ],
    },
    {
        slug: "rpv_amulet-of-vitality",
        system: "dnd",
        name: "Amulet of Vitality",
        description:
            "A warm amulet that bolsters the wearer's constitution against harm.",
        category: { name: "Wondrous Item", key: "wondrous-item" },
        weapon: null,
        armor: null,
        weight: null,
        weightUnit: null,
        cost: null,
        stackable: false,
        grants: [
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "hitPoints",
                amount: 5,
            },
        ],
    },
    {
        slug: "rpv_ring-of-hardiness",
        system: "dnd",
        name: "Ring of Hardiness",
        description: "A sturdy ring that fortifies the wearer's life force.",
        category: { name: "Ring", key: "ring" },
        weapon: null,
        armor: null,
        weight: null,
        weightUnit: null,
        cost: null,
        stackable: false,
        grants: [
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "hitPoints",
                amount: 10,
            },
        ],
    },
    {
        slug: "rpv_belt-of-constitution",
        system: "dnd",
        name: "Belt of Constitution",
        description:
            "A thick belt that hardens the wearer's body against hardship.",
        category: { name: "Wondrous Item", key: "wondrous-item" },
        weapon: null,
        armor: null,
        weight: "1.000",
        weightUnit: "lb",
        cost: null,
        stackable: false,
        grants: [
            {
                grantType: "ability_score",
                choose: 0,
                targetStat: "constitution",
                amount: 2,
            },
        ],
    },
    {
        slug: "rpv_pilot-test-dagger",
        system: "dnd",
        name: "Pilot Test Dagger",
        description: "Fixture item for inventory_item choice tests.",
        category: { name: "Weapon", key: "weapon" },
        weapon: {
            key: "rpv_pilot-test-dagger",
            name: "Pilot Test Dagger",
            damageDice: "1d4",
            damageType: { name: "Piercing", key: "piercing" },
            properties: [],
            isSimple: true,
            isMartial: false,
            isImprovised: false,
            distanceUnit: "feet",
        },
        armor: null,
        weight: null,
        weightUnit: null,
        cost: null,
        stackable: false,
        grants: [],
    },
    {
        slug: "rpv_pilot-test-pack-a",
        system: "dnd",
        name: "Pilot Test Pack A",
        description: "Fixture pack item for inventory_item choice tests.",
        category: { name: "Equipment Pack", key: "equipment-pack" },
        weapon: null,
        armor: null,
        weight: null,
        weightUnit: null,
        cost: null,
        stackable: true,
        grants: [],
    },
    {
        slug: "rpv_pilot-test-starter-kit",
        system: "dnd",
        name: "Pilot Test Starter Kit",
        description: "Fixture bundle reference for inventory_bundle tests.",
        category: { name: "Equipment Pack", key: "equipment-pack" },
        weapon: null,
        armor: null,
        weight: null,
        weightUnit: null,
        cost: null,
        stackable: true,
        grants: [],
    },
];

/**
 * SRD 2014 shield item has category shield but null nested armor in Open5e.
 * Overlay supplies the +2 AC profile so resolution stays data-driven.
 */
export const itemEntryOverrides: Record<string, Partial<ItemEntry>> = {
    srd_shield: {
        stackable: false,
        armor: {
            key: "srd_shield",
            name: "Shield",
            category: "shield",
            acBase: 2,
            acDisplay: "+2",
            acAddDexmod: false,
            acCapDexmod: null,
            grantsStealthDisadvantage: false,
            strengthScoreRequired: null,
        },
    },
};

export function mergeItemCatalog(catalogItems: ItemEntry[]): ItemEntry[] {
    const bySlug = new Map<string, ItemEntry>();

    for (const entry of catalogItems) {
        const override = itemEntryOverrides[entry.slug];
        bySlug.set(
            entry.slug,
            override ? { ...entry, ...override, grants: override.grants ?? entry.grants } : entry
        );
    }

    for (const extra of rpvExtraItems) {
        bySlug.set(extra.slug, extra);
    }

    return Array.from(bySlug.values()).sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getItemGrantsFromEntry(entry: ItemEntry | undefined): Grant[] {
    return entry?.grants ?? [];
}
