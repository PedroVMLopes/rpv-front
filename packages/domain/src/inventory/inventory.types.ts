export type ItemStack = {
    slug: string;
    quantity: number;
    /** Set when stack comes from build-time grant materialization. */
    provenance?: string;
};

export type CharacterInventory = {
    bag: ItemStack[];
    equipped: Record<string, string>;
};

export function emptyInventory(): CharacterInventory {
    return { bag: [], equipped: {} };
}
