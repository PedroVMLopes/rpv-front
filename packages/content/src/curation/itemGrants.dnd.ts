import type { Locale } from "@rpv/domain";
import type { Grant } from "../grant/grant.types";
import { localizeCurationEntry } from "./curationLocale";

export type ItemSystem = "dnd";

export interface ItemEntry {
    slug: string;
    system: ItemSystem;
    name: string;
    description: string;
    grants: Grant[];
    allowedSlots?: string[];
    stackable?: boolean;
}

/**
 * Hand-curated item grants. Small representative set to prove items/scrolls
 * can teach abilities; full item catalog is future work.
 */
export const dndItems: ItemEntry[] = [
    {
        slug: "scroll-of-fire-bolt",
        system: "dnd",
        name: "Scroll of Fire Bolt",
        description:
            "A scroll containing the Fire Bolt cantrip. Reading it teaches you the spell.",
        allowedSlots: ["main-hand"],
        grants: [
            {
                grantType: "spell",
                choose: 0,
                options: [{ optionType: "spell", ref: "fire-bolt" }],
            },
        ],
    },
    {
        slug: "amulet-of-vitality",
        system: "dnd",
        name: "Amulet of Vitality",
        description:
            "A warm amulet that bolsters the wearer's constitution against harm.",
        allowedSlots: ["neck"],
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
        slug: "ring-of-hardiness",
        system: "dnd",
        name: "Ring of Hardiness",
        description: "A sturdy ring that fortifies the wearer's life force.",
        allowedSlots: ["ring"],
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
        slug: "longsword",
        system: "dnd",
        name: "Longsword",
        description: "A well-balanced blade that lends strength to its wielder.",
        allowedSlots: ["main-hand"],
        stackable: false,
        grants: [
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "strength",
                amount: 1,
            },
        ],
    },
    {
        slug: "leather-armor",
        system: "dnd",
        name: "Leather Armor",
        description: "Light armor that offers modest protection without hindering movement.",
        allowedSlots: ["armor"],
        stackable: false,
        grants: [
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "armorClass",
                amount: 1,
            },
        ],
    },
    {
        slug: "shield",
        system: "dnd",
        name: "Shield",
        description: "A wooden shield that improves the bearer's defense.",
        allowedSlots: ["off-hand"],
        stackable: false,
        grants: [
            {
                grantType: "stat_modifier",
                choose: 0,
                targetStat: "armorClass",
                amount: 1,
            },
        ],
    },
];

export function isItemStackable(entry: ItemEntry): boolean {
    return entry.stackable !== false;
}

function itemsForSystem(system: ItemSystem): ItemEntry[] {
    return dndItems.filter((entry) => entry.system === system);
}

function localizeItem(entry: ItemEntry, locale?: Locale): ItemEntry {
    return localizeCurationEntry(entry, "items", locale);
}

export function getItem(
    slug: string,
    system: ItemSystem = "dnd",
    locale?: Locale
): ItemEntry | undefined {
    const entry = itemsForSystem(system).find((item) => item.slug === slug);
    if (!entry) {
        return undefined;
    }
    return localizeItem(entry, locale);
}

export function listItems(system: ItemSystem = "dnd", locale?: Locale): ItemEntry[] {
    return itemsForSystem(system).map((entry) => localizeItem(entry, locale));
}

export function getItemGrants(slug: string, system: ItemSystem = "dnd"): Grant[] {
    return getItem(slug, system)?.grants ?? [];
}
