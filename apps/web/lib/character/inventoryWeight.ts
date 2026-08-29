import type { CharacterInventory } from "@rpv/domain";
import { getItem } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { getSystemRules } from "./systemRules";

export function parseItemWeight(raw: string | null | undefined): number {
    if (!raw) {
        return 0;
    }

    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function addQuantity(
    quantities: Map<string, number>,
    slug: string,
    amount: number
) {
    quantities.set(slug, (quantities.get(slug) ?? 0) + amount);
}

/** Bag remainder plus equipped units (post-sanitize inventory). */
export function listCarriedQuantities(
    inventory: CharacterInventory | undefined
): Map<string, number> {
    const quantities = new Map<string, number>();
    if (!inventory) {
        return quantities;
    }

    for (const stack of inventory.bag) {
        addQuantity(quantities, stack.slug, stack.quantity);
    }

    for (const slug of Object.values(inventory.equipped)) {
        if (slug) {
            addQuantity(quantities, slug, 1);
        }
    }

    for (const slugs of Object.values(inventory.equippedMulti ?? {})) {
        for (const slug of slugs) {
            addQuantity(quantities, slug, 1);
        }
    }

    return quantities;
}

export function sumInventoryWeight(
    inventory: CharacterInventory | undefined,
    system: SystemKey
): number {
    let total = 0;

    for (const [slug, quantity] of listCarriedQuantities(inventory)) {
        const entry = getItem(slug, system);
        total += parseItemWeight(entry?.weight) * quantity;
    }

    return total;
}

export function deriveCarryingCapacity(
    strength: number,
    system: SystemKey
): number | undefined {
    return getSystemRules(system).carrying?.deriveCapacity(strength);
}

export function formatCarriedWeight(value: number): string {
    if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-6) {
        return String(Math.round(value));
    }

    return (Math.round(value * 10) / 10).toFixed(1);
}
