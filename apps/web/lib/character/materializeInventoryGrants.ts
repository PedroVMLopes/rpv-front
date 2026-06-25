import type { CharacterInventory, Locale } from "@rpv/domain";
import { getItem, resolveInventoryItemGrants } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { addToBag, sanitizeInventory } from "./inventory";
import { collectGrantSources } from "./characterGrants";
import { materializeCurrencyGrants, STARTING_EQUIPMENT_SOURCES } from "./materializeCurrencyGrants";
import { filterStartingGrantsForEntry } from "./startingEquipmentGrants";
import type { CharacterSelections } from "./storedCharacter";

export function materializeInventoryGrants(
    selections: CharacterSelections,
    locale: Locale,
    system: SystemKey,
    characterLevel: number
): CharacterInventory["bag"] {
    let inventory = { bag: [] as CharacterInventory["bag"], equipped: {} };
    const grantPicks = selections.choices.grantPicks ?? {};

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

export function mergeStartingGrants(
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
    const grantedCurrency = materializeCurrencyGrants(
        selections,
        locale,
        characterLevel
    );

    const inventory = sanitizeInventory(
        {
            ...selections.inventory,
            bag: [...manualBag, ...grantedBag],
            equipped: selections.inventory?.equipped ?? {},
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
