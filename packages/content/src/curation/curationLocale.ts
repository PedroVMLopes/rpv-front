import type { Locale } from "@rpv/domain";
import ptBRTranslations from "../../data/translations/pt-BR.json";
import type { CatalogEntryTranslation, CatalogTranslations } from "../catalog/catalog.types";
import type { FlavorTable } from "./flavorTable.types";

const translationsByLocale: Partial<Record<Locale, CatalogTranslations>> = {
    "pt-BR": ptBRTranslations as CatalogTranslations,
};

function overlayFor(locale: Locale): CatalogTranslations | undefined {
    return translationsByLocale[locale];
}

function hasFlavorTables(
    entry: object
): entry is { flavorTables: FlavorTable[] } {
    return (
        "flavorTables" in entry &&
        Array.isArray((entry as { flavorTables?: unknown }).flavorTables)
    );
}

function overlayFlavorTables(
    tables: FlavorTable[],
    overlay: NonNullable<CatalogEntryTranslation["flavorTables"]>
): FlavorTable[] {
    return tables.map((table) => {
        const optionOverlay = overlay[table.slug]?.options;
        if (!optionOverlay) {
            return table;
        }

        return {
            ...table,
            options: table.options.map((option) => ({
                ...option,
                label: optionOverlay[option.slug] ?? option.label,
            })),
        };
    });
}

export function localizeCurationEntry<
    T extends { slug: string; name: string; description?: string }
>(
    entry: T,
    overlayKey: keyof CatalogTranslations,
    locale?: Locale
): T {
    if (!locale || locale === "en") {
        return entry;
    }

    const overlay = overlayFor(locale)?.[overlayKey]?.[entry.slug];
    if (!overlay) {
        return entry;
    }

    const localized = {
        ...entry,
        name: overlay.name ?? entry.name,
        description: overlay.description ?? entry.description,
    };

    if (!hasFlavorTables(entry) || !overlay.flavorTables) {
        return localized;
    }

    return {
        ...localized,
        flavorTables: overlayFlavorTables(
            entry.flavorTables,
            overlay.flavorTables
        ),
    };
}

export type { CatalogEntryTranslation };
