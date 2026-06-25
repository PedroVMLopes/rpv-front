import type { CharacterInventory, Locale, ModifierSource } from "@rpv/domain";
import {
    collectInventoryItemChoiceGrants,
    extractInventoryItemGrants,
    getItem,
    listLanguages,
    resolveGrantPool,
    type InventoryItemChoiceGrant,
} from "@rpv/content";
import { catalog } from "@rpv/content";
import type { SystemKey } from "@/presets";
import { buildSelectionsFromForm } from "./characterAdapter";
import { collectGrantSources } from "./characterGrants";
import type { PendingChoiceGrant } from "./grantChoices";
import { readLevelFromForm } from "./level";
import { mergeStartingGrants } from "./materializeInventoryGrants";
import {
    getManualCurrency,
    STARTING_EQUIPMENT_SOURCES,
} from "./materializeCurrencyGrants";
import { sanitizeSelections } from "./grantPickSanitize";

export type StartingEquipmentFixedItem = {
    slug: string;
    name: string;
    quantity: number;
    source: ModifierSource;
};

export type StartingEquipmentChoiceGrant = InventoryItemChoiceGrant & {
    source: ModifierSource;
};

export type StartingEquipmentPreview = {
    fixedItems: StartingEquipmentFixedItem[];
    choiceGrants: StartingEquipmentChoiceGrant[];
    bag: CharacterInventory["bag"];
    manualCurrency: Record<string, number>;
    grantedCurrency: Record<string, number>;
    totalCurrency: Record<string, number>;
};

function mergeCurrencyTotals(
    manual: Record<string, number>,
    granted: Record<string, number>
): Record<string, number> {
    const refs = new Set([...Object.keys(manual), ...Object.keys(granted)]);
    const totals: Record<string, number> = {};

    for (const ref of refs) {
        totals[ref] = (manual[ref] ?? 0) + (granted[ref] ?? 0);
    }

    return totals;
}

export function inventoryChoiceToPending(
    choice: StartingEquipmentChoiceGrant,
    system: SystemKey
): PendingChoiceGrant {
    const pool = resolveGrantPool(choice.grant, {
        spells: catalog.spells,
        languages: listLanguages(),
        system,
    });

    return {
        key: choice.key,
        grant: choice.grant,
        source: choice.source,
        label: choice.label,
        options: pool.inventoryOptions ?? [],
    };
}

export function deriveStartingEquipmentFromForm(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey
): StartingEquipmentPreview {
    const characterLevel = readLevelFromForm(formData);
    let selections = sanitizeSelections(
        buildSelectionsFromForm(formData),
        locale,
        system,
        characterLevel
    );
    selections = mergeStartingGrants(
        selections,
        locale,
        system,
        characterLevel
    );

    const fixedItems: StartingEquipmentFixedItem[] = [];
    const choiceGrants: StartingEquipmentChoiceGrant[] = [];

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel
    )) {
        if (!STARTING_EQUIPMENT_SOURCES.has(entry.source.type)) {
            continue;
        }

        for (const item of extractInventoryItemGrants(entry.grants)) {
            const itemEntry = getItem(item.slug, system);
            fixedItems.push({
                slug: item.slug,
                name: itemEntry?.name ?? item.slug,
                quantity: item.quantity,
                source: entry.source,
            });
        }

        choiceGrants.push(
            ...collectInventoryItemChoiceGrants(
                entry.grants,
                entry.source,
                entry.featureLevel
            ).map((choice) => ({
                ...choice,
                source: entry.source,
            }))
        );
    }

    const manualCurrency = getManualCurrency(formData);
    const grantedCurrency = selections.grantedCurrency ?? {};

    return {
        fixedItems,
        choiceGrants,
        bag: selections.inventory?.bag ?? [],
        manualCurrency,
        grantedCurrency,
        totalCurrency: mergeCurrencyTotals(manualCurrency, grantedCurrency),
    };
}

export function getTotalCurrencyFromForm(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey
): Record<string, number> {
    return deriveStartingEquipmentFromForm(formData, locale, system).totalCurrency;
}

export function hasStartingEquipmentContent(
    preview: StartingEquipmentPreview
): boolean {
    const hasGrantedCurrency = Object.values(preview.grantedCurrency).some(
        (amount) => amount > 0
    );

    return (
        preview.fixedItems.length > 0 ||
        preview.choiceGrants.length > 0 ||
        preview.bag.length > 0 ||
        hasGrantedCurrency
    );
}
