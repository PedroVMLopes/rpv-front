import type { Locale } from "@rpv/domain";
import ptBRTranslations from "../../data/translations/pt-BR.json";
import type { CatalogEntryTranslation, CatalogTranslations } from "../catalog/catalog.types";

const translationsByLocale: Partial<Record<Locale, CatalogTranslations>> = {
    "pt-BR": ptBRTranslations as CatalogTranslations,
};

function overlayFor(locale: Locale): CatalogTranslations | undefined {
    return translationsByLocale[locale];
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

    return {
        ...entry,
        name: overlay.name ?? entry.name,
        description: overlay.description ?? entry.description,
    };
}

export type { CatalogEntryTranslation };
