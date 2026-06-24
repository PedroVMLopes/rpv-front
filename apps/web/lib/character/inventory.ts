import type { CharacterInventory } from "@rpv/domain";
import { getItem } from "@rpv/content";
import type { SystemKey } from "@/presets";

function coerceSlug(value: unknown): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const slug = value.trim().toLowerCase();
    return slug.length > 0 ? slug : undefined;
}

function isValidItemSlug(slug: string, _system: SystemKey): boolean {
    return getItem(slug) !== undefined;
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

        return [{ slug, quantity: stack.quantity }];
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
        if (!slug || !isValidItemSlug(slug, system) || seenSlugs.has(slug)) {
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
