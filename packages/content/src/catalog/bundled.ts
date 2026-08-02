import type { Locale } from "@rpv/domain";
import catalogData from "../../data/catalog.json";
import ptBRTranslations from "../../data/translations/pt-BR.json";
import type { ItemEntry } from "../item/item.types";
import type { RaceCatalogEntry, SubraceCatalogEntry } from "../race/race.types";
import type { SpellCatalogEntry } from "../spell/spell.types";
import type { Catalog, CatalogTranslations, Language } from "./catalog.types";
import * as read from "./read";
import { mergeItemCatalog } from "../curation/itemOverlays.dnd";

export const catalog = catalogData as unknown as Catalog;

/**
 * Locale overlays bundled alongside the base (English) catalog. The base catalog
 * needs no entry here; only languages we translate into are listed.
 */
const translationsByLocale: Partial<Record<Locale, CatalogTranslations>> = {
    "pt-BR": ptBRTranslations as CatalogTranslations,
};

function overlayFor(locale: Locale): CatalogTranslations | undefined {
    return translationsByLocale[locale];
}

function localizeMergedItem(
    entry: ItemEntry,
    locale: Locale
): ItemEntry {
    if (locale === catalog.defaultLocale) {
        return entry;
    }
    const translation = overlayFor(locale)?.items?.[entry.slug];
    if (!translation) {
        return entry;
    }
    return {
        ...entry,
        name: translation.name ?? entry.name,
        description: translation.description ?? entry.description,
    };
}

function mergedItems(locale: Locale = catalog.defaultLocale): ItemEntry[] {
    const base = read.listItems(catalog, catalog.defaultLocale);
    return mergeItemCatalog(base).map((entry) => localizeMergedItem(entry, locale));
}

export function listRaces(locale: Locale = catalog.defaultLocale): RaceCatalogEntry[] {
    return read.listRaces(catalog, locale, overlayFor(locale));
}

export function getRace(
    slug: string,
    locale: Locale = catalog.defaultLocale
): RaceCatalogEntry | undefined {
    return read.getRace(catalog, slug, locale, overlayFor(locale));
}

export function getSubrace(
    slug: string,
    locale: Locale = catalog.defaultLocale
): SubraceCatalogEntry | undefined {
    return read.getSubrace(catalog, slug, locale, overlayFor(locale));
}

export function listSpells(locale: Locale = catalog.defaultLocale): SpellCatalogEntry[] {
    return read.listSpells(catalog, locale, overlayFor(locale));
}

export function getSpell(
    slug: string,
    locale: Locale = catalog.defaultLocale
): SpellCatalogEntry | undefined {
    return read.getSpell(catalog, slug, locale, overlayFor(locale));
}

export function listLanguages(): Language[] {
    return read.listLanguages(catalog);
}

export function getLanguage(slug: string): Language | undefined {
    return read.getLanguage(catalog, slug);
}

export function listItems(locale: Locale = catalog.defaultLocale): ItemEntry[] {
    return mergedItems(locale);
}

export function getItem(
    slug: string,
    locale: Locale = catalog.defaultLocale
): ItemEntry | undefined {
    return mergedItems(locale).find((entry) => entry.slug === slug);
}
