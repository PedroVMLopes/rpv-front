import type { CharacterInventory, Locale, ModifierSource } from "@rpv/domain";
import {
    collectCurrencyChoiceGrants,
    collectExclusiveGroupChoices,
    collectInventoryItemChoiceGrants,
    extractInventoryItemGrants,
    listLanguages,
    resolveGrantPool,
    type CurrencyChoiceGrant,
    type ExclusiveGroupChoice,
    type InventoryItemChoiceGrant,
} from "@rpv/content";
import type { SystemKey } from "@/presets";
import { contentRepo } from "@/lib/content/contentRepository";
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
import { filterStartingGrantsForEntry } from "./startingEquipmentGrants";

export type StartingEquipmentFixedItem = {
    slug: string;
    name: string;
    quantity: number;
    source: ModifierSource;
};

export type StartingEquipmentChoiceGrant = InventoryItemChoiceGrant & {
    source: ModifierSource;
};

export type StartingEquipmentCurrencyChoiceGrant = CurrencyChoiceGrant & {
    source: ModifierSource;
};

export type StartingEquipmentExclusiveGroupChoice = ExclusiveGroupChoice;

export type StartingEquipmentPreview = {
    exclusiveGroups: StartingEquipmentExclusiveGroupChoice[];
    fixedItems: StartingEquipmentFixedItem[];
    choiceGrants: StartingEquipmentChoiceGrant[];
    currencyChoiceGrants: StartingEquipmentCurrencyChoiceGrant[];
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
    system: SystemKey,
    locale: Locale = "en"
): PendingChoiceGrant {
    const pool = resolveGrantPool(choice.grant, {
        spells: contentRepo(system).listSpells(locale),
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

export function currencyChoiceToPending(
    choice: StartingEquipmentCurrencyChoiceGrant
): PendingChoiceGrant {
    const options =
        choice.grant.options
            ?.map((option, index) => {
                if (option.optionType !== "currency") {
                    return null;
                }

                const label =
                    option.label?.trim() ||
                    `${option.amount} ${option.ref}`;

                return { value: String(index), label };
            })
            .filter(
                (option): option is { value: string; label: string } =>
                    option !== null
            ) ?? [];

    return {
        key: choice.key,
        grant: choice.grant,
        source: choice.source,
        label: choice.label,
        options,
    };
}

export function deriveStartingEquipmentFromForm(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey
): StartingEquipmentPreview {
    const characterLevel = readLevelFromForm(formData);
    const grantPicks =
        (formData.choices as { grantPicks?: Record<string, string> } | undefined)
            ?.grantPicks ?? {};

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

    const exclusiveGroups: StartingEquipmentExclusiveGroupChoice[] = [];
    const fixedItems: StartingEquipmentFixedItem[] = [];
    const choiceGrants: StartingEquipmentChoiceGrant[] = [];
    const currencyChoiceGrants: StartingEquipmentCurrencyChoiceGrant[] = [];

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel
    )) {
        if (!STARTING_EQUIPMENT_SOURCES.has(entry.source.type)) {
            continue;
        }

        exclusiveGroups.push(
            ...collectExclusiveGroupChoices(
                entry.grants,
                entry.source,
                entry.featureLevel
            )
        );

        const filtered = filterStartingGrantsForEntry(
            entry.grants,
            grantPicks,
            entry
        );

        for (const item of extractInventoryItemGrants(filtered)) {
            const itemEntry = contentRepo(system).getItem(item.slug, locale);
            fixedItems.push({
                slug: item.slug,
                name: itemEntry?.name ?? item.slug,
                quantity: item.quantity,
                source: entry.source,
            });
        }

        choiceGrants.push(
            ...collectInventoryItemChoiceGrants(
                filtered,
                entry.source,
                entry.featureLevel
            ).map((choice) => ({
                ...choice,
                source: entry.source,
            }))
        );

        currencyChoiceGrants.push(
            ...collectCurrencyChoiceGrants(
                filtered,
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
        exclusiveGroups,
        fixedItems,
        choiceGrants,
        currencyChoiceGrants,
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
        preview.exclusiveGroups.length > 0 ||
        preview.fixedItems.length > 0 ||
        preview.choiceGrants.length > 0 ||
        preview.currencyChoiceGrants.length > 0 ||
        preview.bag.length > 0 ||
        hasGrantedCurrency
    );
}

export function collectStartingEquipmentExclusiveGroups(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey
): StartingEquipmentExclusiveGroupChoice[] {
    const characterLevel = readLevelFromForm(formData);
    const selections = buildSelectionsFromForm(formData);
    const groups: StartingEquipmentExclusiveGroupChoice[] = [];

    for (const entry of collectGrantSources(
        selections,
        locale,
        characterLevel
    )) {
        if (!STARTING_EQUIPMENT_SOURCES.has(entry.source.type)) {
            continue;
        }

        groups.push(
            ...collectExclusiveGroupChoices(
                entry.grants,
                entry.source,
                entry.featureLevel
            )
        );
    }

    return groups;
}

export function collectStartingEquipmentCurrencyChoices(
    formData: Record<string, unknown>,
    locale: Locale,
    system: SystemKey
): StartingEquipmentCurrencyChoiceGrant[] {
    const preview = deriveStartingEquipmentFromForm(formData, locale, system);
    return preview.currencyChoiceGrants;
}
