import type { Grant } from "../grant/grant.types";

export interface ItemEntry {
    slug: string;
    name: string;
    description: string;
    grants: Grant[];
}

/**
 * Hand-curated item grants. Small representative set to prove items/scrolls
 * can teach abilities; full item catalog is future work.
 */
export const dndItems: ItemEntry[] = [
    {
        slug: "scroll-of-fire-bolt",
        name: "Scroll of Fire Bolt",
        description:
            "A scroll containing the Fire Bolt cantrip. Reading it teaches you the spell.",
        grants: [
            {
                grantType: "spell",
                choose: 0,
                options: [{ optionType: "spell", ref: "fire-bolt" }],
            },
        ],
    },
];

export function getItem(slug: string): ItemEntry | undefined {
    return dndItems.find((entry) => entry.slug === slug);
}

export function listItems(): ItemEntry[] {
    return dndItems;
}

export function getItemGrants(slug: string): Grant[] {
    return getItem(slug)?.grants ?? [];
}
