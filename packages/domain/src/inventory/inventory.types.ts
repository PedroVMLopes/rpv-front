export type ItemStack = {
    slug: string;
    quantity: number;
    /** Set when stack comes from build-time grant materialization. */
    provenance?: string;
};

export type CharacterInventory = {
    bag: ItemStack[];
    /** Single-item equipment slots (slotId → slug). Feeds grants/AC/combat. */
    equipped: Record<string, string>;
    /** Multi-item slots (slotId → slugs). Roleplay/cosmetic; does not feed grants. */
    equippedMulti: Record<string, string[]>;
};

export function emptyInventory(): CharacterInventory {
    return { bag: [], equipped: {}, equippedMulti: {} };
}
