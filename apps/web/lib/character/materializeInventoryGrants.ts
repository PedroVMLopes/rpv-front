import type { CharacterInventory, Locale } from "@rpv/domain";
import { getItem, resolveInventoryItemGrants } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { addToBag, sanitizeInventory } from "./inventory";
import { collectGrantSources } from "./characterGrants";
import { materializeCurrencyGrants, STARTING_EQUIPMENT_SOURCES } from "./materializeCurrencyGrants";
import { filterStartingGrantsForEntry } from "./startingEquipmentGrants";
import type { CharacterSelections } from "./storedCharacter";

function pruneOrphanedGrantEquipped(
    mergedBag: CharacterInventory["bag"],
    equipped: CharacterInventory["equipped"],
    previousBag: CharacterInventory["bag"],
    newGrantedBag: CharacterInventory["bag"]
): CharacterInventory["equipped"] {
    const previousGrantedSlugs = new Set(
        previousBag
            .filter((stack) => stack.provenance)
            .map((stack) => stack.slug)
    );
    const newGrantedSlugs = new Set(newGrantedBag.map((stack) => stack.slug));
    const nextEquipped: CharacterInventory["equipped"] = { ...equipped };

    for (const [slotId, slug] of Object.entries(equipped)) {
        const wasGrantSourced = previousGrantedSlugs.has(slug);
        const stillGranted = newGrantedSlugs.has(slug);
        const manualBacked =
            previousBag.some(
                (stack) => stack.slug === slug && !stack.provenance
            ) ||
            mergedBag.some((stack) => stack.slug === slug && !stack.provenance);

        if (wasGrantSourced && !stillGranted && !manualBacked) {
            delete nextEquipped[slotId];
        }
    }

    return nextEquipped;
}

export function materializeInventoryGrants(
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel: number
): CharacterInventory["bag"] {
    let inventory = { bag: [] as CharacterInventory["bag"], equipped: {} };
    const grantPicks = selections.choices?.grantPicks ?? {};

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel
    )) {
        if (!STARTING_EQUIPMENT_SOURCES.has(entry.source.type)) {
            continue;
        }

        const resolved = resolveInventoryItemGrants(
            filterStartingGrantsForEntry(
                entry.grants,
                grantPicks,
                entry
            ),
            grantPicks,
            {
                sourceType: entry.source.type,
                sourceId: entry.source.id,
                featureLevel: entry.featureLevel,
                system,
            }
        );

        for (const item of resolved) {
            if (!getItem(item.slug, system) || !item.provenance) {
                continue;
            }

            inventory = addToBag(
                inventory,
                item.slug,
                item.quantity,
                item.provenance
            );
        }
    }

    return inventory.bag;
}

export function resolveInventoryGrantProvenance(
    selections: CharacterSelections,
    slug: string,
    locale: Locale,
    system: SystemKey,
    characterLevel: number
): string | undefined {
    const grantPicks = selections.choices.grantPicks ?? {};

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel
    )) {
        if (!STARTING_EQUIPMENT_SOURCES.has(entry.source.type)) {
            continue;
        }

        for (const item of resolveInventoryItemGrants(
            filterStartingGrantsForEntry(
                entry.grants,
                grantPicks,
                entry
            ),
            grantPicks,
            {
                sourceType: entry.source.type,
                sourceId: entry.source.id,
                featureLevel: entry.featureLevel,
                system,
            }
        )) {
            if (item.slug === slug && getItem(item.slug, system)) {
                return item.provenance;
            }
        }
    }

    return undefined;
}

function splitManualBagStacks(
    previousBag: CharacterInventory["bag"],
    grantedBag: CharacterInventory["bag"]
): CharacterInventory["bag"] {
    const grantedSlugs = new Set(grantedBag.map((stack) => stack.slug));

    return previousBag.filter(
        (stack) => !stack.provenance && !grantedSlugs.has(stack.slug)
    );
}

function countEquippedBySlug(
    equipped: CharacterInventory["equipped"],
    equippedMulti: CharacterInventory["equippedMulti"] | undefined
): Map<string, number> {
    const counts = new Map<string, number>();

    for (const slug of Object.values(equipped)) {
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }

    for (const slugs of Object.values(equippedMulti ?? {})) {
        for (const slug of slugs) {
            counts.set(slug, (counts.get(slug) ?? 0) + 1);
        }
    }

    return counts;
}

/**
 * Bag stacks are stored post-reconcile (remainder after equipped units).
 * Rematerializing grants must restore owned totals so sanitize/reconcile can
 * subtract equipped again without wiping quantity edits or double-decrementing.
 */
function withPreservedGrantedQuantities(
    previousBag: CharacterInventory["bag"],
    grantedBag: CharacterInventory["bag"],
    equipped: CharacterInventory["equipped"],
    equippedMulti: CharacterInventory["equippedMulti"] | undefined
): CharacterInventory["bag"] {
    const equippedCounts = countEquippedBySlug(equipped, equippedMulti);

    return grantedBag.map((granted) => {
        const previous = previousBag.find(
            (stack) =>
                stack.slug === granted.slug &&
                stack.provenance === granted.provenance
        ) ?? previousBag.find((stack) => stack.slug === granted.slug);
        if (!previous) {
            return granted;
        }

        const equippedCount = equippedCounts.get(granted.slug) ?? 0;
        return {
            ...granted,
            quantity: previous.quantity + equippedCount,
        };
    });
}

export function mergeStartingGrants(
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel: number
): CharacterSelections {
    const previousBag = selections.inventory?.bag ?? [];
    const previousEquipped = selections.inventory?.equipped ?? {};
    const previousEquippedMulti = selections.inventory?.equippedMulti;
    const grantedBag = materializeInventoryGrants(
        selections,
        locale,
        system,
        characterLevel
    );
    const manualBag = splitManualBagStacks(previousBag, grantedBag);
    const grantedCurrency = materializeCurrencyGrants(
        selections,
        locale,
        characterLevel
    );
    const preservedGranted = withPreservedGrantedQuantities(
        previousBag,
        grantedBag,
        previousEquipped,
        previousEquippedMulti
    );
    const mergedBag = [...manualBag, ...preservedGranted];

    const inventory = sanitizeInventory(
        {
            ...selections.inventory,
            bag: mergedBag,
            equipped: pruneOrphanedGrantEquipped(
                mergedBag,
                previousEquipped,
                previousBag,
                grantedBag
            ),
        },
        system
    );

    return {
        ...selections,
        inventory,
        grantedCurrency,
    };
}

/** @deprecated Use mergeStartingGrants */
export const mergeInventoryWithGrants = mergeStartingGrants;
