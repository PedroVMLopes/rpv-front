import type { CharacterInventory } from "@rpv/domain";
import {
    canEquipItem,
    getItem,
    isItemStackable,
    isValidEquipmentSlot,
} from "@rpv/content";
import type { SystemKey } from "@/presets";

function coerceSlug(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const slug = value.trim().toLowerCase();
    return slug.length > 0 ? slug : undefined;
}

function isValidItemSlug(slug: string, system: SystemKey): boolean {
    return getItem(slug, system) !== undefined;
}

function mergeBagStacks(stacks: CharacterInventory["bag"]): CharacterInventory["bag"] {
    const merged = new Map<string, number>();

    for (const stack of stacks) {
        merged.set(stack.slug, (merged.get(stack.slug) ?? 0) + stack.quantity);
    }

    return Array.from(merged.entries()).map(([slug, quantity]) => ({
        slug,
        quantity,
    }));
}

function sanitizeBag(
    bag: CharacterInventory["bag"],
    system: SystemKey
): CharacterInventory["bag"] {
    const validStacks = bag.flatMap((stack) => {
        const slug = coerceSlug(stack.slug);
        if (!slug || stack.quantity < 1 || !isValidItemSlug(slug, system)) {
            return [];
        }

        const entry = getItem(slug, system);
        const quantity =
            entry && !isItemStackable(entry)
                ? Math.min(stack.quantity, 1)
                : stack.quantity;

        return [{ slug, quantity }];
    });

    return mergeBagStacks(validStacks);
}

function sanitizeEquipped(
    equipped: CharacterInventory["equipped"],
    system: SystemKey
): CharacterInventory["equipped"] {
    const next: CharacterInventory["equipped"] = {};
    const seenSlugs = new Set<string>();

    for (const [slotId, rawSlug] of Object.entries(equipped)) {
        const slug = coerceSlug(rawSlug);
        if (
            !slug ||
            !isValidEquipmentSlot(slotId, system) ||
            !canEquipItem(slug, slotId, system) ||
            seenSlugs.has(slug)
        ) {
            continue;
        }

        next[slotId] = slug;
        seenSlugs.add(slug);
    }

    return next;
}

function reconcileEquippedWithBag(
    bag: CharacterInventory["bag"],
    equipped: CharacterInventory["equipped"]
): { bag: CharacterInventory["bag"]; equipped: CharacterInventory["equipped"] } {
    const bagCounts = new Map(bag.map((stack) => [stack.slug, stack.quantity]));
    const nextEquipped: CharacterInventory["equipped"] = {};

    for (const [slotId, slug] of Object.entries(equipped)) {
        const available = bagCounts.get(slug) ?? 0;
        if (available > 0) {
            bagCounts.set(slug, available - 1);
        }

        nextEquipped[slotId] = slug;
    }

    const nextBag = Array.from(bagCounts.entries())
        .filter(([, quantity]) => quantity > 0)
        .map(([slug, quantity]) => ({ slug, quantity }));

    return { bag: nextBag, equipped: nextEquipped };
}

function decrementBag(
    bag: CharacterInventory["bag"],
    slug: string,
    quantity: number
): CharacterInventory["bag"] {
    return bag
        .map((stack) =>
            stack.slug === slug
                ? { ...stack, quantity: stack.quantity - quantity }
                : stack
        )
        .filter((stack) => stack.quantity > 0);
}

function getBagQuantity(bag: CharacterInventory["bag"], slug: string): number {
    return bag.find((stack) => stack.slug === slug)?.quantity ?? 0;
}

function isSlugEquippedElsewhere(
    equipped: CharacterInventory["equipped"],
    slug: string,
    slotId: string
): boolean {
    return Object.entries(equipped).some(
        ([existingSlotId, existingSlug]) =>
            existingSlotId !== slotId && existingSlug === slug
    );
}

export function sanitizeInventory(
    inventory: CharacterInventory,
    system: SystemKey
): CharacterInventory {
    const bag = sanitizeBag(inventory.bag ?? [], system);
    const equipped = sanitizeEquipped(inventory.equipped ?? {}, system);

    return reconcileEquippedWithBag(bag, equipped);
}

export function equippedItemSlugs(inventory: CharacterInventory): string[] {
    return [...new Set(Object.values(inventory.equipped ?? {}))];
}

export function addToBag(
    inventory: CharacterInventory,
    slug: string,
    quantity = 1
): CharacterInventory {
    const normalizedSlug = coerceSlug(slug);
    if (!normalizedSlug || quantity < 1) {
        return inventory;
    }

    const existing = inventory.bag.find((stack) => stack.slug === normalizedSlug);
    if (existing) {
        return {
            ...inventory,
            bag: inventory.bag.map((stack) =>
                stack.slug === normalizedSlug
                    ? { ...stack, quantity: stack.quantity + quantity }
                    : stack
            ),
        };
    }

    return {
        ...inventory,
        bag: [...inventory.bag, { slug: normalizedSlug, quantity }],
    };
}

export function removeFromBag(
    inventory: CharacterInventory,
    slug: string,
    quantity = 1
): CharacterInventory {
    const normalizedSlug = coerceSlug(slug);
    if (!normalizedSlug || quantity < 1) {
        return inventory;
    }

    const existing = inventory.bag.find((stack) => stack.slug === normalizedSlug);
    if (!existing || existing.quantity < quantity) {
        return inventory;
    }

    const nextQuantity = existing.quantity - quantity;
    if (nextQuantity === 0) {
        return {
            ...inventory,
            bag: inventory.bag.filter((stack) => stack.slug !== normalizedSlug),
        };
    }

    return {
        ...inventory,
        bag: inventory.bag.map((stack) =>
            stack.slug === normalizedSlug
                ? { ...stack, quantity: nextQuantity }
                : stack
        ),
    };
}

// TODO(inventory-ui): when the slot is occupied, future UI should ask whether to
// send the new item to the bag or equip it by moving the current item back to
// the bag. For now equipItem fails (no-op).
export function equipItem(
    inventory: CharacterInventory,
    slotId: string,
    slug: string,
    system: SystemKey
): CharacterInventory {
    const normalizedSlug = coerceSlug(slug);
    if (
        !normalizedSlug ||
        !canEquipItem(normalizedSlug, slotId, system) ||
        inventory.equipped[slotId] ||
        isSlugEquippedElsewhere(inventory.equipped, normalizedSlug, slotId) ||
        getBagQuantity(inventory.bag, normalizedSlug) < 1
    ) {
        return inventory;
    }

    return {
        bag: decrementBag(inventory.bag, normalizedSlug, 1),
        equipped: {
            ...inventory.equipped,
            [slotId]: normalizedSlug,
        },
    };
}

export function unequipItem(
    inventory: CharacterInventory,
    slotId: string,
    _system: SystemKey
): CharacterInventory {
    const slug = inventory.equipped[slotId];
    if (!slug) {
        return inventory;
    }

    const { [slotId]: _removed, ...remainingEquipped } = inventory.equipped;

    return addToBag(
        {
            ...inventory,
            equipped: remainingEquipped,
        },
        slug,
        1
    );
}

export function isCharacterInventory(value: unknown): value is CharacterInventory {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const record = value as Record<string, unknown>;
    if (!Array.isArray(record.bag) || !record.equipped || typeof record.equipped !== "object") {
        return false;
    }

    return record.bag.every(
        (stack) =>
            stack &&
            typeof stack === "object" &&
            typeof (stack as ItemStackCandidate).slug === "string" &&
            typeof (stack as ItemStackCandidate).quantity === "number"
    );
}

type ItemStackCandidate = { slug: string; quantity: number };
