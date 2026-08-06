import type { CharacterInventory } from "@rpv/domain";
import {
    getItem,
    isItemStackable,
    isMultiEquipmentSlot,
    isRangedWeaponItem,
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

function stackMergeKey(stack: { slug: string; provenance?: string }): string {
    return `${stack.slug}\0${stack.provenance ?? ""}`;
}

export function bagStackReactKey(stack: {
    slug: string;
    provenance?: string;
}): string {
    return stack.provenance
        ? `${stack.slug}:${stack.provenance}`
        : `${stack.slug}:manual`;
}

function mergeBagStacks(stacks: CharacterInventory["bag"]): CharacterInventory["bag"] {
    const merged = new Map<string, CharacterInventory["bag"][number]>();

    for (const stack of stacks) {
        const key = stackMergeKey(stack);
        const existing = merged.get(key);
        if (existing) {
            merged.set(key, {
                ...existing,
                quantity: existing.quantity + stack.quantity,
            });
            continue;
        }

        merged.set(key, { ...stack });
    }

    return Array.from(merged.values());
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

        return [
            {
                slug,
                quantity,
                ...(stack.provenance ? { provenance: stack.provenance } : {}),
            },
        ];
    });

    return mergeBagStacks(validStacks);
}

/** Migrate legacy pilot slot ids to BG3-style ids before validation. */
export function migrateLegacyEquippedSlots(
    equipped: Record<string, string>,
    system: SystemKey
): Record<string, string> {
    const next: Record<string, string> = {};

    for (const [slotId, rawSlug] of Object.entries(equipped)) {
        const slug = coerceSlug(rawSlug);
        if (!slug) {
            continue;
        }

        let migratedSlot = slotId;
        if (slotId === "armor") {
            migratedSlot = "breast";
        } else if (slotId === "neck") {
            migratedSlot = "amulet";
        } else if (slotId === "main-hand") {
            const item = getItem(slug, system);
            migratedSlot = isRangedWeaponItem(item) ? "ranged-main" : "melee-main";
        } else if (slotId === "off-hand") {
            migratedSlot = "melee-off";
        }

        if (next[migratedSlot] === undefined) {
            next[migratedSlot] = slug;
        }
    }

    return next;
}

function sanitizeEquipped(
    equipped: CharacterInventory["equipped"],
    system: SystemKey
): CharacterInventory["equipped"] {
    const migrated = migrateLegacyEquippedSlots(equipped, system);
    const next: CharacterInventory["equipped"] = {};
    const seenSlugs = new Set<string>();

    for (const [slotId, rawSlug] of Object.entries(migrated)) {
        const slug = coerceSlug(rawSlug);
        if (
            !slug ||
            !isValidEquipmentSlot(slotId, system) ||
            isMultiEquipmentSlot(slotId, system) ||
            !isValidItemSlug(slug, system) ||
            seenSlugs.has(slug)
        ) {
            continue;
        }

        next[slotId] = slug;
        seenSlugs.add(slug);
    }

    return next;
}

function sanitizeEquippedMulti(
    equippedMulti: CharacterInventory["equippedMulti"] | undefined,
    system: SystemKey,
    reservedSlugs: Set<string>
): CharacterInventory["equippedMulti"] {
    const next: CharacterInventory["equippedMulti"] = {};

    for (const [slotId, rawSlugs] of Object.entries(equippedMulti ?? {})) {
        if (!isMultiEquipmentSlot(slotId, system) || !Array.isArray(rawSlugs)) {
            continue;
        }

        const slugs: string[] = [];
        for (const raw of rawSlugs) {
            const slug = coerceSlug(raw);
            if (
                !slug ||
                !isValidItemSlug(slug, system) ||
                reservedSlugs.has(slug) ||
                slugs.includes(slug)
            ) {
                continue;
            }
            slugs.push(slug);
            reservedSlugs.add(slug);
        }

        if (slugs.length > 0) {
            next[slotId] = slugs;
        }
    }

    return next;
}

function countEquippedSlugs(
    equipped: CharacterInventory["equipped"],
    equippedMulti: CharacterInventory["equippedMulti"]
): Map<string, number> {
    const counts = new Map<string, number>();

    for (const slug of Object.values(equipped)) {
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }

    for (const slugs of Object.values(equippedMulti)) {
        for (const slug of slugs) {
            counts.set(slug, (counts.get(slug) ?? 0) + 1);
        }
    }

    return counts;
}

function reconcileEquippedWithBag(
    bag: CharacterInventory["bag"],
    equipped: CharacterInventory["equipped"],
    equippedMulti: CharacterInventory["equippedMulti"]
): CharacterInventory {
    const remainingBag = bag.map((stack) => ({ ...stack }));
    const equippedCounts = countEquippedSlugs(equipped, equippedMulti);

    for (const [slug, needed] of equippedCounts) {
        let toRemove = needed;

        for (let index = 0; index < remainingBag.length && toRemove > 0; index++) {
            const stack = remainingBag[index];
            if (stack.slug !== slug) {
                continue;
            }

            const take = Math.min(stack.quantity, toRemove);
            stack.quantity -= take;
            toRemove -= take;
        }
    }

    const nextBag = remainingBag.filter((stack) => stack.quantity > 0);

    return { bag: nextBag, equipped, equippedMulti };
}

function decrementBag(
    bag: CharacterInventory["bag"],
    slug: string,
    quantity: number
): CharacterInventory["bag"] {
    let remaining = quantity;
    const nextBag: CharacterInventory["bag"] = [];

    for (const stack of bag) {
        if (stack.slug !== slug || remaining <= 0) {
            nextBag.push(stack);
            continue;
        }

        const take = Math.min(stack.quantity, remaining);
        remaining -= take;
        const nextQuantity = stack.quantity - take;

        if (nextQuantity > 0) {
            nextBag.push({ ...stack, quantity: nextQuantity });
        }
    }

    return nextBag;
}

function getBagQuantity(bag: CharacterInventory["bag"], slug: string): number {
    return bag
        .filter((stack) => stack.slug === slug)
        .reduce((total, stack) => total + stack.quantity, 0);
}

function findBagStackIndex(
    bag: CharacterInventory["bag"],
    slug: string,
    provenance?: string
): number {
    return bag.findIndex(
        (stack) =>
            stack.slug === slug &&
            (stack.provenance ?? undefined) === (provenance ?? undefined)
    );
}

function findRemovableBagStackIndex(
    bag: CharacterInventory["bag"],
    slug: string
): number {
    const manualIndex = bag.findIndex(
        (stack) => stack.slug === slug && !stack.provenance
    );
    if (manualIndex >= 0) {
        return manualIndex;
    }

    return bag.findIndex((stack) => stack.slug === slug);
}

function isSlugEquippedAnywhere(
    inventory: CharacterInventory,
    slug: string,
    except?: { kind: "single"; slotId: string } | { kind: "multi"; slotId: string }
): boolean {
    for (const [slotId, equippedSlug] of Object.entries(inventory.equipped)) {
        if (
            except?.kind === "single" &&
            except.slotId === slotId
        ) {
            continue;
        }
        if (equippedSlug === slug) {
            return true;
        }
    }

    for (const [slotId, slugs] of Object.entries(inventory.equippedMulti ?? {})) {
        if (except?.kind === "multi" && except.slotId === slotId) {
            continue;
        }
        if (slugs.includes(slug)) {
            return true;
        }
    }

    return false;
}

export function sanitizeInventory(
    inventory: CharacterInventory | (Partial<CharacterInventory> & { bag?: CharacterInventory["bag"]; equipped?: CharacterInventory["equipped"] }),
    system: SystemKey
): CharacterInventory {
    const bag = sanitizeBag(inventory.bag ?? [], system);
    const equipped = sanitizeEquipped(inventory.equipped ?? {}, system);
    const reserved = new Set(Object.values(equipped));
    const equippedMulti = sanitizeEquippedMulti(
        inventory.equippedMulti,
        system,
        reserved
    );

    return reconcileEquippedWithBag(bag, equipped, equippedMulti);
}

export function equippedItemSlugs(inventory: CharacterInventory): string[] {
    return [...new Set(Object.values(inventory.equipped ?? {}))];
}

export function addToBag(
    inventory: CharacterInventory,
    slug: string,
    quantity = 1,
    provenance?: string
): CharacterInventory {
    const normalizedSlug = coerceSlug(slug);
    if (!normalizedSlug || quantity < 1) {
        return inventory;
    }

    const existingIndex = findBagStackIndex(
        inventory.bag,
        normalizedSlug,
        provenance
    );
    if (existingIndex >= 0) {
        return {
            ...inventory,
            bag: inventory.bag.map((stack, index) =>
                index === existingIndex
                    ? { ...stack, quantity: stack.quantity + quantity }
                    : stack
            ),
        };
    }

    return {
        ...inventory,
        bag: [
            ...inventory.bag,
            {
                slug: normalizedSlug,
                quantity,
                ...(provenance ? { provenance } : {}),
            },
        ],
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

    const stackIndex = findRemovableBagStackIndex(inventory.bag, normalizedSlug);
    if (stackIndex < 0) {
        return inventory;
    }

    const existing = inventory.bag[stackIndex];
    if (existing.quantity < quantity) {
        return inventory;
    }

    const nextQuantity = existing.quantity - quantity;
    if (nextQuantity === 0) {
        return {
            ...inventory,
            bag: inventory.bag.filter((_, index) => index !== stackIndex),
        };
    }

    return {
        ...inventory,
        bag: inventory.bag.map((stack, index) =>
            index === stackIndex
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
    if (isMultiEquipmentSlot(slotId, system)) {
        return equipItemToMultiSlot(inventory, slotId, slug, system);
    }

    const normalizedSlug = coerceSlug(slug);
    const withMulti = {
        ...inventory,
        equippedMulti: inventory.equippedMulti ?? {},
    };

    if (
        !normalizedSlug ||
        !isValidEquipmentSlot(slotId, system) ||
        !isValidItemSlug(normalizedSlug, system) ||
        withMulti.equipped[slotId] ||
        isSlugEquippedAnywhere(withMulti, normalizedSlug, {
            kind: "single",
            slotId,
        }) ||
        getBagQuantity(withMulti.bag, normalizedSlug) < 1
    ) {
        return inventory;
    }

    return {
        bag: decrementBag(withMulti.bag, normalizedSlug, 1),
        equipped: {
            ...withMulti.equipped,
            [slotId]: normalizedSlug,
        },
        equippedMulti: withMulti.equippedMulti,
    };
}

export function equipItemToMultiSlot(
    inventory: CharacterInventory,
    slotId: string,
    slug: string,
    system: SystemKey
): CharacterInventory {
    const normalizedSlug = coerceSlug(slug);
    const withMulti = {
        ...inventory,
        equippedMulti: inventory.equippedMulti ?? {},
    };

    if (
        !normalizedSlug ||
        !isMultiEquipmentSlot(slotId, system) ||
        !isValidItemSlug(normalizedSlug, system) ||
        isSlugEquippedAnywhere(withMulti, normalizedSlug) ||
        getBagQuantity(withMulti.bag, normalizedSlug) < 1
    ) {
        return inventory;
    }

    const existing = withMulti.equippedMulti[slotId] ?? [];

    return {
        bag: decrementBag(withMulti.bag, normalizedSlug, 1),
        equipped: withMulti.equipped,
        equippedMulti: {
            ...withMulti.equippedMulti,
            [slotId]: [...existing, normalizedSlug],
        },
    };
}

export function unequipItem(
    inventory: CharacterInventory,
    slotId: string,
    _system: SystemKey,
    restoredProvenance?: string
): CharacterInventory {
    const withMulti = {
        ...inventory,
        equippedMulti: inventory.equippedMulti ?? {},
    };
    const slug = withMulti.equipped[slotId];
    if (!slug) {
        return inventory;
    }

    const { [slotId]: _removed, ...remainingEquipped } = withMulti.equipped;

    return addToBag(
        {
            ...withMulti,
            equipped: remainingEquipped,
        },
        slug,
        1,
        restoredProvenance
    );
}

export function unequipItemFromMultiSlot(
    inventory: CharacterInventory,
    slotId: string,
    slug: string,
    _system: SystemKey,
    restoredProvenance?: string
): CharacterInventory {
    const withMulti = {
        ...inventory,
        equippedMulti: inventory.equippedMulti ?? {},
    };
    const normalizedSlug = coerceSlug(slug);
    const list = withMulti.equippedMulti[slotId];
    if (!normalizedSlug || !list?.includes(normalizedSlug)) {
        return inventory;
    }

    const nextList = [...list];
    const index = nextList.indexOf(normalizedSlug);
    nextList.splice(index, 1);

    const nextMulti = { ...withMulti.equippedMulti };
    if (nextList.length === 0) {
        delete nextMulti[slotId];
    } else {
        nextMulti[slotId] = nextList;
    }

    return addToBag(
        {
            ...withMulti,
            equippedMulti: nextMulti,
        },
        normalizedSlug,
        1,
        restoredProvenance
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

    if (
        record.equippedMulti !== undefined &&
        (typeof record.equippedMulti !== "object" ||
            Array.isArray(record.equippedMulti) ||
            record.equippedMulti === null)
    ) {
        return false;
    }

    return record.bag.every(
        (stack) =>
            stack &&
            typeof stack === "object" &&
            typeof (stack as ItemStackCandidate).slug === "string" &&
            typeof (stack as ItemStackCandidate).quantity === "number" &&
            ((stack as ItemStackCandidate).provenance === undefined ||
                typeof (stack as ItemStackCandidate).provenance === "string")
    );
}

type ItemStackCandidate = {
    slug: string;
    quantity: number;
    provenance?: string;
};
