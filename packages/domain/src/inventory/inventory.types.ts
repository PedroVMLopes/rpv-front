export type ItemStack = { slug: string; quantity: number };

export type CharacterInventory = {
    bag: ItemStack[];
    equipped: Record<string, string>;
};

export function emptyInventory(): CharacterInventory {
    return { bag: [], equipped: {} };
}
