import type { CharacterInventory, Locale } from "@rpv/domain";
import {
    extractInventoryItemGrants,
    getItem,
    inventoryGrantProvenance,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { addToBag } from "./inventory";
import { collectGrantSources } from "./characterGrants";
import type { CharacterSelections } from "./storedCharacter";

export function materializeInventoryGrants(
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel: number
): CharacterInventory["bag"] {
    let inventory = { bag: [] as CharacterInventory["bag"], equipped: {} };
    const sources = collectGrantSources(selections, locale, characterLevel);

    for (const entry of sources) {
        // v1: background only; class starting equipment comes in a later etapa.
        if (entry.source.type !== "background") {
            continue;
        }

        const grants = extractInventoryItemGrants(entry.grants);
        for (const grant of grants) {
            if (!getItem(grant.slug, system)) {
                continue;
            }

            const provenance = inventoryGrantProvenance(
                entry.source.type,
                entry.source.id,
                grant.grantIndex
            );

            inventory = addToBag(
                inventory,
                grant.slug,
                grant.quantity,
                provenance
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
    const sources = collectGrantSources(selections, locale, characterLevel);

    for (const entry of sources) {
        if (entry.source.type !== "background") {
            continue;
        }

        for (const grant of extractInventoryItemGrants(entry.grants)) {
            if (grant.slug !== slug || !getItem(grant.slug, system)) {
                continue;
            }

            return inventoryGrantProvenance(
                entry.source.type,
                entry.source.id,
                grant.grantIndex
            );
        }
    }

    return undefined;
}

export function mergeInventoryWithGrants(
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel: number
): CharacterSelections {
    const manualBag = (selections.inventory?.bag ?? []).filter(
        (stack) => !stack.provenance
    );
    const grantedBag = materializeInventoryGrants(
        selections,
        locale,
        system,
        characterLevel
    );

    return {
        ...selections,
        inventory: {
            ...selections.inventory,
            bag: [...manualBag, ...grantedBag],
            equipped: selections.inventory?.equipped ?? {},
        },
    };
}
